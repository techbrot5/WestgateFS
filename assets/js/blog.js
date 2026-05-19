/* =============================================================
   WestgateFS — blog.js  v4.0
   Production interactive layer for all blog pages.

   Behaviors (all class-based, never ID-based):
     1.  Reading progress bar
     2.  TOC active section highlighting
     3.  TOC mini progress bar + read percentage
     4.  Smooth scroll for TOC anchor links
     5.  Sidebar footer stop
     6.  Scroll-reveal animation system (IntersectionObserver)
     7.  Staggered card reveal for article grids
     8.  Featured card entrance reveal
     9.  Filter bar foundation (DOM-ready, no wiring yet)

   Respects prefers-reduced-motion throughout.
   Graceful degradation: progress bar works without IO support.
   Load: <script src="/assets/js/blog.js" defer></script>
   ============================================================= */

(function () {
  'use strict';

  /* ── ENVIRONMENT ──────────────────────────────────────────── */

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var supportsIO    = typeof IntersectionObserver === 'function';

  function toArray(nodeList) {
    return Array.prototype.slice.call(nodeList);
  }


  /* ── 1. READING PROGRESS BAR ──────────────────────────────
     Fills the fixed 3px top strip as the user scrolls.
     Also updates the in-TOC mini bar and read percentage.
  ─────────────────────────────────────────────────────────── */

  var progressBar  = document.querySelector('.wfs-blog-progress__bar');

  var tocBarFill   = document.querySelector('.wfs-blog-toc-sidebar__bar-fill');
  var tocReadPct   = document.querySelector('.wfs-blog-toc-sidebar__read');

  function updateProgress() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct       = docHeight > 0 ? Math.min(100, Math.round(scrollTop / docHeight * 100)) : 0;

    if (progressBar) progressBar.style.width = pct + '%';
    if (progressEl)  progressEl.setAttribute('aria-valuenow', pct);
    if (tocBarFill)  tocBarFill.style.width = pct + '%';
    if (tocReadPct)  tocReadPct.textContent = pct + '% read';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();


  /* ── 2–3. TOC ACTIVE SECTION + MINI PROGRESS ─────────────
     IntersectionObserver watches all headings with IDs inside
     .wfs-blog-body. Adds .is-active to matching TOC links
     in both the inline and sidebar TOC simultaneously.
  ─────────────────────────────────────────────────────────── */

  if (!supportsIO) return; /* graceful: progress bar still works */

  var headings = toArray(
    document.querySelectorAll('.wfs-blog-body h2[id], .wfs-blog-body h3[id]')
  );

  var tocLinks = toArray(
    document.querySelectorAll(
      '.wfs-blog-toc__list a, .wfs-blog-toc-sidebar__link'
    )
  );

  var activeId = headings.length ? headings[0].id : null;

  if (headings.length && tocLinks.length) {
    setActive(activeId);

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          activeId = entry.target.id;
          setActive(activeId);
        }
      });
    }, {
      rootMargin: '-10% 0px -80% 0px',
      threshold: 0
    });

    headings.forEach(function (h) { sectionObserver.observe(h); });
  }

  function setActive(id) {
    tocLinks.forEach(function (link) {
      var matches = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', matches);
    });
  }


  /* ── 4. SMOOTH SCROLL FOR TOC LINKS ──────────────────────
     Polyfills Safari < 15.4. Adds offset for progress bar
     + any fixed site nav. Updates active state on click.
  ─────────────────────────────────────────────────────────── */

  var allTocLinks = toArray(
    document.querySelectorAll(
      '.wfs-blog-toc__list a[href^="#"], .wfs-blog-toc-sidebar__link[href^="#"]'
    )
  );

  allTocLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href   = link.getAttribute('href');
      var target = href && href.length > 1 ? document.getElementById(href.slice(1)) : null;
      if (!target) return;

      e.preventDefault();

      var offset    = 28;
      var targetTop = target.getBoundingClientRect().top + window.scrollY - offset;

      if (reducedMotion) {
        window.scrollTo(0, targetTop);
      } else {
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }

      setActive(target.id);

      if (!target.getAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });


  /* ── 5. SIDEBAR FOOTER STOP ───────────────────────────────
     CSS position:sticky handles most cases.
     This clamps the sidebar before the page footer on very
     long articles where sidebar content height > viewport.
  ─────────────────────────────────────────────────────────── */

  var sidebar = document.querySelector('.wfs-blog-sidebar');
  var footer  = document.querySelector('#wfs-footer, .wfs-footer, footer[role="contentinfo"]');

  if (sidebar && footer) {
    function clampSidebar() {
      var footerTop  = footer.getBoundingClientRect().top;
      var viewportH  = window.innerHeight;
      var sidebarTop = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--blog-sidebar-top')
      ) || 32;

      if (footerTop < viewportH) {
        var available = footerTop - sidebarTop - 16;
        sidebar.style.maxHeight = Math.max(200, available) + 'px';
      } else {
        sidebar.style.maxHeight = '';
      }
    }

    window.addEventListener('scroll', clampSidebar, { passive: true });
    window.addEventListener('resize', clampSidebar, { passive: true });
    clampSidebar();
  }


  /* ── 6. SCROLL-REVEAL ANIMATION SYSTEM ───────────────────
     Elements with class .js-reveal start opacity:0 and
     translateY(14px). Observer adds .is-visible to trigger
     the CSS transition. --delay custom property enables stagger.

     Skipped entirely when prefers-reduced-motion is set —
     elements are immediately visible at full opacity.
  ─────────────────────────────────────────────────────────── */

  if (reducedMotion) {
    /* Ensure all reveal elements are immediately visible */
    toArray(document.querySelectorAll('.js-reveal')).forEach(function (el) {
      el.classList.add('is-visible');
    });
    return; /* no further motion needed */
  }

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -32px 0px'
  });

  /* Auto-collect all .js-reveal elements and set their delay */
  toArray(document.querySelectorAll('.js-reveal')).forEach(function (el) {
    var delay = parseInt(el.dataset.delay || 0, 10);
    if (delay) el.style.setProperty('--delay', delay + 'ms');
    revealObserver.observe(el);
  });


  /* ── 7. STAGGERED GRID CARD REVEAL ───────────────────────
     Finds the article grid and assigns reveal classes with
     row-based stagger (60ms per column position).
     Only runs if cards don't already have .js-reveal set in HTML.
  ─────────────────────────────────────────────────────────── */

  var grid = document.querySelector('.wfs-blog-index__grid');

  if (grid) {
    var cards = toArray(grid.querySelectorAll('.wfs-blog-index-card:not(.js-reveal)'));

    cards.forEach(function (card, i) {
      var colDelay = (i % 3) * 60; /* 0ms, 60ms, 120ms per column in row */
      card.classList.add('js-reveal');
      card.style.setProperty('--delay', colDelay + 'ms');
      revealObserver.observe(card);
    });
  }


  /* ── 8. FEATURED CARD ENTRANCE ────────────────────────────
     Single-element reveal — no stagger, slightly slower curve
     to give the featured card appropriate editorial weight.
  ─────────────────────────────────────────────────────────── */

  var featuredCard = document.querySelector('.wfs-blog-featured-card:not(.js-reveal)');

  if (featuredCard) {
    featuredCard.classList.add('js-reveal');
    featuredCard.style.setProperty('--delay', '40ms');
    /* Override default transition for featured — longer, heavier */
    featuredCard.style.transition =
      'opacity 600ms cubic-bezier(0.25,0.46,0.45,0.94) 40ms,' +
      'transform 600ms cubic-bezier(0.25,0.46,0.45,0.94) 40ms';
    revealObserver.observe(featuredCard);
  }


  /* ── 9. FILTER BAR FOUNDATION ────────────────────────────
     Marks the filter bar as ready for future wiring.
     Currently sets up data attributes and event listeners
     but does not apply any filtering — category nav links
     handle navigation to filtered pages.

     To activate full client-side filtering in future:
       1. Set .wfs-blog-filter-bar.is-ready via JS
       2. Wire data-filter attribute to card data-category
       3. Toggle data-hidden on non-matching cards
  ─────────────────────────────────────────────────────────── */

  var filterBar = document.querySelector('.wfs-blog-filter-bar');

  if (filterBar) {
    /* Mark cards with data-category from their category element */
    toArray(document.querySelectorAll('.wfs-blog-index-card')).forEach(function (card) {
      var catEl = card.querySelector('.wfs-blog-index-card__category');
      if (catEl && !card.dataset.category) {
        card.dataset.category = catEl.textContent.trim().toLowerCase().replace(/\s+/g, '-');
      }
    });

    /* filterBar.classList.add('is-ready'); — activate when wired */
  }


  /* ── 10. PUBLICATION HEADER SCROLL BEHAVIOR ───────────────
     Adds .wfs-pub-header--scrolled when user scrolls past 40px.
     Drives box-shadow from CSS. Also syncs reading progress to
     the header's embedded progress fill (on article pages).
  ─────────────────────────────────────────────────────────── */

  var pubHeader      = document.querySelector('.wfs-pub-header');
  var headerProgress = document.querySelector('.wfs-pub-header__progress-fill');

  if (pubHeader) {
    function handleHeaderScroll() {
      var scrolled = window.scrollY > 40;
      pubHeader.classList.toggle('wfs-pub-header--scrolled', scrolled);

      /* Sync header mini-progress with the top progress bar */
      if (headerProgress && progressBar) {
        headerProgress.style.width = progressBar.style.width || '0%';
      }
    }

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();
  }


  /* ── 11. ARTICLE-SPECIFIC SECTION REVEALS ─────────────────
     Adds .js-reveal to definition blocks, workflow steps,
     and the before/after component on article pages.
     Staggered within groups for editorial entrance rhythm.
     Only runs if reducedMotion is false (checked above).
  ─────────────────────────────────────────────────────────── */

  if (!reducedMotion) {

    /* Definition blocks — stagger within each group of siblings */
    var defBlocks = toArray(
      document.querySelectorAll('.wfs-definition-block:not(.js-reveal)')
    );

    var defGroupIdx = 0;
    var prevParent  = null;

    defBlocks.forEach(function (block) {
      if (block.parentElement !== prevParent) {
        defGroupIdx = 0;
        prevParent  = block.parentElement;
      }
      block.classList.add('js-reveal');
      block.style.setProperty('--delay', (defGroupIdx * 80) + 'ms');
      revealObserver.observe(block);
      defGroupIdx++;
    });

    /* Workflow steps — sequential left-to-right stagger */
    toArray(
      document.querySelectorAll('.wfs-blog-workflow__step:not(.js-reveal)')
    ).forEach(function (step, i) {
      step.classList.add('js-reveal');
      step.style.setProperty('--delay', (i % 3) * 70 + 'ms');
      revealObserver.observe(step);
    });

    /* Before/after columns — left then right */
    toArray(
      document.querySelectorAll('.wfs-blog-before-after__col:not(.js-reveal)')
    ).forEach(function (col, i) {
      col.classList.add('js-reveal');
      col.style.setProperty('--delay', i * 100 + 'ms');
      revealObserver.observe(col);
    });

    /* Related concept chips — gentle cascade */
    toArray(
      document.querySelectorAll('.wfs-related-concepts__item:not(.js-reveal)')
    ).forEach(function (chip, i) {
      chip.classList.add('js-reveal');
      chip.style.setProperty('--delay', Math.min(i * 40, 300) + 'ms');
      revealObserver.observe(chip);
    });

    /* Reading path cards */
    toArray(
      document.querySelectorAll('.wfs-reading-path__card:not(.js-reveal)')
    ).forEach(function (card, i) {
      card.classList.add('js-reveal');
      card.style.setProperty('--delay', i * 80 + 'ms');
      revealObserver.observe(card);
    });

    /* Trust strip, callouts, stat block — subtle fade */
    toArray(
      document.querySelectorAll(
        '.wfs-blog-trust:not(.js-reveal),' +
        '.wfs-blog-stat:not(.js-reveal),' +
        '.wfs-blog-callout:not(.js-reveal),' +
        '.wfs-blog-inline-cta:not(.js-reveal)'
      )
    ).forEach(function (el) {
      el.classList.add('js-reveal', 'js-reveal--fade');
      revealObserver.observe(el);
    });

  }


  /* ── 12. CATEGORY NAV ACTIVE STATE ────────────────────────
     On the blog index, marks the correct category nav item
     active based on the current URL path. Progressive
     enhancement — falls back to server-rendered active class.
  ─────────────────────────────────────────────────────────── */

  var catNav = document.querySelector('.wfs-blog-category-nav');

  if (catNav) {
    var currentPath = window.location.pathname.replace(/\/$/, '');

    toArray(catNav.querySelectorAll('.wfs-blog-category-nav__item')).forEach(function (item) {
      var itemPath = (item.getAttribute('href') || '').replace(/\/$/, '');

      if (itemPath && itemPath === currentPath) {
        item.classList.add('wfs-blog-category-nav__item--active');
        item.setAttribute('aria-current', 'page');
      }
    });
  }

}());
