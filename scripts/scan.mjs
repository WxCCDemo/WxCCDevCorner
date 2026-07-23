import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");

const readJson = async (file) => JSON.parse(await readFile(path.join(dataDir, file), "utf8"));
const writeJson = async (file, value) => {
  await writeFile(path.join(dataDir, file), `${JSON.stringify(value, null, 2)}\n`);
};

const token = process.env.GITHUB_TOKEN;
const radarTimeZone = process.env.RADAR_TIMEZONE || "Asia/Singapore";
const MISSION_SUMMARY = "Track the latest Webex Contact Center API samples, SDK updates, flow templates, webhook patterns, and developer tooling.";
const headers = { "Accept": "application/vnd.github+json", "User-Agent": "wxcc-devcorner-radar" };
if (token) headers.Authorization = `Bearer ${token}`;

async function github(pathname) {
  const response = await fetch(`https://api.github.com${pathname}`, { headers });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${pathname}`);
  return response.json();
}

function radarDate(value) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: radarTimeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(value));
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function classify(text, categories) {
  const haystack = text.toLowerCase();
  return categories.filter((c) => {
    const needle = c.toLowerCase();
    if (needle === "byova/byods") return haystack.includes("byova") || haystack.includes("byods");
    return haystack.includes(needle) || haystack.includes(needle.replaceAll(" ", "-"));
  });
}

function repoSummary(repo, categories) {
  const text = `${repo.full_name} ${repo.description || ""} ${repo.topics?.join(" ") || ""}`;
  return {
    id: repo.id, fullName: repo.full_name, name: repo.name, owner: repo.owner.login,
    description: repo.description || "", url: repo.html_url, pushedAt: repo.pushed_at,
    updatedAt: repo.updated_at, stars: repo.stargazers_count, forks: repo.forks_count,
    language: repo.language || "Unknown", topics: repo.topics || [],
    categories: classify(text, categories), readme: null
  };
}

function cleanReadme(md) {
  return md.replace(/```[\s\S]*?```/g, " ").replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1").replace(/[#*_`>~|]/g, " ").replace(/\s+/g, " ").trim();
}

function cleanInline(md) {
  return md.replace(/!\[[^\]]*]\([^)]*\)/g, "").replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "").replace(/\s+/g, " ").trim();
}

function structuredReadme(markdown) {
  const lines = markdown.replace(/```[\s\S]*?```/g, "").split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const sections = [];
  let current = { title: "Overview", bullets: [] };
  for (const line of lines) {
    if (/^#{1,3}\s+/.test(line)) {
      if (current.bullets.length) sections.push(current);
      current = { title: cleanInline(line.replace(/^#{1,3}\s+/, "")), bullets: [] };
    } else if (/^[-*]\s+/.test(line)) {
      current.bullets.push(cleanInline(line.replace(/^[-*]\s+/, "")));
    } else {
      const c = cleanInline(line);
      if (c.length > 35) current.bullets.push(c);
    }
  }
  if (current.bullets.length) sections.push(current);
  return sections.map(s => ({ title: s.title, bullets: s.bullets.filter(Boolean).slice(0, 4) })).filter(s => s.bullets.length).slice(0, 3);
}

function excerpt(text, limit = 700) {
  if (!text) return "";
  return text.length <= limit ? text : `${text.slice(0, limit).trim()}...`;
}

function readmeHighlights(text) {
  return text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 45).slice(0, 4);
}

function previousRepoLookup(previous) {
  const entries = [...Object.entries(previous.repos || {}), ...Object.values(previous.discovery || {}).map(r => [r.fullName, r])];
  return new Map(entries);
}

async function addReadme(repo, previousRepos) {
  try {
    const readme = await github(`/repos/${repo.fullName}/readme`);
    const markdown = Buffer.from(readme.content || "", "base64").toString("utf8");
    const clean = cleanReadme(markdown);
    repo.readme = { url: readme.html_url || `${repo.url}#readme`, excerpt: excerpt(clean), highlights: readmeHighlights(clean), sections: structuredReadme(markdown) };
  } catch {
    repo.readme = previousRepos.get(repo.fullName)?.readme || null;
  }
  return repo;
}

function addTracking(repo, config) {
  repo.tracking = config.trackedRepoDetails?.[repo.fullName] || null;
  return repo;
}

async function generateReviewCards(candidates, categories, missionSummary) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("  Gemini: GEMINI_API_KEY not set, skipping review card generation.");
    return [];
  }
  if (!candidates.length) {
    console.log("  Gemini: no new candidates for review cards.");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are curating a "Review Later" list of business-oriented cards for a Webex Contact Center developer radar.
Mission: ${missionSummary}
Categories to choose from: ${categories.join(", ")}

For each item below, write ONE card as a JSON object with exactly these fields:
id (short kebab-case slug unique to this item), title, source (the given source URL, unchanged), category (single best fit from the categories list), status (always "review-later"), priority ("high", "medium", or "low"), objective (1 sentence), businessBenefits (1-2 sentences), appliesTo (1 sentence), howToUse (1-2 sentences), howToBuild (1-2 sentences), expectedOutcome (1 sentence), notes (1 short sentence).

Items:
${candidates.map((c, i) => `${i + 1}. Title: ${c.title}\n   Source: ${c.source}\n   Category hint: ${c.category}\n   Detail: ${c.detail}`).join("\n")}

Return ONLY a JSON array of exactly ${candidates.length} card objects in the same order as the items above. No other text.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    const generated = JSON.parse(response.text);
    const now = new Date().toISOString();
    const cards = generated.map((card, i) => ({
      ...card,
      source: candidates[i]?.source || card.source,
      createdAt: now,
      updatedAt: now
    }));
    console.log(`  Gemini: generated ${cards.length} review card(s).`);
    return cards;
  } catch (error) {
    console.log(`  Gemini: card generation failed (${error.message}).`);
    return [];
  }
}

