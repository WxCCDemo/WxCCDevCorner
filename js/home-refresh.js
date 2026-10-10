// Homepage — API Capabilities freshness
// Updates the live-relevant tags on the Solutions & Samples and Dev Radar
// cards in place (rather than appending new pills, which wrapped and
// duplicated numbers). No scheduler dependency: this just reflects
// whatever is currently committed to samples.html / data/latest.json at
// the moment the page is opened, the same way js/samples-refresh.js does
// for the gallery.

async function refreshHomeCapabilityStats() {
  // Live sample count from the actual gallery (curated + auto-added by scan.mjs).
  // Appended onto the existing "14 Playbooks" tag rather than as a
  // separate pill, since playbook count and sample count are related
  // but distinct — this keeps both visible in one place.
  try {
    const res = await fetch(`samples.html?_=${Date.now()}`, { cache: "no-store" });
    if (res.ok) {
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const count = doc.querySelectorAll(".sample-cards-grid .sample-card").length;
      const tag = document.querySelector("#samplesCapabilityTags .tag-cyan");
      if (tag && count) tag.textContent = `${tag.textContent} · ${count} live`;
    }
  } catch {
    // Leave the static "14 Playbooks" tag as the fallback
  }

  // Live last-scan freshness for the Dev Radar card. Replaces the generic
  // "Daily scan" label with the actual scan recency, since that's more
  // useful than a static cadence description and avoids a redundant tag.
  try {
    const res = await fetch(`data/latest.json?_=${Date.now()}`, { cache: "no-store" });
    if (res.ok) {
      const latest = await res.json();
      if (latest.generatedAt) {
        const days = Math.floor((Date.now() - new Date(latest.generatedAt).getTime()) / 86400000);
        const label = days < 1 ? "Scanned today" : days === 1 ? "Scanned 1 day ago" : `Scanned ${days}d ago`;
        const tag = document.querySelector("#radarCapabilityTags .tag-cyan");
        if (tag) tag.textContent = label;
      }
    }
  } catch {
    // Leave the static "Daily scan" tag as the fallback
  }
}

refreshHomeCapabilityStats();
