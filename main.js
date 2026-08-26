/* CLIA — progressive enhancement only.
   Every section is fully visible and legible with this file absent. Nothing
   here creates content; it only adds motion and form behaviour on top of
   markup that already works. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* scrollcraft's shoot.mjs waits for html.sc-ready before sampling. The
     engine sets it on mount; when the mount is skipped (reduced motion, or
     the engine file missing) it is set here, because the settled state in
     those modes is simply the static page. */
  if (reduced || !window.ScrollCraft) document.documentElement.classList.add('sc-ready');

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

  /* ── motion, driven by the scrollcraft engine ─────────────────
     scrollcraft.js reads the data-sc-* attributes off the markup and drives
     them from one scroll value; nothing here generates DOM for content. The
     TWO HARD RULES survive the engine swap, but by different means than the
     GSAP build, and both are now guaranteed in styles.css rather than here:

     1. Without JavaScript every element is fully visible. The engine's own
        stylesheet hides cue targets; the html.no-js override un-hides them,
        and .no-js is only ever removed by a script.

     2. Under prefers-reduced-motion the engine is never mounted — the skill
        ships "gentler, not zero" and the house contract is zero — and the
        reduce override shows the full static page. sc-ready is still set so
        the verification harness can sample the settled page. */
  if (!reduced && window.ScrollCraft) {

    /* The hero pin only fits where the absolute composition does. Below 1360
       the act becomes a plain flow act BEFORE mount: same cues, lit on
       arrival instead of assembled under the first scroll. */
    var hz = document.querySelector('.hz__act');
    if (hz && !window.matchMedia('(min-width: 1360px)').matches) {
      hz.setAttribute('data-sc-act', 'flow');
      hz.removeAttribute('data-sc-span');
    }

    /* The record pin holds 3.4 viewport-heights on a desktop wheel. On a phone
       a full viewport per poster makes the page 17 screens against the
       skill's 8-to-14 band; 2.6 keeps each poster on screen for most of a
       thumb-swipe and returns 1.6 screens to the rest of the page. */
    var rc = document.querySelector('.rc__act');
    if (rc && !window.matchMedia('(min-width: 900px)').matches) {
      rc.setAttribute('data-sc-span', '3');
    }

    /* The flat band's sizes attribute describes a 132px thumbnail, and with a
       w-descriptor srcset that sets the image's INTRINSIC width. In the deck
       the poster owns most of a viewport, so say so before the engine lays
       out — this also fetches the 1080 candidate where one exists. */
    document.querySelectorAll('.rc__poster img').forEach(function (img) {
      img.setAttribute('sizes', '(min-width:900px) min(64svh, 560px), calc(100vw - 128px)');
    });

    ScrollCraft.mount(document.body);

    /* THE CLOCK — the signature move, bespoke page JS as the skill requires
       (the engine is never edited). The page runs on the evening's own
       timetable: 6:30 PM at the top, 7:00 where the record begins, 9:00
       where the room turns, 9:30 at the close, where it stops and stays
       stopped. Scroll position IS the time. It publishes its rendered time
       as data-sc-verify-state, never raw progress. */
    var anchors = [
      { el: document.getElementById('hero'), min: 390 },
      { el: document.getElementById('record'), min: 420 },
      { el: document.getElementById('evening'), min: 540 },
      { el: document.getElementById('close'), min: 570 }
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
      var ticking = false;
      var tick = function () {
        ticking = false;
        var y = window.scrollY;
        var tops = anchors.map(function (a) {
          return a.el.getBoundingClientRect().top + window.scrollY;
        });
        var min = anchors[0].min;
        if (y >= tops[tops.length - 1]) {
          min = anchors[anchors.length - 1].min;
        } else if (y >= tops[0]) {
          for (var i = 0; i < tops.length - 1; i++) {
            if (y >= tops[i] && y < tops[i + 1]) {
              var f = (y - tops[i]) / Math.max(tops[i + 1] - tops[i], 1);
              min = anchors[i].min + f * (anchors[i + 1].min - anchors[i].min);
              break;
            }
          }
        }
        min = Math.round(min);
        var h = Math.floor(min / 60), m = min % 60;
        var label = h + ':' + (m < 10 ? '0' + m : m) + ' PM';
        if (label !== shown) { shown = label; ct.textContent = label; }
        cf.style.transform = 'scaleX(' + ((min - 390) / 180).toFixed(4) + ')';
        clock.setAttribute('data-sc-verify-state', label);
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(tick); }
      }, { passive: true });
      window.addEventListener('load', tick);
      tick();
    }
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
