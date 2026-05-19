/* =====================================================================
   WestgateFS — Global JS
   v50 · No dependencies · ~2.5kb gzipped
   Reveal observer · FAQ enhancements · Smooth scroll · Mobile nav
   Mega menu keyboard hooks · aria-current · Year stamp · Reduced-motion
   ===================================================================== */
(function () {
  'use strict';

  if (typeof document === 'undefined') return;

  var d = document;
  var w = window;

  function on(el, evt, fn, opts) { if (el) el.addEventListener(evt, fn, opts || false); }
  function $(sel, ctx) { return (ctx || d).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || d).querySelectorAll(sel)); }

  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------------
     1. Reveal-on-scroll
     Targets: every <section class="wfs-section">, plus .wfs-pullquote
              and .wfs-insight. Adds .wfs-reveal then .is-visible.
     Stagger: child blocks fade in 80ms apart.
     ---------------------------------------------------------------- */
  var revealTargets = $$([
    '.wfs-section',
    '.wfs-pullquote',
    '.wfs-insight'
  ].join(','));

  function applyReveal() {
    if (reduce || !('IntersectionObserver' in w)) {
      revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    revealTargets.forEach(function (el) {
      if (!el.classList.contains('wfs-reveal')) el.classList.add('wfs-reveal');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-visible');
        // Soft inner stagger for direct children that look like primary content blocks
        var children = $$('.wfs-section-head, .wfs-pillar, .wfs-pain__row, .wfs-proof__card, .wfs-industry, .wfs-locations__city, .wfs-process__step, .wfs-review, .wfs-faq__item, .wfs-standards__item', el);
        children.forEach(function (child, i) {
          if (i > 8) return; // cap stagger so long lists don't crawl
          child.style.transitionDelay = (i * 80) + 'ms';
        });
        io.unobserve(el);
      });
    }, {
      root: null,
      threshold: 0.08,
      rootMargin: '0px 0px -8% 0px'
    });

    revealTargets.forEach(function (el) { io.observe(el); });
  }
  applyReveal();

  /* ----------------------------------------------------------------
     2. FAQ enhancements
     - Closes other open <details> in the same .wfs-faq__list (accordion).
     - Manages aria-expanded on the summary for screen readers.
     - Keyboard-safe (native <details> handles Enter/Space).
     ---------------------------------------------------------------- */
  $$('.wfs-faq__list').forEach(function (list) {
    var items = $$('.wfs-faq__item', list);
    items.forEach(function (item) {
      var summary = $('summary', item);
      if (!summary) return;
      summary.setAttribute('aria-expanded', item.hasAttribute('open') ? 'true' : 'false');
      on(item, 'toggle', function () {
        var open = item.hasAttribute('open');
        summary.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) {
          items.forEach(function (other) {
            if (other !== item && other.hasAttribute('open')) {
              other.removeAttribute('open');
              var os = $('summary', other);
              if (os) os.setAttribute('aria-expanded', 'false');
            }
          });
        }
      });
    });
  });

  /* ----------------------------------------------------------------
     3. Smooth scroll for in-page anchors
     ---------------------------------------------------------------- */
  if (!reduce) {
    $$('a[href^="#"]').forEach(function (a) {
      var hash = a.getAttribute('href');
      if (!hash || hash.length < 2 || hash === '#') return;
      on(a, 'click', function (e) {
        var target = d.getElementById(hash.slice(1));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ----------------------------------------------------------------
     4. Sticky header state
     Adds .is-scrolled when the page is scrolled past 8px.
     ---------------------------------------------------------------- */
  var header = $('.wfs-header');
  if (header) {
    var lastY = -1;
    var ticking = false;
    function syncHeader() {
      var y = w.scrollY || w.pageYOffset || 0;
      if (Math.abs(y - lastY) < 4) return;
      lastY = y;
      header.classList.toggle('is-scrolled', y > 8);
    }
    on(w, 'scroll', function () {
      if (!ticking) {
        w.requestAnimationFrame(function () { syncHeader(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
    syncHeader();
  }

  /* ----------------------------------------------------------------
     5. Mobile nav foundation
     Works as soon as .wfs-nav__toggle + #wfs-primary-nav exist.
     ---------------------------------------------------------------- */
  var nav = $('#wfs-primary-nav');
  var toggle = $('.wfs-nav__toggle');
  var mq = w.matchMedia('(max-width: 991.98px)');

  function isMobile() { return mq.matches; }

  function openNav() {
    if (!nav || !toggle) return;
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');
    d.body.classList.add('wfs-no-scroll');
  }
  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    d.body.classList.remove('wfs-no-scroll');
    $$('.wfs-nav__item--mega.is-open').forEach(function (el) {
      el.classList.remove('is-open');
      var link = $('.wfs-nav__link', el);
      if (link) link.setAttribute('aria-expanded', 'false');
    });
  }

  if (toggle && nav) {
    on(toggle, 'click', function () {
      if (nav.classList.contains('is-open')) closeNav(); else openNav();
    });
  }

  /* ----------------------------------------------------------------
     6. Mega-menu hooks (desktop hover/keyboard, mobile accordion)
     Future-ready: works when nav HTML is finalized.
     ---------------------------------------------------------------- */
  var megaItems = $$('.wfs-nav__item--mega');

  megaItems.forEach(function (item) {
    var link = $('.wfs-nav__link', item);
    if (!link) return;

    on(link, 'click', function (e) {
      if (isMobile()) {
        e.preventDefault();
        var wasOpen = item.classList.contains('is-open');
        megaItems.forEach(function (other) {
          if (other !== item) {
            other.classList.remove('is-open');
            var ol = $('.wfs-nav__link', other);
            if (ol) ol.setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.toggle('is-open', !wasOpen);
        link.setAttribute('aria-expanded', String(!wasOpen));
      }
    });

    on(link, 'keydown', function (e) {
      if (isMobile()) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        if (!item.classList.contains('is-open')) {
          e.preventDefault();
          item.classList.add('is-open');
          link.setAttribute('aria-expanded', 'true');
          var first = item.querySelector('.wfs-mega a');
          if (first) first.focus();
        }
      } else if (e.key === 'Escape') {
        item.classList.remove('is-open');
        link.setAttribute('aria-expanded', 'false');
        link.focus();
      }
    });

    on(item, 'focusout', function (e) {
      if (isMobile()) return;
      if (!item.contains(e.relatedTarget)) {
        item.classList.remove('is-open');
        link.setAttribute('aria-expanded', 'false');
      }
    });

    var mega = $('.wfs-mega', item);
    if (mega) {
      on(mega, 'keydown', function (e) {
        if (e.key === 'Escape') {
          item.classList.remove('is-open');
          link.setAttribute('aria-expanded', 'false');
          link.focus();
        }
      });
    }
  });

  /* ----------------------------------------------------------------
     7. Click-outside closes desktop mega
     ---------------------------------------------------------------- */
  on(d, 'click', function (e) {
    if (isMobile()) return;
    megaItems.forEach(function (item) {
      if (item.classList.contains('is-open') && !item.contains(e.target)) {
        item.classList.remove('is-open');
        var link = $('.wfs-nav__link', item);
        if (link) link.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ----------------------------------------------------------------
     8. Breakpoint reset for nav
     ---------------------------------------------------------------- */
  function onMqChange() {
    if (!isMobile()) {
      if (nav) nav.classList.remove('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      d.body.classList.remove('wfs-no-scroll');
      $$('.wfs-nav__item--mega.is-open').forEach(function (el) {
        el.classList.remove('is-open');
        var l = $('.wfs-nav__link', el);
        if (l) l.setAttribute('aria-expanded', 'false');
      });
    }
  }
  if (mq.addEventListener) mq.addEventListener('change', onMqChange);
  else if (mq.addListener) mq.addListener(onMqChange);

  /* ----------------------------------------------------------------
     9. aria-current on matching internal links
     ---------------------------------------------------------------- */
  var path = w.location.pathname.replace(/\/+$/, '') || '/';
  $$('a[href]').forEach(function (a) {
    try {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) !== '/') return;
      var clean = href.replace(/\/+$/, '') || '/';
      if (clean === path && clean !== '/') a.setAttribute('aria-current', 'page');
    } catch (_) { /* noop */ }
  });

  /* ----------------------------------------------------------------
     10. Footer year stamp
     ---------------------------------------------------------------- */
  $$('.wfs-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

})();