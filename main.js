/* CLIA — progressive enhancement only.
   Every section is fully visible and legible with this file absent. Nothing
   here creates content; it only adds motion and form behaviour on top of
   markup that already works. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* scrollcraft's shoot.mjs waits for html.sc-ready before sampling. It is a
     statement that the page's motion state is settled, so it is set in EVERY
     mode: with motion, without GSAP, and under reduced motion — in the last
     two the settled state is simply the static page. */
  document.documentElement.classList.add('sc-ready');

  /* ── the bar ──────────────────────────────────────────────────
     The hairline is now painted by the stylesheet at every scroll position, so
     nothing here is needed to make the bar legible. Two behaviours only, and
     the bar works completely without either.

     THE MENU SHEET is a <details>, which means it opens, closes and takes
     keyboard focus with this file absent. What is added here is the explicit
     aria-expanded mirror and closing the sheet when a link inside it is
     tapped — a sheet that stays open over the section it just scrolled to is
     the one thing the native element does not handle. */
  var bar = document.querySelector('.nav');
  var menu = document.querySelector('[data-menu]');

  if (menu) {
    var mb = menu.querySelector('summary');
    var sync = function () { if (mb) mb.setAttribute('aria-expanded', menu.open ? 'true' : 'false'); };
    sync();
    menu.addEventListener('toggle', sync);
    menu.addEventListener('click', function (ev) {
      var a = ev.target.closest && ev.target.closest('a[href]');
      if (a) { menu.open = false; sync(); }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && menu.open) { menu.open = false; sync(); if (mb) mb.focus(); }
    });
  }

  if (bar && !reduced) {
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

    var tile = document.querySelector('.ht');
    var zone = document.querySelector('.hz');

    /* One tile now, so the entrance is one movement rather than a staggered
       field: it fades up while the type is already set. */
    if (tile) {
      gsap.from(tile, {
        opacity: 0, y: 20,
        duration: 0.7, ease: 'power2.out'
      });
    }

    /* The display lines wipe up once on load, then the hero holds still — the
       first authored silence in BRIEF.md. The wipe runs on clip-path with
       overshoot margins because the display leading is 0.90 and a wipe clipped
       to the line box would shave the descenders (DEVICES.md §2); clearProps
       removes the clip entirely at rest so nothing stays cropped. */
    gsap.utils.toArray('.hz__l').forEach(function (line, i) {
      gsap.fromTo(line,
        { clipPath: 'inset(0% -6% 100% -6%)', y: 12 },
        {
          clipPath: 'inset(-14% -6% -14% -6%)', y: 0,
          duration: 0.62, ease: 'power3.out', delay: 0.08 * i,
          clearProps: 'clipPath,transform'
        });
    });

    /* Parallax, quieter than it was: 14px of drift over the whole hero, not a
       theme park, and only where the tile floats beside the type. scrub:true
       rather than a number is deliberate — a scrubbed tween with inertia keeps
       moving for half a second after the scroll stops, which is enough to make
       two screenshots of the same element disagree and hand tools/contrast.mjs
       a false glyph mask. */
    if (zone && tile && window.matchMedia('(min-width: 1360px)').matches) {
      gsap.to(tile, {
        y: -14, ease: 'none',
        scrollTrigger: { trigger: zone, start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    /* fade-up reveals for everything below the hero. Grouped by the block that
       holds them so a bento's cards come in together and stagger inside their
       own grid rather than one at a time down a 10,000px page. */
    gsap.utils.toArray('.bento').forEach(function (grid) {
      var cards = gsap.utils.toArray(':scope > *', grid);
      if (!cards.length) return;
      gsap.from(cards, {
        opacity: 0, y: 14,
        duration: 0.62, ease: 'power3.out', stagger: 0.07,
        clearProps: 'transform',
        scrollTrigger: { trigger: grid, start: 'top 88%', once: true }
      });
    });

    gsap.utils.toArray('.sh, .rc__band, .ev3__tl, .cl__acts, .cl__qs, .cl__foot, .hero__body')
      .forEach(function (el) {
        gsap.from(el, {
          opacity: 0, y: 14,
          duration: 0.62, ease: 'power3.out',
          clearProps: 'transform',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true }
        });
      });

    /* ── scrollcraft ──────────────────────────────────────────
       The three devices ported from the scrollcraft skill (method:
       scrollcraft/METHOD.md, numbers: scrollcraft/DEVICES.md). The class gates
       the stylesheet's stage rules, so the flat page is what everyone without
       this branch gets — that is the no-JS and reduced-motion story in one
       line. Each stage publishes data-sc-verify-state with its RENDERED value,
       because the skill's harness treats raw progress as the exact cheat it
       exists to catch. */
    document.documentElement.classList.add('scrollcraft');

    /* smoothstep, the cue easing the engine uses for every ramp */
    function smooth(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }

    /* cue(el, p): the engine's cue contract — from/to in act progress,
       ramps as fractions of the window (defaults 0.3/0.3), a 2.4vh rise on
       entry, opacity handed straight to the element. */
    function cue(el, p, from, to, rIn, rOut) {
      var win = Math.max(to - from, 0.001);
      var inEnd = from + win * (rIn === undefined ? 0.3 : rIn);
      var outStart = to - win * (rOut === undefined ? 0.3 : rOut);
      var vis;
      if (p < from) vis = 0;
      else if (p < inEnd) vis = smooth((p - from) / Math.max(inEnd - from, 0.001));
      else if (p <= outStart) vis = 1;
      else vis = smooth(1 - (p - outStart) / Math.max(to - outStart, 0.001));
      gsap.set(el, {
        opacity: vis,
        y: (1 - vis) * 2.4 * window.innerHeight / 100,
        force3D: true
      });
      return vis;
    }

    /* THE POSTER DECK — the peak. The stage in the stylesheet is 340svh; the
       band rides sticky inside it while the three evenings cross-advance.
       Windows overlap by ~15% of the act; the first poster greets (rIn 0) so
       the stage is never empty on entry, the last holds (rOut 0) so the act
       does not end on a blank card. */
    var stage = document.querySelector('[data-sc-stage="posters"]');
    var deck = stage ? gsap.utils.toArray('.rc__poster', stage) : [];
    if (stage && deck.length === 3) {
      /* The flat band's sizes attribute describes a 132px thumbnail, and with
         a w-descriptor srcset that sets the image's INTRINSIC width, so the
         deck would lay the poster out at 132px however much room it has. In
         deck mode the poster owns most of a viewport, so say so — this also
         makes the browser fetch the 1080 candidate where one exists. */
      deck.forEach(function (li) {
        var img = li.querySelector('img');
        if (img) img.setAttribute('sizes',
          '(min-width:900px) min(64svh, 560px), calc(100vw - 128px)');
      });
      var windows = [[0, 0.42, 0, 0.35], [0.28, 0.72, 0.3, 0.3], [0.58, 1, 0.3, 0]];
      ScrollTrigger.create({
        trigger: stage, start: 'top top', end: 'bottom bottom', scrub: true,
        onUpdate: function (st) {
          var p = st.progress, up = 0, upVis = 0;
          deck.forEach(function (el, i) {
            var w = windows[i];
            var v = cue(el, p, w[0], w[1], w[2], w[3]);
            if (v >= upVis) { upVis = v; up = i; }
          });
          stage.setAttribute('data-sc-verify-state',
            'poster:' + (up + 1) + '/3 vis:' + upVis.toFixed(2));
        }
      });
      /* first paint before the first scroll event */
      deck.forEach(function (el, i) {
        var w = windows[i];
        cue(el, 0, w[0], w[1], w[2], w[3]);
      });
      stage.setAttribute('data-sc-verify-state', 'poster:1/3 vis:1.00');
    }

    /* THE NIGHT RUNS — the timeline draws as it is scrolled. Four brass rules
       fill in sequence over the card's own passage through the viewport, and
       each hour lifts from 0.55 to full as its rule completes. Fill elements
       are created here, so the flat page never carries them. */
    var tl = document.querySelector('.ev3__tl');
    var hours = tl ? gsap.utils.toArray('.tl__i', tl) : [];
    if (tl && hours.length) {
      var fills = hours.map(function (li) {
        var f = document.createElement('span');
        f.className = 'tl__fill';
        f.setAttribute('aria-hidden', 'true');
        li.appendChild(f);
        return f;
      });
      ScrollTrigger.create({
        trigger: tl, start: 'top 85%', end: 'top 25%', scrub: true,
        onUpdate: function (st) {
          var p = st.progress, lit = 0;
          hours.forEach(function (li, i) {
            var k = smooth((p - i / hours.length) * hours.length);
            gsap.set(fills[i], { scaleX: k });
            gsap.set(li, { opacity: 0.55 + 0.45 * k });
            if (k >= 1) lit++;
          });
          tl.setAttribute('data-sc-verify-state', 'lit:' + lit + '/' + hours.length);
        }
      });
      hours.forEach(function (li) { gsap.set(li, { opacity: 0.55 }); });
    }

    /* THE CLOCK — the signature move. The page runs on the evening's own
       timetable: 6:30 at the top, 7:00 where the record begins, 9:00 where
       the room turns, 9:30 at the close, where it stops and stays stopped.
       Scroll position IS the time. The chip is created here so a page
       without this branch simply has no clock; the four printed times in
       the timeline already carry the information. */
    var anchors = [
      { el: document.getElementById('hero'), min: 390 },      /* 6:30 PM */
      { el: document.getElementById('record'), min: 420 },    /* 7:00 PM */
      { el: document.getElementById('evening'), min: 540 },   /* 9:00 PM */
      { el: document.getElementById('close'), min: 570 }      /* 9:30 PM */
    ];
    if (anchors.every(function (a) { return a.el; })) {
      var clock = document.createElement('div');
      clock.className = 'clock';
      clock.setAttribute('aria-hidden', 'true');
      clock.innerHTML = '<span class="clock__t">6:30 PM</span>' +
        '<span class="clock__bar"><span class="clock__fill"></span></span>';
      document.body.appendChild(clock);
      var ct = clock.querySelector('.clock__t');
      var cf = clock.querySelector('.clock__fill');
      var shown = '';
      var tick = function () {
        var y = window.scrollY;
        var tops = anchors.map(function (a) {
          return a.el.getBoundingClientRect().top + window.scrollY;
        });
        var min = anchors[0].min;
        if (y >= tops[tops.length - 1]) {
          min = anchors[anchors.length - 1].min;
        } else {
          for (var i = 0; i < tops.length - 1; i++) {
            if (y >= tops[i] && y < tops[i + 1]) {
              var f = (y - tops[i]) / Math.max(tops[i + 1] - tops[i], 1);
              min = anchors[i].min + f * (anchors[i + 1].min - anchors[i].min);
              break;
            }
          }
          if (y < tops[0]) min = anchors[0].min;
        }
        min = Math.round(min);
        var h = Math.floor(min / 60), m = min % 60;
        var label = h + ':' + (m < 10 ? '0' + m : m) + ' PM';
        if (label !== shown) { shown = label; ct.textContent = label; }
        gsap.set(cf, { scaleX: (min - 390) / 180 });
        clock.setAttribute('data-sc-verify-state', label);
      };
      ScrollTrigger.create({ trigger: document.body, start: 0, end: 'max', onUpdate: tick });
      tick();
    }

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
