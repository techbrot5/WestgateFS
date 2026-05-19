/* =============================================================
   WestgateFS — conversion.js
   Shared UX layer for all HARD EP conversion pages.

   Targets CLASS selectors only. Never targets IDs.
   Safe to load on any page — gracefully does nothing
   if target elements are absent.

   Load with:
     <script src="/assets/js/conversion.js" defer></script>

   No dependencies. No build step. ES5-compatible with
   modern feature detection for IO and reduced-motion.
   ============================================================= */

(function () {
  'use strict';

  /* ── Environment checks ─────────────────────────────────── */

  var reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  var supportsIO = typeof IntersectionObserver === 'function';


  /* ── Utility: reveal a hidden element ───────────────────── */

  function reveal(el) {
    el.style.opacity   = '1';
    el.style.transform = 'none';
  }


  /* ── Utility: make an IntersectionObserver safely ───────── */

  function makeObserver(callback, options) {
    if (!supportsIO) return null;
    return new IntersectionObserver(callback, options);
  }


  /* ── Utility: NodeList → Array (ES5 safe) ───────────────── */

  function toArray(nodeList) {
    return Array.prototype.slice.call(nodeList);
  }


  /* ==========================================================
     1. FAQ ACCORDION
     When one <details> opens, close all others in the same
     .wfs-faq__list. Works on every FAQ list on the page.
     Uses capture phase so it fires before default toggle.
  ========================================================== */

  toArray(document.querySelectorAll('.wfs-faq__list')).forEach(function (list) {
    list.addEventListener('toggle', function (e) {
      if (!e.target.open) return;

      toArray(list.querySelectorAll('details[open]')).forEach(function (detail) {
        if (detail !== e.target) detail.removeAttribute('open');
      });
    }, true /* capture */);
  });


  /* ==========================================================
     2. PROCESS STEP SCROLL REVEAL
     Each .wfs-conv-process__step fades in sequentially as it
     enters the viewport. 55 ms stagger between steps.
     Only runs when motion is not reduced.
  ========================================================== */

  if (!reducedMotion) {
    var steps = toArray(document.querySelectorAll('.wfs-conv-process__step'));

    if (steps.length && supportsIO) {
      steps.forEach(function (step, i) {
        step.style.opacity    = '0';
        step.style.transform  = 'translateY(14px)';
        step.style.transition =
          'opacity 480ms cubic-bezier(0.2,0.6,0.2,1) ' + (i * 55) + 'ms,' +
          'transform 480ms cubic-bezier(0.2,0.6,0.2,1) ' + (i * 55) + 'ms';
      });

      var stepObserver = makeObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          stepObserver.unobserve(entry.target);
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      steps.forEach(function (step) { stepObserver.observe(step); });
    }
  }


  /* ==========================================================
     3. BEFORE / AFTER TRANSFORM REVEAL
     Before column enters first, after column 120 ms later —
     reinforcing the before → after emotional direction.
     Triggers when the .wfs-conv-transform__grid enters view.
  ========================================================== */

  if (!reducedMotion && supportsIO) {
    toArray(document.querySelectorAll('.wfs-conv-transform__grid')).forEach(function (grid) {
      var cols = toArray(grid.querySelectorAll('.wfs-conv-transform__col'));

      cols.forEach(function (col, i) {
        col.style.opacity    = '0';
        col.style.transform  = 'translateY(10px)';
        col.style.transition =
          'opacity 520ms cubic-bezier(0.16,1,0.3,1) ' + (i * 120) + 'ms,' +
          'transform 520ms cubic-bezier(0.16,1,0.3,1) ' + (i * 120) + 'ms';
      });

      var transformObserver = makeObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          cols.forEach(function (col) { reveal(col); });
          transformObserver.unobserve(entry.target);
        });
      }, { threshold: 0.15 });

      transformObserver.observe(grid);
    });
  }


  /* ==========================================================
     4. HERO TRUST ITEMS STAGGER
     .wfs-conv-hero__trust-item elements fade in sequentially
     on page load, after the hero text is already visible.
     Short base delay (280 ms) keeps hero text first.
  ========================================================== */

  if (!reducedMotion) {
    var trustItems = toArray(
      document.querySelectorAll('.wfs-conv-hero__trust-item')
    );

    if (trustItems.length) {
      trustItems.forEach(function (item, i) {
        item.style.opacity    = '0';
        item.style.transform  = 'translateY(6px)';
        item.style.transition =
          'opacity 400ms cubic-bezier(0.2,0.6,0.2,1) ' + (280 + i * 80) + 'ms,' +
          'transform 400ms cubic-bezier(0.2,0.6,0.2,1) ' + (280 + i * 80) + 'ms';
      });

      /* Trigger on next frame — text is already rendered */
      requestAnimationFrame(function () {
        trustItems.forEach(function (item) { reveal(item); });
      });
    }
  }


  /* ==========================================================
     5. INLINE NUDGE ENTRANCE
     .wfs-conv-nudge fades in when it enters the viewport.
     Subtler than steps — single element, shorter transition.
  ========================================================== */

  if (!reducedMotion && supportsIO) {
    var nudges = toArray(document.querySelectorAll('.wfs-conv-nudge'));

    if (nudges.length) {
      nudges.forEach(function (nudge) {
        nudge.style.opacity    = '0';
        nudge.style.transform  = 'translateY(8px)';
        nudge.style.transition =
          'opacity 440ms cubic-bezier(0.2,0.6,0.2,1),' +
          'transform 440ms cubic-bezier(0.2,0.6,0.2,1)';
      });

      var nudgeObserver = makeObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          nudgeObserver.unobserve(entry.target);
        });
      }, { threshold: 0.2 });

      nudges.forEach(function (nudge) { nudgeObserver.observe(nudge); });
    }
  }


  /* ==========================================================
     6. CLARIFIER CARD FOCUS RING POLISH
     On keyboard focus, bring the focused clarifier card to
     attention without overriding the CSS :focus-visible ring.
     Ensures the active card doesn't lose its branded treatment.
  ========================================================== */

  toArray(
    document.querySelectorAll('.wfs-conv-clarifier__card')
  ).forEach(function (card) {
    card.addEventListener('focusin', function () {
      card.style.outline = 'none'; /* CSS :focus-visible handles it */
    });
  });


  /* ==========================================================
     7. PRICING FACTOR KEYBOARD NAVIGATION
     Pricing factors are visual-only by default.
     This makes them navigable and discoverable for keyboard
     users by ensuring visible focus on the factor rows.
  ========================================================== */

  toArray(
    document.querySelectorAll('.wfs-conv-pricing__factor')
  ).forEach(function (factor) {
    if (!factor.getAttribute('tabindex')) {
      factor.setAttribute('tabindex', '0');
    }
  });


}());
