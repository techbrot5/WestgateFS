/* =============================================================
   WestgateFS — bridges.js
   Shared UX layer for all bridge-type pages.
   Targets CLASS selectors only. Never targets IDs.
   Gracefully does nothing if elements are absent.

   Load with:
     <script src="/assets/js/bridges.js" defer></script>

   No dependencies. ES5-compatible.
   ============================================================= */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  var supportsIO = typeof IntersectionObserver === 'function';

  function toArray(nodeList) {
    return Array.prototype.slice.call(nodeList);
  }

  function reveal(el) {
    el.style.opacity   = '1';
    el.style.transform = 'none';
  }

  function makeObserver(callback, options) {
    if (!supportsIO) return null;
    return new IntersectionObserver(callback, options);
  }


  /* ── 1. PRINCIPLES STAGGER ─────────────────────────────────
     .wfs-bridge-principles__item fades in sequentially.
     90 ms stagger — editorial pace, not urgent.
  ──────────────────────────────────────────────────────────── */

  if (!reducedMotion && supportsIO) {
    var principles = toArray(
      document.querySelectorAll('.wfs-bridge-principles__item')
    );

    if (principles.length) {
      principles.forEach(function (item, i) {
        item.style.opacity   = '0';
        item.style.transform = 'translateY(12px)';
        item.style.transition =
          'opacity 500ms cubic-bezier(0.2,0.6,0.2,1) ' + (i * 90) + 'ms,' +
          'transform 500ms cubic-bezier(0.2,0.6,0.2,1) ' + (i * 90) + 'ms';
      });

      var principlesObs = makeObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          toArray(
            entry.target.querySelectorAll('.wfs-bridge-principles__item')
          ).forEach(function (item) { reveal(item); });
          principlesObs.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

      var principlesGrid = document.querySelector('.wfs-bridge-principles__grid');
      if (principlesGrid) principlesObs.observe(principlesGrid);
    }
  }


  /* ── 2. STATS STAGGER ──────────────────────────────────────
     .wfs-bridge-stats__item fades in left to right.
     More deliberate pace — these are trust anchors.
  ──────────────────────────────────────────────────────────── */

  if (!reducedMotion && supportsIO) {
    var statsItems = toArray(
      document.querySelectorAll('.wfs-bridge-stats__item')
    );

    if (statsItems.length) {
      statsItems.forEach(function (item, i) {
        item.style.opacity   = '0';
        item.style.transform = 'translateY(8px)';
        item.style.transition =
          'opacity 520ms cubic-bezier(0.2,0.6,0.2,1) ' + (i * 100) + 'ms,' +
          'transform 520ms cubic-bezier(0.2,0.6,0.2,1) ' + (i * 100) + 'ms';
      });

      var statsObs = makeObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          statsItems.forEach(function (item) { reveal(item); });
          statsObs.unobserve(entry.target);
        });
      }, { threshold: 0.2 });

      var statsStrip = document.querySelector('.wfs-bridge-stats');
      if (statsStrip) statsObs.observe(statsStrip);
    }
  }


  /* ── 3. BRIDGE NAV CARDS STAGGER ───────────────────────────
     .wfs-bridge-nav__card fades in sequentially.
     Reinforces the routing moment — deliberate discovery.
  ──────────────────────────────────────────────────────────── */

  if (!reducedMotion && supportsIO) {
    var navCards = toArray(
      document.querySelectorAll('.wfs-bridge-nav__card')
    );

    if (navCards.length) {
      navCards.forEach(function (card, i) {
        card.style.opacity   = '0';
        card.style.transform = 'translateY(10px)';
        card.style.transition =
          'opacity 480ms cubic-bezier(0.2,0.6,0.2,1) ' + (i * 75) + 'ms,' +
          'transform 480ms cubic-bezier(0.2,0.6,0.2,1) ' + (i * 75) + 'ms';
      });

      var navObs = makeObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          toArray(
            entry.target.querySelectorAll('.wfs-bridge-nav__card')
          ).forEach(function (card) { reveal(card); });
          navObs.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

      var navGrid = document.querySelector('.wfs-bridge-nav__grid');
      if (navGrid) navObs.observe(navGrid);
    }
  }


  /* ── 4. OPERATOR PROFILE REVEAL ────────────────────────────
     The operator section fades in as a unit.
     Single element — no stagger needed.
  ──────────────────────────────────────────────────────────── */

  if (!reducedMotion && supportsIO) {
    var operatorFigure = document.querySelector('.wfs-bridge-operator__figure');

    if (operatorFigure) {
      operatorFigure.style.opacity   = '0';
      operatorFigure.style.transform = 'translateY(10px)';
      operatorFigure.style.transition =
        'opacity 600ms cubic-bezier(0.16,1,0.3,1),' +
        'transform 600ms cubic-bezier(0.16,1,0.3,1)';

      var figureObs = makeObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          figureObs.unobserve(entry.target);
        });
      }, { threshold: 0.15 });

      figureObs.observe(operatorFigure);
    }
  }


  /* ── 5. PAIN ROWS REVEAL ───────────────────────────────────
     /bookkeeping-problems/* pages.
     Pain rows reveal sequentially as user reads down.
  ──────────────────────────────────────────────────────────── */

  if (!reducedMotion && supportsIO) {
    var painRows = toArray(
      document.querySelectorAll('.wfs-bridge-pain__row')
    );

    if (painRows.length) {
      painRows.forEach(function (row) {
        row.style.opacity   = '0';
        row.style.transform = 'translateY(8px)';
        row.style.transition =
          'opacity 460ms cubic-bezier(0.2,0.6,0.2,1),' +
          'transform 460ms cubic-bezier(0.2,0.6,0.2,1)';
      });

      var painObs = makeObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          painObs.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -24px 0px' });

      painRows.forEach(function (row) { painObs.observe(row); });
    }
  }


  /* ── 6. NARRATIVE HIGHLIGHT REVEAL ─────────────────────────
     The .wfs-bridge-narrative__highlight (key statement)
     fades in with a slight left shift — editorial entrance.
  ──────────────────────────────────────────────────────────── */

  if (!reducedMotion && supportsIO) {
    var highlights = toArray(
      document.querySelectorAll('.wfs-bridge-narrative__highlight')
    );

    if (highlights.length) {
      highlights.forEach(function (hl) {
        hl.style.opacity   = '0';
        hl.style.transform = 'translateX(-8px)';
        hl.style.transition =
          'opacity 560ms cubic-bezier(0.16,1,0.3,1),' +
          'transform 560ms cubic-bezier(0.16,1,0.3,1)';
      });

      var hlObs = makeObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          hlObs.unobserve(entry.target);
        });
      }, { threshold: 0.2 });

      highlights.forEach(function (hl) { hlObs.observe(hl); });
    }
  }

}());