const config = await readJson("config.json");
const previous = await readJson("snapshot.json");
const dailyHistory = await readJson("daily-history.json");
const previousRepos = previousRepoLookup(previous);
const generatedAt = new Date().toISOString();
const today = radarDate(generatedAt);
const trackedRepos = [], discovery = [], changes = [];

for (const repoName of config.trackedRepos) {
  try {
    const repo = addTracking(await addReadme(repoSummary(await github(`/repos/${repoName}`), config.categories), previousRepos), config);
    trackedRepos.push(repo);
    const before = previous.repos[repo.fullName];
    if (!before) {
      changes.push({ type: "new-tracked-repo", title: repo.fullName, source: repo.url, category: repo.categories[0] || "Tracked Repo", detectedAt: generatedAt, detail: repo.description || "Tracked repository added to the radar." });
    } else if (before.pushedAt !== repo.pushedAt) {
      changes.push({ type: "tracked-repo-updated", title: repo.fullName, source: repo.url, category: repo.categories[0] || "Tracked Repo", detectedAt: generatedAt, detail: `Repository pushed date changed from ${before.pushedAt} to ${repo.pushedAt}.` });
    }
  } catch (error) {
    const fallback = previousRepos.get(repoName);
    if (fallback) { fallback.fromCache = true; trackedRepos.push(addTracking(fallback, config)); }
    changes.push({ type: "scan-error", title: repoName, source: `https://github.com/${repoName}`, category: "Error", detectedAt: generatedAt, detail: error.message });
  }
}

for (const query of config.discoveryQueries) {
  try {
    const result = await github(`/search/repositories?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=5`);
    const items = [];
    for (const item of result.items) items.push(await addReadme(repoSummary(item, config.categories), previousRepos));
    discovery.push({ query, items });
    for (const item of items) {
      const key = `${query}:${item.fullName}`;
      if (!previous.discovery[key]) {
        changes.push({ type: "new-discovery-item", title: item.fullName, source: item.url, category: item.categories[0] || "Discovery", detectedAt: generatedAt, detail: item.description || `Discovered from query: ${query}` });
      }
    }
  } catch (error) {
    changes.push({ type: "scan-error", title: query, source: "https://github.com/search", category: "Error", detectedAt: generatedAt, detail: error.message });
  }
}

const nextSnapshot = {
  generatedAt,
  repos: Object.fromEntries(trackedRepos.map(r => [r.fullName, r])),
  discovery: Object.fromEntries(discovery.flatMap(g => g.items.map(r => [`${g.query}:${r.fullName}`, r])))
};

const day = dailyHistory.days[today] || { date: today, firstScanAt: generatedAt, lastScanAt: generatedAt, scanCount: 0, changes: [] };
day.changes = day.changes.filter(c => c.type !== "scan-error");
const meaningfulChanges = changes.filter(c => c.type !== "scan-error");
const scanErrors = changes.filter(c => c.type === "scan-error");
const existingKeys = new Set(day.changes.map(c => `${c.type}:${c.source}:${c.title}`));
const newDailyChanges = meaningfulChanges.filter(c => { const k = `${c.type}:${c.source}:${c.title}`; if (existingKeys.has(k)) return false; existingKeys.add(k); return true; });
day.lastScanAt = generatedAt;
day.scanCount += 1;
day.changes.push(...newDailyChanges);
dailyHistory.days[today] = day;

const latest = {
  generatedAt, date: today, mode: "daily", scanCount: day.scanCount,
  firstScanAt: day.firstScanAt, lastScanAt: day.lastScanAt, newThisRun: newDailyChanges.length,
  summary: {
    newRepos: day.changes.filter(c => c.type === "new-tracked-repo").length,
    updatedTrackedRepos: day.changes.filter(c => c.type === "tracked-repo-updated").length,
    newDiscoveryItems: day.changes.filter(c => c.type === "new-discovery-item").length
  },
  changes: day.changes, runChanges: newDailyChanges, scanErrors, trackedRepos, discovery
};

const existingCards = await readJson("cards.json");
const existingCardSources = new Set(existingCards.map((c) => c.source));
const cardCandidates = newDailyChanges
  .filter((c) => (c.type === "new-tracked-repo" || c.type === "new-discovery-item") && !existingCardSources.has(c.source))
  .slice(0, 6);
const newCards = await generateReviewCards(cardCandidates, config.categories, MISSION_SUMMARY);
const nextCards = [...existingCards, ...newCards];

await writeJson("cards.json", nextCards);
await writeJson("snapshot.json", nextSnapshot);
await writeJson("daily-history.json", dailyHistory);
await writeJson("latest.json", latest);
console.log(`Scan complete: ${newDailyChanges.length} new daily change(s), ${day.changes.length} total for ${today}. Cards: +${newCards.length} new, ${nextCards.length} total.`);
