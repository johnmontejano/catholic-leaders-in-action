/* CLIA — progressive enhancement only.
   Every section is fully visible and legible with this file absent. Nothing
   here creates content; it only adds motion and form behaviour on top of
   markup that already works. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── the bar's hairline ───────────────────────────────────────
     Claude's bar is borderless at the top of the page and grows a rule once you
     scroll. With this file absent the bar simply keeps the borderless state,
     which is the correct state at the top and is legible everywhere else — the
     bar is on --paper and the rule is a refinement, not the thing that makes it
     readable. Gated on reduced motion with everything else: a bar that changes
     as the page moves is page-driven movement even though it is one property. */
  var bar = document.querySelector('.nav');
  if (bar && !reduced) {
    var past = false;
    var mark = function () {
      var now = (window.scrollY || 0) > 4;
      if (now !== past) { past = now; bar.classList.toggle('is-past', now); }
    };
    mark();
    window.addEventListener('scroll', mark, { passive: true });

    /* the three anchors glide rather than jump. Scoped to these links on
       purpose — see the note in styles.css about what a global
       scroll-behavior:smooth does to the measuring tools. */
    bar.addEventListener('click', function (ev) {
      var a = ev.target.closest && ev.target.closest('a[href^="#"]');
      if (!a) return;
      var t = document.getElementById(a.getAttribute('href').slice(1));
      if (!t) return;
      ev.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ── motion, driven by GSAP ───────────────────────────────────
     THE TWO HARD RULES, and how each one is met by construction rather than by
     a rule written down somewhere else:

     1. With JavaScript disabled every element is fully visible. There is no
        hidden initial state ANYWHERE in the stylesheet for these elements —
        not even behind an html.can-reveal gate. The start state is applied by
        gsap.from(), which cannot run unless GSAP itself has loaded and this
        file is executing. If either is missing, or the file 404s, or the
        browser has scripting off, the page is simply the page. That is
        strictly safer than the gate, because the gate still fails if the
        script that removes it never arrives.

     2. Under prefers-reduced-motion: reduce, ZERO animation runs. This block
        returns before a single GSAP call is made, so no tween is created, no
        ScrollTrigger is registered, and GSAP's ticker — which starts lazily on
        the first tween — never starts a requestAnimationFrame loop at all. The
        stylesheet's own reduce block kills the two CSS hover transitions.

     Only transform and opacity are animated, so nothing here can move a layout
     box and no scroll animation can produce cumulative layout shift. */
  if (!reduced && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    var tiles = gsap.utils.toArray('.ht');
    var zone  = document.querySelector('.hz');

    /* the tiles arrive first, staggered from the middle outwards, so the type
       is already set when the field lands around it */
    if (tiles.length) {
      gsap.from(tiles, {
        opacity: 0, y: 26, scale: 0.965,
        duration: 0.75, ease: 'power2.out', stagger: 0.07
      });
    }

    /* Parallax, Claude-subtle: a few pixels of drift over the whole hero, not a
       theme park. scrub:true rather than a number is deliberate — a scrubbed
       tween with inertia keeps moving for half a second after the scroll stops,
       which is enough to make two screenshots of the same element disagree and
       hand tools/contrast.mjs a false glyph mask. */
    if (zone && tiles.length && window.matchMedia('(min-width: 900px)').matches) {
      var drift = [-22, 14, -30, 18, -12];
      tiles.forEach(function (t, i) {
        gsap.to(t, {
          y: drift[i % drift.length],
          ease: 'none',
          scrollTrigger: { trigger: zone, start: 'top top', end: 'bottom top', scrub: true }
        });
      });
    }

    /* fade-up reveals for everything below the hero. Grouped by the block that
       holds them so a bento's cards come in together and stagger inside their
       own grid rather than one at a time down a 10,000px page. */
    gsap.utils.toArray('.bento').forEach(function (grid) {
      var cards = gsap.utils.toArray(':scope > *', grid);
      if (!cards.length) return;
      gsap.from(cards, {
        opacity: 0, y: 24,
        duration: 0.6, ease: 'power2.out', stagger: 0.06,
        clearProps: 'transform',
        scrollTrigger: { trigger: grid, start: 'top 88%', once: true }
      });
    });

    gsap.utils.toArray('.rc__head, .ev3__head, .cl__head, .cl__qs, .cl__foot, .hero__body')
      .forEach(function (el) {
        gsap.from(el, {
          opacity: 0, y: 20,
          duration: 0.6, ease: 'power2.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true }
        });
      });

    /* Late-loading photographs change every card's height. Without this the
       triggers keep the positions they were measured at during parse and fire
       against the wrong scroll offsets. */
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* ── phone field ──────────────────────────────────────────────
     Formats as typed, rejects anything short of 10 digits, and never reports
     success while the endpoint is unset. Wired by piece 4; harmless if absent. */
  var form = document.querySelector('[data-signup]');
  if (!form) return;

  var input = form.querySelector('input[type="tel"]');
  var note = form.querySelector('[data-signup-note]');
  var ENDPOINT = form.getAttribute('data-endpoint') || '';

  function digits(v) { return (v || '').replace(/\D/g, '').slice(0, 10); }
  function format(d) {
    if (d.length < 4) return d;
    if (d.length < 7) return '(' + d.slice(0, 3) + ') ' + d.slice(3);
    return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + ' ' + d.slice(6);
  }
  function say(msg, ok) {
    if (!note) return;
    note.textContent = msg;
    note.dataset.state = ok ? 'ok' : 'err';
  }

  if (input) {
    input.addEventListener('input', function () {
      var start = input.selectionStart === input.value.length;
      input.value = format(digits(input.value));
      if (start) input.setSelectionRange(input.value.length, input.value.length);
    });
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var d = digits(input && input.value);
    if (d.length !== 10) {
      say('That needs to be a 10 digit US number.', false);
      if (input) input.focus();
      return;
    }
    if (!ENDPOINT) {
      say('The text list is not connected yet. Use the RSVP link above for September 1.', false);
      return;
    }
    say('Sending.', true);
    fetch(ENDPOINT, {
      method: 'POST', mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ phone: d, at: new Date().toISOString() })
    })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function () { say('Done. We will text you when the next date is set.', true); form.reset(); })
      .catch(function () { say('That did not go through. Use the RSVP link above for September 1.', false); });
  });
})();
