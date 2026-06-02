/* ============================================================
   explorer.js
   Interactive tree, inline detail panel, FAQ toggles.
   Depends on: nodes-data.js (NODES object)
   ============================================================ */

(function () {
  'use strict';

  const CATEGORY_IDS = ['auth', 'rest', 'webhooks', 'desktop', 'flow', 'reporting'];
  const CHILDREN_BY_CATEGORY = {
    auth: ['personal-token', 'oauth', 'service-app'],
    rest: ['tasks', 'agents', 'queues'],
    webhooks: ['task-events', 'agent-events', 'webhook-security'],
    desktop: ['screen-pop', 'custom-widget', 'agent-state'],
    flow: ['http-node', 'flow-variables', 'routing'],
    reporting: ['realtime', 'historical', 'cdr']
  };
  const GUIDE_LINKS = {
    auth: 'getting-started.html#auth',
    rest: 'rest-apis.html#overview',
    webhooks: 'webhooks.html#what-are-webhooks',
    desktop: 'desktop-sdk.html#what-is-sdk',
    flow: 'flow-designer.html#what-is-flow',
    reporting: 'reporting.html#overview',
    'personal-token': 'getting-started.html#auth',
    oauth: 'getting-started.html#oauth-flow',
    'service-app': 'getting-started.html#service-app',
    tasks: 'rest-apis.html#tasks',
    agents: 'rest-apis.html#agents',
    queues: 'rest-apis.html#queues',
    'task-events': 'webhooks.html#event-types',
    'agent-events': 'webhooks.html#event-types',
    'webhook-security': 'webhooks.html#security',
    'screen-pop': 'desktop-sdk.html#screen-pop',
    'custom-widget': 'desktop-sdk.html#custom-widget',
    'agent-state': 'desktop-sdk.html#agent-state',
    'http-node': 'flow-designer.html#http-node',
    'flow-variables': 'flow-designer.html#variables',
    routing: 'flow-designer.html#branching',
    realtime: 'reporting.html#realtime',
    historical: 'reporting.html#historical',
    cdr: 'reporting.html#cdr'
  };
  const FAQ_LINKS = {
    auth: 'faq.html#auth-faq',
    rest: 'faq.html#api-faq',
    webhooks: 'faq.html#webhook-faq',
    desktop: 'faq.html#sdk-faq',
    flow: 'faq.html#flow-faq',
    reporting: 'faq.html#reporting-faq'
  };
  const SAMPLE_LINKS = {
    auth: 'samples.html#auth-playbook',
    rest: 'samples.html#config-playbook',
    webhooks: 'samples.html#webhook-playbook',
    desktop: 'samples.html#desktop-playbook',
    flow: 'samples.html#provider-playbook',
    reporting: 'samples.html#reporting-playbook'
  };
  const CATEGORY_CONTEXT = {
    auth: {
      concept: 'Authentication is the trust layer for every WxCC integration. Choose the grant type first, request only the scopes you need, then reuse the token foundation across APIs, widgets, webhooks, and reporting jobs.',
      flow: ['Developer app', 'OAuth grant', 'Webex identity', 'Bearer token', 'WxCC API call']
    },
    rest: {
      concept: 'REST APIs are the control plane for configuration and operational data. They work best when the app owns a focused business workflow, uses pagination safely, and caches stable setup data.',
      flow: ['Business need', 'Bearer token', 'REST endpoint', 'JSON payload', 'Workflow action']
    },
    webhooks: {
      concept: 'Webhooks are the event layer. WxCC pushes moments to your listener so downstream systems can act immediately without polling or waiting for scheduled reports.',
      flow: ['Contact event', 'Webhook delivery', 'HMAC check', 'Queue worker', 'CRM / alert / log']
    },
    desktop: {
      concept: 'The Desktop SDK is the agent-experience layer. A hosted widget runs inside the agent desktop and reacts to contact, agent, and task events without forcing agents into another tool.',
      flow: ['Desktop layout', 'iFrame widget', 'SDK init', 'Contact event', 'Agent action']
    },
    flow: {
      concept: 'Flow Designer is the journey orchestration layer. It collects caller input, calls external systems, sets variables, and routes the contact based on business rules.',
      flow: ['Caller input', 'HTTP lookup', 'Flow variables', 'Condition node', 'Target queue']
    },
    reporting: {
      concept: 'Reporting APIs turn contact center activity into trusted operational insight. Use live snapshots for wallboards and historical/CDR exports for analytics and business reviews.',
      flow: ['WxCC data', 'Query/export', 'Transform', 'Dashboard/BI', 'Decision']
    }
  };

  /* ── helpers ── */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

  /* ============================================================
     INLINE PANEL UPDATE
  ============================================================ */
  function openNode(id, opts = {}) {
    const node = NODES[id];
    if (!node) return;

    const selected = $('#selectedSolution');

    /* badge */
    const badge = $('#dpBadge');
    badge.textContent    = node.badge;
    badge.style.background = 'var(--badge-bg)';
    badge.style.color      = 'var(--badge-text)';

    /* header */
    $('#dpTitle').textContent    = node.title;
    $('#dpSubtitle').textContent = node.subtitle;

    /* body */
    $('#dpBody').innerHTML = buildPanelBody(node);
    updateNextSteps(id, node);

    selected.classList.add('has-selection');
    if (opts.scroll !== false) {
      selected.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    openNode('desktop', { scroll: false });
  });

  /* ============================================================
     PANEL HTML BUILDER
  ============================================================ */
  function buildPanelBody(node) {
    const nodeId = getNodeId(node);
    const categoryId = getCategoryId(nodeId);
    const isCategory = CATEGORY_IDS.includes(nodeId);
    let html = '';

    if (isCategory) {
      const context = CATEGORY_CONTEXT[nodeId];
      html += section('Concept', `<p>${context.concept}</p>`);
      html += section('Flow / Diagram', flowDiagram(context.flow));
      html += section('Where this helps',
        `<ul>${node.useCases.map(u => `<li>${u}</li>`).join('')}</ul>`);
      html += section('Choose the next detail',
        `<div class="detail-node-grid">${CHILDREN_BY_CATEGORY[nodeId].map(childCard).join('')}</div>`);
      return html;
    }

    if (node.what) {
      html += section('Implementation focus',
        `<p>${node.what}</p>`);
    }

    if (node.code) {
      html += section('Code pattern', codeBlock(node.code));
    }

    if (node.faqs && node.faqs.length) {
      html += section('FAQ for this detail', node.faqs.map(faqItem).join(''));
    }

    if (node.link || GUIDE_LINKS[nodeId]) {
      html += `<div class="dp-section dp-links">
        <a href="${GUIDE_LINKS[nodeId] || node.link}" class="dp-link primary">Open the exact guide section →</a>
        <a href="${SAMPLE_LINKS[categoryId] || 'samples.html'}" class="dp-link secondary">Browse related samples →</a>
      </div>`;
    }

    return html;
  }

  function section(title, inner) {
    return `<div class="dp-section"><h3>${title}</h3>${inner}</div>`;
  }

  function flowDiagram(steps) {
    return `<div class="context-flow">${steps.map((step, i) => `
      <div class="context-flow-node">${step}</div>
      ${i < steps.length - 1 ? '<span class="context-flow-arrow">→</span>' : ''}
    `).join('')}</div>`;
  }

  function childCard(id) {
    const child = NODES[id];
    return `<button class="detail-node-card" onclick="openNode('${id}')">
      <strong>${child.title}</strong>
      <span>${child.subtitle}</span>
    </button>`;
  }

  function codeBlock({ lang, content }) {
    return `<div class="dp-code">
      <div class="dp-code-header">
        <span class="dp-code-lang">${lang}</span>
        <button class="dp-copy" onclick="dpCopy(this)">⎘ Copy</button>
      </div>
      <pre>${content}</pre>
    </div>`;
  }

  function faqItem({ q, a }) {
    return `<div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">
        <span>${q}</span><span class="faq-icon">+</span>
      </div>
      <div class="faq-a">${a}</div>
    </div>`;
  }

  function updateNextSteps(id, node) {
    const title = $('#nextStepsTitle');
    const desc = $('#nextStepsDesc');
    const grid = $('#nextStepsGrid');
    if (!title || !desc || !grid) return;

    const categoryId = getCategoryId(id);
    const isCategory = CATEGORY_IDS.includes(id);
    title.textContent = isCategory
      ? `Next steps for ${node.title}`
      : `Go deeper on ${node.title}`;
    desc.textContent = isCategory
      ? 'Start with the concept and flow above, then choose a detail node or open the matching guide/sample path.'
      : 'Use the code and FAQ above, then open the exact guide section, sample playbook, or broader FAQ group.';

    const cards = isCategory ? [
      { href: GUIDE_LINKS[id], title: 'Open guide', body: 'Read the deeper concept, setup, and implementation sections.' },
      { href: SAMPLE_LINKS[id], title: 'Use sample path', body: 'See working patterns, diagrams, and starter code.' },
      { href: FAQ_LINKS[id], title: 'Review FAQ', body: 'Check common decisions, pitfalls, and troubleshooting.' }
    ] : [
      { href: GUIDE_LINKS[id], title: 'Exact guide section', body: 'Jump directly to the implementation section for this detail.' },
      { href: SAMPLE_LINKS[categoryId], title: 'Related sample', body: 'Use the matching playbook to turn this into a prototype.' },
      { href: FAQ_LINKS[categoryId], title: 'Related FAQ', body: 'Review questions for this category before building.' }
    ];

    grid.innerHTML = cards.map(card => `<a class="next-step-card" href="${card.href}">
      <strong>${card.title}</strong>
      <span>${card.body}</span>
    </a>`).join('');
  }

  function getNodeId(node) {
    return Object.keys(NODES).find(id => NODES[id] === node);
  }

  function getCategoryId(id) {
    if (CATEGORY_IDS.includes(id)) return id;
    return CATEGORY_IDS.find(category => CHILDREN_BY_CATEGORY[category].includes(id)) || 'auth';
  }

  /* ============================================================
     FAQ TOGGLE  (inside panel)
  ============================================================ */
  window.toggleFaq = function (el) {
    const isOpen  = el.classList.contains('open');
    const section = el.closest('.dp-section');
    $$('.faq-q', section).forEach(q => q.classList.remove('open'));
    $$('.faq-a', section).forEach(a => a.classList.remove('open'));
    if (!isOpen) {
      el.classList.add('open');
      el.nextElementSibling.classList.add('open');
    }
  };

  /* ============================================================
     COPY BUTTON  (inside panel)
  ============================================================ */
  window.dpCopy = function (btn) {
    const text = btn.closest('.dp-code').querySelector('pre').textContent;
    const done = () => {
      btn.classList.add('copied');
      btn.textContent = '✓ Copied';
      setTimeout(() => { btn.classList.remove('copied'); btn.textContent = '⎘ Copy'; }, 2000);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(() => fbCopy(text, done));
    } else {
      fbCopy(text, done);
    }
  };

  function fbCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand('copy'); cb(); } catch (_) {}
    document.body.removeChild(ta);
  }

  /* ============================================================
     PUBLIC API  — called by inline onclick on SVG nodes & flow steps
  ============================================================ */
  window.openNode = openNode;

})();
