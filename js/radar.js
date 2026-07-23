const rdrState = { latest: null, cards: [], knowledge: null };
const rdrFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const when = v => v ? rdrFmt.format(new Date(v)) : 'Not scanned yet';

function pills(values = [], warm = false) {
  return `<div class="radar-pills">${values.map(v => `<span class="radar-pill ${warm ? 'warm' : ''}">${esc(v)}</span>`).join('')}</div>`;
}

function goTabBtn(label, tab) {
  return `<button class="radar-link-btn" data-open-tab="${esc(tab)}" type="button">${esc(label)}</button>`;
}

function linkList(links = []) {
  if (!links.length) return '';
  return `<div class="radar-link-row">${links.map(l => l.tab ? goTabBtn(l.label, l.tab) : `<a class="radar-link-btn" href="${esc(l.url)}" target="_blank" rel="noreferrer">${esc(l.label)}</a>`).join('')}</div>`;
}

function itemCard(change) {
  return `<article class="radar-item">
    <div class="radar-item-head">
      <div>
        <a href="${esc(change.source)}" target="_blank" rel="noreferrer">${esc(change.title)}</a>
        <p class="radar-meta">${esc(change.type)} &middot; ${when(change.detectedAt)}</p>
      </div>
      ${pills([change.category], change.type.includes('error'))}
    </div>
    <p class="radar-detail">${esc(change.detail)}</p>
  </article>`;
}

function splitPoints(text) {
  if (!text) return [];
  return text.replace(/\s+-\s+/g, '\n- ').split(/\n|(?<=[.!?])\s+/).map(l => l.replace(/^[-*]\s+/, '').trim()).filter(l => l.length > 35).slice(0, 6);
}

function readmeSections(repo) {
  if (repo.readme?.sections?.length) return repo.readme.sections;
  const points = repo.readme?.highlights?.length ? repo.readme.highlights : splitPoints(repo.readme?.excerpt);
  const sections = [];
  const intent = points.filter(p => /intent|designed|provides|captures/i.test(p)).slice(0, 3);
  const examples = points.filter(p => /sample|use case|flow|scenario/i.test(p)).slice(0, 4);
  const rest = points.filter(p => !intent.includes(p) && !examples.includes(p)).slice(0, 4);
  if (intent.length) sections.push({ title: 'Context', bullets: intent });
  if (examples.length) sections.push({ title: 'What it covers', bullets: examples });
  if (rest.length) sections.push({ title: 'Notes', bullets: rest });
  if (!sections.length && repo.readme?.excerpt) sections.push({ title: 'Overview', bullets: splitPoints(repo.readme.excerpt) });
  return sections.slice(0, 3);
}

