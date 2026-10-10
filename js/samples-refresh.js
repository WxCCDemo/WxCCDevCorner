// Sample Gallery — live refresh status
// Reads data/latest.json (written by scripts/scan.mjs, either the daily
// cron in .github/workflows/scan.yml or a manual "Run workflow" trigger)
// and shows when the gallery was last scanned. Re-fetches on page load
// and on manual click of the Refresh button — no polling, no scheduler
// on this side, purely reflects whatever the scan last produced.

const samplesRefreshFmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

async function loadSamplesRefreshStatus() {
  const statusEl = document.getElementById("samplesRefreshStatus");
  const detailEl = document.getElementById("samplesRefreshDetail");
  const btn = document.getElementById("samplesRefreshBtn");
  if (!statusEl || !detailEl || !btn) return;

  btn.disabled = true;
  const prevLabel = btn.textContent;
  btn.textContent = "🔄 Checking…";

  try {
    const res = await fetch(`data/latest.json?_=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`data/latest.json responded ${res.status}`);
    const latest = await res.json();

    const when = latest.generatedAt ? samplesRefreshFmt.format(new Date(latest.generatedAt)) : "unknown";
    const newRepos = latest.summary?.newRepos || 0;
    const updatedRepos = latest.summary?.updatedTrackedRepos || 0;
    const newDiscovery = latest.summary?.newDiscoveryItems || 0;
    const hasChanges = newRepos || updatedRepos || newDiscovery;

    statusEl.textContent = `Last scanned ${when}`;
    detailEl.innerHTML = hasChanges
      ? `${newRepos} new repo(s), ${updatedRepos} update(s), ${newDiscovery} new discovery item(s) in the latest scan. See <a href="radar.html#changes">Dev Radar</a> for details.`
      : `No new changes since the last scan. New samples appear here automatically once detected.`;
  } catch (err) {
    statusEl.textContent = "Could not load latest scan status";
    detailEl.textContent = "data/latest.json wasn't reachable — it may not exist yet if a scan hasn't run.";
  } finally {
    btn.disabled = false;
    btn.textContent = prevLabel;
  }
}

document.getElementById("samplesRefreshBtn")?.addEventListener("click", loadSamplesRefreshStatus);
loadSamplesRefreshStatus();

// Auto-expire "New" badges on auto-added sample cards
// scripts/scan.mjs stamps every AI-generated card with data-added="YYYY-MM-DD"
// and a permanent .new-badge span — permanent because it's written once into
// samples.html at scan time and never touched again. This runs on every page
// load/refresh and hides the badge once a card is older than the cutoff, so
// "New" actually means new instead of "was new at some point in the past."
const NEW_BADGE_MAX_AGE_DAYS = 14;

function expireSampleNewBadges() {
  const cutoffMs = NEW_BADGE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();

  document.querySelectorAll(".sample-card[data-added]").forEach((card) => {
    const addedDate = new Date(card.getAttribute("data-added"));
    if (isNaN(addedDate.getTime())) return;

    const badge = card.querySelector(".new-badge");
    if (!badge) return;

    if (now - addedDate.getTime() > cutoffMs) {
      badge.remove();
    }
  });
}

expireSampleNewBadges();
