/* ============================================================
   explorer.js
   Interactive tree, detail panel, FAQ toggles.
   Depends on: nodes-data.js (NODES object)
   ============================================================ */

(function () {
  'use strict';

  /* ── helpers ── */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

  /* ============================================================
     PANEL OPEN / CLOSE
  ============================================================ */
  function openNode(id) {
    const node = NODES[id];
    if (!node) return;

    const overlay = $('#detailOverlay');
    const panel   = $('#detailPanel');

    /* badge */
    const badge = $('#dpBadge');
    badge.textContent    = node.badge;
    badge.style.background = node.badgeColor;
    badge.style.color      = node.badgeText;

    /* header */
    $('#dpTitle').textContent    = node.title;
    $('#dpSubtitle').textContent = node.subtitle;

    /* body */
    $('#dpBody').innerHTML = buildPanelBody(node);

    /* open */
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    panel.scrollTop = 0;
  }

  function closePanel() {
    $('#detailOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── close triggers ── */
  document.addEventListener('DOMContentLoaded', () => {
    $('#dpClose').addEventListener('click', closePanel);

    $('#detailOverlay').addEventListener('click', function (e) {
      if (e.target === this) closePanel();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closePanel();
    });
  });

  /* ============================================================
     PANEL HTML BUILDER
  ============================================================ */
  function buildPanelBody(node) {
    let html = '';

    if (node.what) {
      html += section('What is this?',
        `<p>${node.what}</p>`);
    }

    if (node.useCases && node.useCases.length) {
      html += section('Use Cases',
        `<ul>${node.useCases.map(u => `<li>${u}</li>`).join('')}</ul>`);
    }

    if (node.code) {
      html += section('Code Sample', codeBlock(node.code));
    }

    if (node.faqs && node.faqs.length) {
      html += section('FAQs', node.faqs.map(faqItem).join(''));
    }

    if (node.link) {
      html += `<div class="dp-section dp-links">
        <a href="${node.link}" class="dp-link primary">📖 Full Documentation →</a>
      </div>`;
    }

    return html;
  }

  function section(title, inner) {
    return `<div class="dp-section"><h3>${title}</h3>${inner}</div>`;
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
