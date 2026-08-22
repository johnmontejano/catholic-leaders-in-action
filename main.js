/* CLIA — progressive enhancement only.
   Every section is fully visible and legible with this file absent. Nothing
   here creates content; it only adds motion and form behaviour on top of
   markup that already works. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── reveal on entry ──────────────────────────────────────────
     .reveal starts at opacity 0 ONLY once this script has confirmed it can
     turn it back on. Without JS, or with reduced motion, the CSS keeps it at
     opacity 1 — a section must never be able to strand itself invisible. */
  var targets = document.querySelectorAll('.reveal');
  if (targets.length && !reduced && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('can-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    targets.forEach(function (t) { io.observe(t); });
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
