/* ============================================================
   WxCC Extensibility Hub — Interactive JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Active nav link ----
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.topnav-links a, .sidebar-link').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
      a.classList.add('active');
    }
  });

  // ---- Hamburger / mobile sidebar ----
  const hamburger = document.querySelector('.topnav-hamburger');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (hamburger && sidebar) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay && overlay.classList.toggle('active');
    });
    overlay && overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }

  // ---- Copy to clipboard ----
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      const el = target ? document.querySelector(target) : btn.closest('.code-block').querySelector('code');
      if (!el) return;
      const text = el.textContent;
      const showCopied = () => {
        btn.classList.add('copied');
        btn.innerHTML = '✓ Copied';
        setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '⎘ Copy'; }, 2000);
      };
      // Modern clipboard API with fallback
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(showCopied).catch(() => fallbackCopy(text, showCopied));
      } else {
        fallbackCopy(text, showCopied);
      }
    });
  });

  function fallbackCopy(text, callback) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand('copy'); callback(); } catch(e) {}
    document.body.removeChild(ta);
  }

  // ---- Tabs ----
  document.querySelectorAll('.tab-list').forEach(list => {
    list.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.dataset.group;
        const target = btn.dataset.tab;
        document.querySelectorAll(`.tab-btn[data-group="${group}"]`).forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`.tab-panel[data-group="${group}"]`).forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.querySelector(`.tab-panel[data-group="${group}"][data-tab="${target}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  });

  // ---- Accordion ----
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const body = item.querySelector('.accordion-body');
      const isOpen = header.classList.contains('open');
      // Close all in same accordion
      const accordion = header.closest('.accordion');
      accordion.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('open'));
      accordion.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('open'));
      if (!isOpen) {
        header.classList.add('open');
        body.classList.add('open');
      }
    });
  });

  // ---- Expandable sections ----
  document.querySelectorAll('.expand-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const section = trigger.closest('.expand-section');
      const content = section.querySelector('.expand-content');
      trigger.classList.toggle('open');
      content.classList.toggle('open');
    });
  });

  // ---- Endpoint cards ----
  document.querySelectorAll('.endpoint-header').forEach(header => {
    header.addEventListener('click', () => {
      const card = header.closest('.endpoint-card');
      const body = card.querySelector('.endpoint-body');
      header.classList.toggle('open');
      body.classList.toggle('open');
    });
  });

  // ---- Page scroll progress ----
  const bar = document.querySelector('.page-progress-bar');
  if (bar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = docHeight > 0 ? (scrollTop / docHeight * 100) + '%' : '0%';
    }, { passive: true });
  }

  // ---- Back to top ----
  const btt = document.getElementById('backToTop');
  if (btt) {
    window.addEventListener('scroll', () => {
      btt.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ---- Sidebar active section tracking (scroll spy) ----
  const sidebarLinks = document.querySelectorAll('.sidebar-link[href^="#"]');
  if (sidebarLinks.length) {
    const sections = Array.from(sidebarLinks).map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          sidebarLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    sections.forEach(s => observer.observe(s));
  }

  // ---- FAQ Search ----
  const faqSearch = document.getElementById('faqSearch');
  if (faqSearch) {
    faqSearch.addEventListener('input', () => {
      const q = faqSearch.value.toLowerCase();
      document.querySelectorAll('.accordion-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = !q || text.includes(q) ? '' : 'none';
      });
    });
  }

  // ---- Smooth internal links ----
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const el = document.querySelector(a.getAttribute('href'));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ---- Tooltip ----
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.style.position = 'relative';
    const tip = document.createElement('div');
    tip.className = 'tooltip-box';
    tip.textContent = el.dataset.tooltip;
    tip.style.cssText = `
      position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);
      background:#0f172a;color:#fff;font-size:12px;padding:5px 10px;border-radius:6px;
      white-space:nowrap;pointer-events:none;opacity:0;transition:opacity 0.2s;z-index:999;
    `;
    el.appendChild(tip);
    el.addEventListener('mouseenter', () => { tip.style.opacity = '1'; });
    el.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
  });

});

// ---- Shared nav HTML injection ----
function renderNav(activePage) {
  const pages = [
    { href: 'index.html', label: 'Overview' },
    { href: 'getting-started.html', label: 'Get Started' },
    { href: 'rest-apis.html', label: 'REST APIs' },
    { href: 'webhooks.html', label: 'Webhooks' },
    { href: 'desktop-sdk.html', label: 'Desktop SDK' },
    { href: 'flow-designer.html', label: 'Flow Designer' },
    { href: 'reporting.html', label: 'Reporting' },
    { href: 'faq.html', label: 'FAQ' },
  ];
  return pages.map(p =>
    `<li><a href="${p.href}" ${p.href === activePage ? 'class="active"' : ''}>${p.label}</a></li>`
  ).join('');
}
