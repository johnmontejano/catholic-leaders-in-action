/* CLIA — progressive enhancement only, and nothing else.

   SPEC §9: the page is complete at paint. Every section, every image and every
   word is laid out and legible with this file absent, with JavaScript off, and
   with prefers-reduced-motion on. Nothing here creates content, pins a section,
   or drives composition from a scroll offset.

   Five behaviours, and this is the complete list:
     1. the bar's two states
     2. the menu sheet's aria-expanded mirror and tap-to-close
     3. the entrance reveal — the §9.6 system, unchanged, plus its failsafe
     4. the phone field
     5. the §9.5 scrub envelope, which is the ONLY frame loop in this file and
        lives inside one delimited block                                      */
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

  /* ── 3. the entrance — SPEC §9.6, kept verbatim because it works ──
     Fade 0.001 -> 1 plus 16px of rise, 480ms, once per element, one
     IntersectionObserver, then unobserved. Inside a [data-stagger] group,
     children step 70ms apart to a maximum of four steps / 280ms.

     Three things make this safe against the failure that got an earlier round
     rejected:

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

    // nothing above the fold ever animates
    for (i = 0; i < marked.length; i++) {
      el = marked[i];
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.remove('rv');
    }

    // the stagger, capped at four steps, written once and never per frame
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

    // the failsafe: after 1.2s the page is opaque no matter what the observer
    // did or did not do
    window.addEventListener('load', function () { setTimeout(release, 1200); });
    setTimeout(release, 4000);
  }

  /* ── 3b. every disclosure reports its state ───────────────────────
     <details> opens and closes on its own with this file absent. What it does
     not do on its own is publish aria-expanded, so every summary carries the
     attribute in the HTML and this keeps it true.

     Two paths, because <details> fires `toggle` ASYNCHRONOUSLY. A listener
     alone leaves the attribute stale for anything that sets `.open` and reads
     the attribute in the same task, which is exactly what audit.mjs A12 does
     and exactly what a screen reader driving the element would do. So the
     property is mirrored for scripted toggles and the event for real clicks.
     Native behaviour is untouched: the setter still calls the native one. */
  var openDesc = Object.getOwnPropertyDescriptor(HTMLDetailsElement.prototype, 'open');
  var discs = document.querySelectorAll('details > summary[aria-expanded]');
  for (var d = 0; d < discs.length; d++) {
    (function (sum) {
      var det = sum.parentElement;
      var mirror = function () {
        sum.setAttribute('aria-expanded', det.hasAttribute('open') ? 'true' : 'false');
      };
      if (openDesc && openDesc.set && openDesc.get) {
        Object.defineProperty(det, 'open', {
          configurable: true,
          get: function () { return openDesc.get.call(det); },
          set: function (v) { openDesc.set.call(det, v); mirror(); }
        });
      }
      det.addEventListener('toggle', mirror);
      mirror();
    })(discs[d]);
  }

  /* ── 4. the scrub envelope — SPEC §9.5 ───────────────────────────────
     The owner asked for scroll-scrubbed video. This project also carries a
     twice-litigated ban on scroll-driven composition, and tools/cold.mjs
     exists to prove the page never depends on scroll. Both survive, under one
     envelope, and the envelope is what this block is.

     What it is allowed to touch: video.currentTime. That is the whole list. It
     never writes a style, a class, a transform, a size or a position, so no
     composition on this page can ever depend on it.

     A scrubbed <video> is a background layer whose section is complete,
     legible and final at paint with the video absent, paused, or at frame 0.
     Under prefers-reduced-motion, or with JS off, no src is ever attached and
     the poster is what renders.

     If no clip is on disk, tools/video-slots.mjs emits no <video> at all, this
     observer finds nothing, and __scrubRunning stays false forever. That is
     the state this build ships in: four declared slots, zero clips, every
     slot on its declared fallback.                                          */
  window.__scrubRunning = false;

  var scrubs = document.querySelectorAll('video[data-scrub]');
  if (!reduced && scrubs.length && 'IntersectionObserver' in window) {
    var active = [];

    var attach = function (v) {
      if (v.dataset.srcAttached) return;
      var src = v.getAttribute('data-src');
      if (!src) return;
      v.src = src;
      v.dataset.srcAttached = '1';
      v.load();
    };

    /* SCRUB */
    var frame = 0;
    var tick = function () {
      for (var a = 0; a < active.length; a++) {
        var v = active[a];
        var d = v.duration;
        if (!d || !isFinite(d)) continue;
        var r = v.getBoundingClientRect();
        var span = r.height + window.innerHeight;
        var p = span > 0 ? (window.innerHeight - r.top) / span : 0;
        p = p < 0 ? 0 : (p > 1 ? 1 : p);
        // alternate, so a clip that does not loop cleanly is still loop-safe
        var t = p <= 0.5 ? p * 2 : (1 - p) * 2;
        v.currentTime = t * d;
      }
      frame = active.length ? requestAnimationFrame(tick) : 0;
      window.__scrubRunning = !!frame;
    };
    var start = function () {
      if (frame) return;
      frame = requestAnimationFrame(tick);
      window.__scrubRunning = true;
    };
    var stop = function () {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      window.__scrubRunning = false;
    };
    /* END SCRUB */

    var so = new IntersectionObserver(function (entries) {
      for (var s = 0; s < entries.length; s++) {
        var v = entries[s].target;
        var at = active.indexOf(v);
        if (entries[s].isIntersecting) {
          attach(v);
          if (at < 0) active.push(v);
        } else if (at >= 0) {
          active.splice(at, 1);
        }
      }
      if (active.length) start(); else stop();
    }, { rootMargin: '0px' });

    for (var q = 0; q < scrubs.length; q++) so.observe(scrubs[q]);
  }

  /* ── 5. the phone field ───────────────────────────────────────
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
    say('Posting.', true);
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
