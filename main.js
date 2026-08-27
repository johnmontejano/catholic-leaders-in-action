/* CLIA — progressive enhancement only, and nothing else.

   SPEC §7: the page is complete at paint. Every section, every image and every
   word is laid out and legible with this file absent, with JavaScript off, and
   with prefers-reduced-motion on. Nothing here creates content, pins a section,
   reads layout per frame or drives anything from a scroll offset.

   Four behaviours, and this is the complete list:
     1. the bar's two states
     2. the menu sheet's aria-expanded mirror and tap-to-close
     3. one entrance fade for blocks that start below the first viewport
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

  /* ── 3. the entrance, SPEC §7.2.1 ─────────────────────────────
     opacity and 10px, 300ms, once, then unobserved. The pre-state class is
     added HERE and never written into the HTML, so a JS-off render has nothing
     to resolve. Only blocks starting below 90% of the first viewport are ever
     touched, so nothing above the fold moves. A 900ms failsafe then clears
     every remaining pre-state class unconditionally, which is what makes a
     cold screenshot at any offset a screenshot of a finished page. */
  if (!reduced && 'IntersectionObserver' in window) {
    var blocks = [];
    var sections = document.querySelectorAll('main > section');
    for (var s = 0; s < sections.length; s++) {
      var kids = sections[s].children;
      for (var k = 0; k < kids.length; k++) {
        if (kids[k].getBoundingClientRect().top > window.innerHeight * 0.9) blocks.push(kids[k]);
      }
    }

    var clear = function (el) { el.classList.remove('reveal'); el.classList.add('revealed'); };

    if (blocks.length) {
      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) { clear(entries[i].target); io.unobserve(entries[i].target); }
        }
      }, { threshold: 0.05, rootMargin: '0px 0px -8% 0px' });

      for (var b = 0; b < blocks.length; b++) {
        blocks[b].classList.add('reveal');
        io.observe(blocks[b]);
      }

      setTimeout(function () {
        var left = document.querySelectorAll('.reveal');
        for (var i = 0; i < left.length; i++) { clear(left[i]); io.unobserve(left[i]); }
        io.disconnect();
      }, 900);
    }
  }

  /* smooth anchor scrolling, skipped entirely under reduced motion */
  if (!reduced) {
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest && ev.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var t = document.getElementById(id);
      if (!t) return;
      ev.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
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
      say('That needs to be a 10 digit US number.', false);
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