function readmeBlock(repo) {
  if (!repo.readme?.excerpt) return '';
  const sections = readmeSections(repo);
  return `<div class="radar-readme">
    <span class="radar-readme-label">README context</span>
    <div class="radar-readme-sections">${sections.map(s => `<div class="radar-readme-section"><h4>${esc(s.title)}</h4><ul>${s.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>`).join('')}</div>
    <a class="radar-link-btn" href="${esc(repo.readme.url)}" target="_blank" rel="noreferrer">Open full README</a>
  </div>`;
}

function trackingBlock(repo) {
  const t = repo.tracking || { trackedBecause: 'Included in the radar because it matched the configured watchlist.', requestedBy: 'Discovery configuration', reviewFocus: 'Review README context and whether it should become a structured review card.' };
  return `<div class="radar-tracking">
    <div><strong>Why tracked</strong><p>${esc(t.trackedBecause)}</p></div>
    <div><strong>Requested by</strong><p>${esc(t.requestedBy)}</p></div>
    <div><strong>Review focus</strong><p>${esc(t.reviewFocus)}</p></div>
  </div>`;
}

function repoCard(repo, opts = {}) {
  return `<article class="radar-item">
    <div class="radar-item-head">
      <div>
        <a href="${esc(repo.url)}" target="_blank" rel="noreferrer">${esc(repo.fullName)}</a>
        <p class="radar-meta">${esc(repo.language)} &middot; ${repo.stars} stars &middot; pushed ${when(repo.pushedAt)}</p>
      </div>
      ${pills(repo.categories.length ? repo.categories : ['Watch'])}
    </div>
    <p class="radar-detail">${esc(repo.description || 'No description provided.')}</p>
    ${opts.showTracking ? trackingBlock(repo) : ''}
    ${opts.showReadme ? readmeBlock(repo) : ''}
  </article>`;
}

function laneCard(lane) {
  return `<article class="radar-item">
    <div class="radar-item-head"><div><h3 style="margin:0;font-size:15px;">${esc(lane.name)}</h3></div>${pills([lane.name])}</div>
    <div class="radar-field"><strong>Why it matters</strong><p>${esc(lane.whyItMatters)}</p></div>
    <div class="radar-field"><strong>Watch for</strong><p>${esc(lane.watchFor)}</p></div>
    <div class="radar-field"><strong>Business use</strong><p>${esc(lane.businessUse)}</p></div>
    <div class="radar-field"><strong>Build path</strong><p>${esc(lane.buildPath)}</p></div>
    ${linkList(lane.links || [])}
  </article>`;
}

function playbookCard(pb) {
  return `<article class="radar-item">
    <h3 style="margin:0 0 6px;font-size:15px;">${esc(pb.title)}</h3>
    <p class="radar-detail" style="margin-top:0;">${esc(pb.objective)}</p>
    <ol style="margin:10px 0 0;padding-left:18px;color:var(--text-secondary);font-size:13px;line-height:1.5;">${pb.steps.map(s => `<li style="margin-bottom:5px;">${esc(s)}</li>`).join('')}</ol>
    <div class="radar-field"><strong>Outcome</strong><p>${esc(pb.outcome)}</p></div>
    ${linkList(pb.links || [])}
  </article>`;
}

function definitionCard(item) {
  return `<article class="radar-item"><h3 style="margin:0 0 5px;font-size:14px;">${esc(item.term || item.name)}</h3><p class="radar-detail" style="margin:0;">${esc(item.meaning || item.purpose)}</p></article>`;
}

function reviewCard(c) {
  const fields = [
    ['Objective', c.objective],
    ['Business Benefits', c.businessBenefits],
    ['Applies To', c.appliesTo],
    ['How To Use It', c.howToUse],
    ['How To Build It', c.howToBuild],
    ['Expected Outcome', c.expectedOutcome]
  ];
  return `<article class="radar-item">
    <div class="radar-item-head">
      <div>
        <a href="${esc(c.source)}" target="_blank" rel="noreferrer">${esc(c.title)}</a>
        <p class="radar-meta">${esc(c.category)} &middot; ${esc(c.priority)} priority &middot; ${esc(c.status)}</p>
      </div>
      ${pills([c.category], c.priority === 'high')}
    </div>
    ${fields.map(([label, value]) => value ? `<div class="radar-field"><strong>${esc(label)}</strong><p>${esc(value)}</p></div>` : '').join('')}
  </article>`;
}

function briefingActionCard(title, value, detail, actions, category) {
  return `<article class="radar-item">
    <div class="radar-item-head"><div><h3 style="margin:0 0 4px;font-size:14px;">${esc(title)}</h3><p style="color:var(--accent-cyan);font-size:15px;font-weight:700;margin:0;line-height:1.35;">${esc(value)}</p></div>${pills([category])}</div>
    <p class="radar-detail">${esc(detail)}</p>
    <div class="radar-link-row">${actions.map(a => a.tab ? goTabBtn(a.label, a.tab) : `<a class="radar-link-btn" href="${esc(a.url)}" target="_blank">${esc(a.label)}</a>`).join('')}</div>
  </article>`;
}

function briefingLinkCard(title, items, detail, category) {
  return `<article class="radar-item">
    <div class="radar-item-head"><div><h3 style="margin:0 0 6px;font-size:14px;">${esc(title)}</h3>
      <div class="radar-stacked">${items.length ? items.map(i => `<a href="${esc(i.source)}" target="_blank" rel="noreferrer">${esc(i.title)}</a>`).join('') : '<span style="color:var(--text-muted);font-size:12px;">No new items</span>'}</div>
    </div>${pills([category])}</div>
    <p class="radar-detail">${esc(detail)}</p>
  </article>`;
}

function topCategories(latest) {
  const counts = new Map();
  const signals = latest.changes.filter(c => c.category && c.category !== 'Error');
  const fallback = latest.discovery.flatMap(g => g.items).flatMap(i => i.categories || []);
  (signals.length ? signals : fallback.map(c => ({ category: c }))).forEach(c => counts.set(c.category, (counts.get(c.category) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
}

function priorityItems(latest) {
  const changes = latest.changes.filter(c => !c.type.includes('error'));
  if (changes.length) return changes.slice(0, 4);
  return latest.discovery.flatMap(g => g.items).filter((r, i, a) => a.findIndex(x => x.fullName === r.fullName) === i).slice(0, 4).map(r => ({ title: r.fullName, source: r.url }));
}

function nextActions(latest) {
  const actions = [];
  if (latest.changes.some(c => c.category === 'REST API')) actions.push('Review new REST API samples for integration patterns and demo use cases.');
  if (latest.changes.some(c => c.category === 'Webhook')) actions.push('Check new webhook examples for event handling and HMAC verification patterns.');
  if (latest.changes.some(c => c.category === 'Desktop SDK')) actions.push('Inspect new Desktop SDK samples for CRM screen pop and widget patterns.');
  if (latest.changes.some(c => c.category === 'Flow Designer')) actions.push('Review new Flow Designer templates for reusable HTTP node and routing patterns.');
  if (!actions.length) actions.push('No high-signal category detected. Review tracked repo updates for new samples and SDK changes.');
  return actions;
}

function openTab(tabName, updateHash = true) {
  document.querySelectorAll('.radar-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.radar-panel').forEach(p => p.classList.remove('active'));
  const tab = document.querySelector(`.radar-tab[data-tab="${tabName}"]`);
  if (!tab) return;
  tab.classList.add('active');
  const panel = document.getElementById(tabName);
  if (panel) panel.classList.add('active');
  if (updateHash) history.replaceState(null, '', `#${tabName}`);
}

async function rdrLoad() {
  const [latest, cards, knowledge] = await Promise.all([
    fetch('data/latest.json').then(r => r.json()),
    fetch('data/cards.json').then(r => r.json()),
    fetch('data/knowledge.json').then(r => r.json())
  ]);
  rdrState.latest = latest;
  rdrState.cards = cards;
  rdrState.knowledge = knowledge;
  rdrRender();
}

function rdrRender() {
  const { latest, knowledge } = rdrState;

  // Stats
  document.getElementById('rdrNewRepos').textContent = latest.summary.newRepos;
  document.getElementById('rdrUpdatedRepos').textContent = latest.summary.updatedTrackedRepos;
  document.getElementById('rdrNewDiscovery').textContent = latest.summary.newDiscoveryItems;

  // Timestamps — sidebar + header
  const scanTime = when(latest.generatedAt);
  document.getElementById('rdrGeneratedAt').textContent = 'Last scan: ' + scanTime;
  const navTime = document.getElementById('rdrNavTime');
  if (navTime) navTime.textContent = scanTime;

  // Knowledge
  document.getElementById('rdrMissionTitle').textContent = knowledge.mission.title;
  document.getElementById('rdrMissionSummary').textContent = knowledge.mission.summary;
  document.getElementById('rdrFocusList').innerHTML = knowledge.mission.focusAreas.map(a => `<div class="radar-kb-chip">${esc(a)}</div>`).join('');

  // Badges
  const badgeChanges = document.getElementById('rdrBadgeChanges');
  const badgeDiscovery = document.getElementById('rdrBadgeDiscovery');
  const badgeCards = document.getElementById('rdrBadgeCards');
  const changesCount = latest.changes.filter(c => !c.type.includes('error')).length;
  const discoveryCount = latest.discovery.reduce((s, g) => s + g.items.length, 0);
  if (badgeChanges) badgeChanges.textContent = changesCount > 0 ? changesCount : '';
  if (badgeDiscovery) badgeDiscovery.textContent = discoveryCount > 0 ? discoveryCount : '';
  if (badgeCards) badgeCards.textContent = rdrState.cards.length > 0 ? rdrState.cards.length : '';

  const categories = topCategories(latest);
  const actions = nextActions(latest);
  const newest = priorityItems(latest);

  document.getElementById('rdrBriefingList').innerHTML = [
    briefingActionCard('What is new', `${latest.summary.newRepos + latest.summary.updatedTrackedRepos + latest.summary.newDiscoveryItems} item(s)`,
      `Daily bucket for ${latest.date || 'today'}. This scan added ${latest.newThisRun || 0} new item(s) across ${latest.scanCount || 1} scan(s).`,
      [{ label: 'What changed', tab: 'changes' }, { label: 'Open discovery', tab: 'discovery' }], 'Radar'),
    briefingActionCard('Top signal areas', categories.length ? categories.map(([n, c]) => `${n} (${c})`).join(', ') : 'No strong category yet',
      'Use these to decide whether today is about APIs, webhooks, SDK, flows, or reporting.',
      [{ label: 'Feature lanes', tab: 'lanes' }, { label: 'Tracked repos', tab: 'repos' }], 'Signal'),
    briefingActionCard('Suggested next action', actions[0],
      actions.slice(1).join(' ') || 'Open the playbooks tab for repeatable review routines.',
      [{ label: 'Playbooks', tab: 'playbooks' }], 'Action'),
    briefingLinkCard('Items worth opening first', newest,
      'Prioritise official WebexSamples repos first, then community repos with new patterns.',
      'Review')
  ].join('');

  document.getElementById('rdrLaneList').innerHTML = knowledge.featureLanes.map(laneCard).join('');
  document.getElementById('rdrPlaybookList').innerHTML = knowledge.playbooks.map(playbookCard).join('');

  document.getElementById('rdrChangeList').innerHTML = latest.changes.length
    ? latest.changes.map(itemCard).join('')
    : `<article class="radar-item"><p class="radar-detail">No changes recorded yet. Run <code>npm run scan</code> to collect the first baseline.</p></article>`;

  document.getElementById('rdrRepoList').innerHTML = latest.trackedRepos.length
    ? latest.trackedRepos.map(r => repoCard(r, { showTracking: true, showReadme: true })).join('')
    : `<article class="radar-item"><p class="radar-detail">No repositories scanned yet.</p></article>`;

  document.getElementById('rdrCardList').innerHTML = rdrState.cards.length
    ? rdrState.cards.map(reviewCard).join('')
    : `<article class="radar-item"><p class="radar-detail">No review cards yet. Run a scan to generate AI-written summaries for new discoveries.</p></article>`;

  document.getElementById('rdrDiscoveryList').innerHTML = latest.discovery.length
    ? latest.discovery.map(g => `<p class="radar-query-title">${esc(g.query)}</p><div class="radar-list">${g.items.map(r => repoCard(r, { showReadme: true })).join('')}</div>`).join('')
    : `<article class="radar-item"><p class="radar-detail">No discovery results yet.</p></article>`;

  document.getElementById('rdrGlossaryList').innerHTML = knowledge.glossary.map(definitionCard).join('');
  document.getElementById('rdrSourceTypeList').innerHTML = knowledge.sourceTypes.map(definitionCard).join('');
}

document.querySelectorAll('.radar-tab').forEach(tab => {
  tab.addEventListener('click', () => openTab(tab.dataset.tab));
});

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-open-tab]');
  if (btn) openTab(btn.dataset.openTab);
});

const initialTab = window.location.hash.replace('#', '');
if (initialTab && document.querySelector(`.radar-tab[data-tab="${initialTab}"]`)) openTab(initialTab, false);

window.addEventListener('popstate', () => {
  openTab(window.location.hash.replace('#', '') || 'briefing', false);
});

rdrLoad().catch(err => {
  document.querySelector('.radar-main').innerHTML = `<div class="callout callout-danger"><span class="callout-icon">&#9888;</span><div class="callout-body"><strong>Load failed</strong><p>${esc(err.message)}</p></div></div>`;
});
