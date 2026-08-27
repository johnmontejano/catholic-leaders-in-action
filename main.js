/* CLIA — progressive enhancement only, and nothing else.

   SPEC §4: the page is complete at paint. Every section, every image and every
   word is laid out and legible with this file absent, with JavaScript off, and
   with prefers-reduced-motion on. Nothing here creates content, pins a section,
   reads layout per frame, or drives anything from a scroll offset. No frame
   loop is scheduled anywhere in this file, and none ever will be.

   Four behaviours, and this is the complete list:
     1. the bar's two states
     2. the menu sheet's aria-expanded mirror and tap-to-close
     3. the entrance reveal — M1, M2 and the §4.3 failsafe
     4. the phone field                                                       */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ── 1. the bar ───────────────────────────────────────────────
     One class toggle at the hero boundary. The threshold is measured once on
     load and once on resize, never per scroll event, so the listener reads a
     number and sets a class and does no layout work at all. */
  var hero = document.getElementById('top');
  if (hero) {
    var barH = 0, edge = 0, solid = false;

    var remeasure = function () {
      barH = window.matchMedia('(min-width: 900px)').matches ? 72 : 64;
      edge = hero.offsetHeight - barH;
      apply();
    };
    var apply = function () {
      var want = window.scrollY > edge;
      if (want !== solid) { solid = want; root.classList.toggle('bar-solid', want); }
    };

    window.addEventListener('scroll', apply, { passive: true });
    window.addEventListener('resize', remeasure);
    remeasure();
  }

  /* ── 2. the menu sheet ────────────────────────────────────────
     <details> already opens, closes and takes keyboard focus with this file
     absent. Added here: the explicit aria-expanded mirror, and closing the
     sheet after a link inside it is used. */
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

  /* ── 3. the entrance — SPEC §4.1 M1/M2 and §4.3 ───────────────
     M1: opacity 0.001 -> 1 plus 16px of rise, 480ms, once per element, one
     IntersectionObserver, then unobserved. M2: inside a [data-stagger] group,
     children step 70ms apart to a maximum of four steps / 280ms.

     Three things make this safe against the failure that got round 2 rejected:

       · the pre-state lives behind [data-rv=on], which the inline head script
         sets and which is absent under reduced motion or with JS off;
       · elements in the first viewport are never given .rv at all, so the
         whole hero is final at paint at 1440 and at 390;
       · the failsafe below removes data-rv unconditionally 1200ms after load,
         which is 400ms before cold.mjs takes its 1600ms measurement.

     Anything that goes wrong here — an observer that never fires, a thrown
     error, a browser without IntersectionObserver — ends with the page fully
     opaque, because removing the attribute is what "final state" means. */
  var marked = document.querySelectorAll('.rv');
  var release = function () { root.removeAttribute('data-rv'); };

  if (reduced || !('IntersectionObserver' in window)) {
    release();
  } else {
    var i, el;

    // §4.3.3 — nothing above the fold ever animates.
    for (i = 0; i < marked.length; i++) {
      el = marked[i];
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.remove('rv');
    }

    // M2 — the stagger, capped at four steps. Written once, here, never per
    // frame, and expressed as transition-delay so R4 can measure it.
    var groups = document.querySelectorAll('[data-stagger]');
    for (i = 0; i < groups.length; i++) {
      var kids = groups[i].querySelectorAll('.rv');
      for (var k = 0; k < kids.length; k++) {
        kids[k].style.transitionDelay = Math.min(k * 70, 280) + 'ms';
      }
    }

    var live = document.querySelectorAll('.rv');
    if (live.length) {
      var io = new IntersectionObserver(function (entries) {
        for (var n = 0; n < entries.length; n++) {
          if (entries[n].isIntersecting) {
            entries[n].target.classList.add('is-in');
            io.unobserve(entries[n].target);
          }
        }
      }, { threshold: 0.12, rootMargin: '0px 0px -12% 0px' });

      for (i = 0; i < live.length; i++) io.observe(live[i]);
    }

    // §4.3.4 — the failsafe. After 1.2s the page is opaque no matter what the
    // observer did or did not do.
    window.addEventListener('load', function () { setTimeout(release, 1200); });
    setTimeout(release, 4000);
  }

  /* ── 4. the phone field ───────────────────────────────────────
     Formats as typed, rejects anything short of ten digits, and never reports
     success while data-endpoint is empty. */
  var form = document.querySelector('[data-signup]');
  if (!form) return;

  var input = form.querySelector('input[type="tel"]');
  var note = form.querySelector('[data-signup-note]');
  var pot = form.querySelector('input[name="company"]');
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
    note.setAttribute('data-state', ok ? 'ok' : 'err');
  }

  if (input) {
    input.addEventListener('input', function () {
      var atEnd = input.selectionStart === input.value.length;
      input.value = format(digits(input.value));
      if (atEnd) input.setSelectionRange(input.value.length, input.value.length);
    });
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (pot && pot.value) return;
    var d = digits(input && input.value);
    if (d.length !== 10) {
      say('That needs to be 10 digits, US numbers only.', false);
      if (input) input.focus();
      return;
    }
    if (!ENDPOINT) {
      say('Signup is not connected yet. RSVP on Luma instead.', false);
      return;
    }
    say('Sending.', true);
    fetch(ENDPOINT, {
      method: 'POST', mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ phone: '+1' + d, source: 'site', consent: true })
    })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function () { say('Added. We will text you when the next date is set.', true); form.reset(); })
      .catch(function () { say('That did not go through. Use the RSVP link instead.', false); });
  });
})();
