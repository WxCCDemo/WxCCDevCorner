/* ===================================================================
   WxCC Extensibility Hub — Shared JavaScript
   =================================================================== */

// ------------------------------------------------------------------
// 1. Mobile Navigation
// ------------------------------------------------------------------
(function initMobileNav() {
  const btn = document.querySelector('.nav-mobile-btn');
  const drawer = document.getElementById('mobile-nav');
  const closeBtn = document.querySelector('.mobile-nav-close');
  const backdrop = document.querySelector('.mobile-nav-backdrop');

  if (!btn || !drawer) return;

  function open() { drawer.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function close() { drawer.classList.remove('open'); document.body.style.overflow = ''; }

  btn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);
})();

// ------------------------------------------------------------------
// 2. Copy Buttons
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async function () {
      const block = this.closest('.code-block, .code-tab-pane, .accordion-body, .playbook, .endpoint-body');
      const codeEl = block ? block.querySelector('code') : null;
      if (!codeEl) return;
      try {
        await navigator.clipboard.writeText(codeEl.textContent);
        this.textContent = '✓ Copied';
        this.classList.add('copied');
        setTimeout(() => {
          this.textContent = '⎘ Copy';
          this.classList.remove('copied');
        }, 2000);
      } catch (e) {
        console.warn('Copy failed', e);
      }
    });
  });
});

// ------------------------------------------------------------------
// 3. Accordions (accordion + endpoints)
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.accordion-header, .endpoint-header').forEach(header => {
    header.addEventListener('click', function () {
      const isOpen = this.classList.contains('open');
      // Close siblings in same group
      const group = this.closest('.accordion-group, .endpoint-group');
      if (group) {
        group.querySelectorAll('.accordion-header.open, .endpoint-header.open').forEach(h => {
          h.classList.remove('open');
          const body = h.nextElementSibling;
          if (body) body.classList.remove('open');
        });
      }
      if (!isOpen) {
        this.classList.add('open');
        const body = this.nextElementSibling;
        if (body) body.classList.add('open');
      }
    });
  });
});

// ------------------------------------------------------------------
// 4. Code Tabs
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.code-tabs, .method-tabs').forEach(container => {
    const btns = container.querySelectorAll('.code-tab-btn, .method-tab-btn');
    const panes = container.querySelectorAll('.code-tab-pane, .method-tab-pane');

    btns.forEach((btn, i) => {
      btn.addEventListener('click', function () {
        btns.forEach(b => b.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        if (panes[i]) panes[i].classList.add('active');
      });
    });
  });
});

// ------------------------------------------------------------------
// 5. Active TOC Highlighting (Intersection Observer)
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
  const tocLinks = document.querySelectorAll('.toc-list a');
  if (!tocLinks.length) return;

  const headings = Array.from(tocLinks)
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(a => a.classList.remove('active'));
        const active = Array.from(tocLinks).find(a =>
          a.getAttribute('href') === '#' + entry.target.id
        );
        if (active) active.classList.add('active');
      }
    });
  }, {
    rootMargin: '-80px 0px -60% 0px',
    threshold: 0
  });

  headings.forEach(h => observer.observe(h));
});

// ------------------------------------------------------------------
// 6. Back to Top
// ------------------------------------------------------------------
(function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// ------------------------------------------------------------------
// 7. Mermaid Init
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        background:       '#060d18',
        mainBkg:          '#0f2040',
        nodeBorder:       '#00BCEB',
        clusterBkg:       '#0c1929',
        titleColor:       '#e0efff',
        edgeLabelBackground: '#0f2040',
        lineColor:        '#00BCEB',
        primaryColor:     '#00476B',
        primaryTextColor: '#e0efff',
        primaryBorderColor: '#00BCEB',
        secondaryColor:   '#112038',
        tertiaryColor:    '#0f2040',
        fontFamily:       'Inter, system-ui, sans-serif',
        fontSize:         '13px',
      },
      flowchart: { curve: 'basis', padding: 20 },
      sequence: { actorMargin: 60, messageMargin: 30 }
    });
  }
});

// ------------------------------------------------------------------
// 8. FAQ Filter
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
  const filterBtns = document.querySelectorAll('.faq-filter-btn');
  const faqSections = document.querySelectorAll('.faq-section');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const target = this.dataset.filter;

      faqSections.forEach(section => {
        if (target === 'all' || section.dataset.category === target) {
          section.style.display = '';
        } else {
          section.style.display = 'none';
        }
      });
    });
  });
});

// ------------------------------------------------------------------
// 9. Nav active state
// ------------------------------------------------------------------
(function setActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav-panel a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href === current || href.endsWith(current))) {
      a.classList.add('active');
    }
  });
})();
