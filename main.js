/* ═══════════════════════════════════════════════════════════════════════════
   Catholic Leaders in Action — motion and the signup form.

   Everything here is decoration on top of a page that is already complete and
   legible without it (SPEC M8). The scroll engine is one rAF loop over a static
   list that writes CSS custom properties only: no layout reads per frame, no
   library, no dependency.
   ═══════════════════════════════════════════════════════════════════════════ */

/* Paste the Apps Script /exec URL here after deploying backend/Code.gs.
   While it is empty the form still validates and says plainly that signup is
   not connected, and it never reports a false success. */
var SIGNUP_ENDPOINT = '';

(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasJS = document.documentElement.hasAttribute('data-js');

  /* ── nav ─────────────────────────────────────────────────────────────── */
  var nav = document.getElementById('nav');
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.hidden = open;
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
      });
    });
  }

  /* Solid nav past the hero. One class flip at a boundary, not a per-frame write. */
  var hero = document.querySelector('.hero');
  if (nav && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) nav.removeAttribute('data-solid');
        else nav.setAttribute('data-solid', '');
      });
    }, { rootMargin: '-72px 0px 0px 0px', threshold: 0 }).observe(hero);
  }

  /* ── line reveals ────────────────────────────────────────────────────── */
  /* Each <span> is one line; we wrap its text in an <i> that slides up out of
     the span's own clip. The span keeps the text in flow, so with JS off or
     reduced motion on, the line is simply there. */
  if (hasJS && !reduced) {
    document.querySelectorAll('[data-reveal-lines]').forEach(function (el) {
      var lines = el.querySelectorAll('span');
      lines.forEach(function (s, i) {
        var i_ = document.createElement('i');
        i_.textContent = s.textContent;
        i_.style.setProperty('--i', i);
        s.textContent = '';
        s.appendChild(i_);
      });
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('lit'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -14% 0px', threshold: 0.15 });
      io.observe(el);
    });
    // the hero is above the fold; fire it on the next frame rather than on scroll
    var h1 = document.querySelector('.hero [data-reveal-lines]');
    if (h1) requestAnimationFrame(function () {
      requestAnimationFrame(function () { h1.classList.add('lit'); });
    });
  }

  /* ── image settle ────────────────────────────────────────────────────── */
  if (hasJS && !reduced) {
    var settleTargets = document.querySelectorAll(
      '.room__f, .stmt__fig, .ev__poster, .serve__strip figure, .close__media');
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('seen');
        sio.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    settleTargets.forEach(function (el) {
      el.setAttribute('data-settle', '');
      sio.observe(el);
      // anything already on screen at load settles on the next frame instead of
      // sitting inset until the user scrolls
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { el.classList.add('seen'); });
        });
      }
    });
  }

  /* ── marquee ─────────────────────────────────────────────────────────── */
  var marquees = [];
  document.querySelectorAll('[data-marq]').forEach(function (track) {
    var set = track.querySelector('.marq__set');
    if (!set) return;
    // Duplicate until the row is at least twice the viewport, so the wrap is seamless.
    var need = Math.ceil((innerWidth * 2) / Math.max(set.scrollWidth, 1)) + 1;
    for (var i = 0; i < need; i++) track.appendChild(set.cloneNode(true));
    marquees.push({
      el: track,
      w: set.scrollWidth,
      dir: parseFloat(track.getAttribute('data-marq')) || 1,
      x: 0
    });
  });

  /* ── the scroll engine ───────────────────────────────────────────────── */
  /* Registered once, measured on resize only. Each entry gets a progress p in
     0..1 across its own travel through the viewport, and writes CSS variables. */
  var tracked = [];

  function register(el, kind, opts) {
    tracked.push(Object.assign({ el: el, kind: kind, top: 0, h: 0 }, opts || {}));
  }

  document.querySelectorAll('[data-par]').forEach(function (el) {
    register(el, 'par', { amt: parseFloat(el.getAttribute('data-par')) || 0.12 });
  });
  document.querySelectorAll('.room, .next').forEach(function (el) { register(el, 'wipe'); });
  var pin = document.querySelector('[data-pin]');
  var pinTrack = document.querySelector('[data-pin-track]');
  if (pin && pinTrack) register(pin, 'pin', { track: pinTrack, max: 0 });
  var device = document.querySelector('[data-device]');
  if (device) register(device, 'device');

  function measure() {
    var sy = scrollY;
    tracked.forEach(function (t) {
      var r = t.el.getBoundingClientRect();
      t.top = r.top + sy;
      t.h = r.height;
      if (t.kind === 'pin' && t.track) {
        var pad = parseFloat(getComputedStyle(t.track).paddingLeft) || 0;
        t.max = Math.max(0, t.track.scrollWidth - innerWidth + pad);
        // The pinned run lasts exactly as long as the horizontal travel needs,
        // plus one viewport to hold on. No dead scroll, ever.
        t.el.style.height = pinIsActive() && t.max > 40
          ? (innerHeight + t.max * 1.05) + 'px'
          : '';
        var r2 = t.el.getBoundingClientRect();
        t.top = r2.top + sy; t.h = r2.height;
      }
    });
    marquees.forEach(function (m) {
      var set = m.el.querySelector('.marq__set');
      if (set) m.w = set.scrollWidth;
    });
  }

  var pinnedActive = false;
  function pinIsActive() {
    return hasJS && !reduced && innerWidth >= 1024;
  }

  var last = 0;
  function frame(now) {
    var sy = scrollY, vh = innerHeight;
    var dt = last ? Math.min((now - last) / 16.667, 3) : 1;
    last = now;

    for (var i = 0; i < tracked.length; i++) {
      var t = tracked[i];
      var el = t.el;

      if (t.kind === 'pin') {
        if (!pinIsActive()) { t.track.style.setProperty('--tx', '0px'); t.el.style.setProperty('--p', '0'); continue; }
        // progress across the pinned run
        var travel = t.h - vh;
        var p = travel > 0 ? (sy - t.top) / travel : 0;
        p = p < 0 ? 0 : p > 1 ? 1 : p;
        t.track.style.setProperty('--tx', (-p * t.max).toFixed(1) + 'px');
        t.el.style.setProperty('--p', p.toFixed(4));
        var idx = t.el.querySelector('[data-pin-i]');
        if (idx) {
          var n = Math.min(3, 1 + Math.floor(p * 2.999));
          if (idx.textContent !== '0' + n) idx.textContent = '0' + n;
        }
        continue;
      }

      // shared: 0 when the element's top reaches the bottom of the viewport,
      // 1 when its bottom reaches the top.
      var prog = (sy + vh - t.top) / (vh + t.h);
      prog = prog < 0 ? 0 : prog > 1 ? 1 : prog;

      if (t.kind === 'par') {
        if (reduced) continue;
        var range = t.h * t.amt;
        el.style.setProperty('--py', ((prog - 0.5) * range).toFixed(1) + 'px');
        if (el.classList.contains('hero__media')) {
          el.style.setProperty('--hs', (1.1 - 0.1 * Math.min(prog * 2, 1)).toFixed(4));
        }
      } else if (t.kind === 'wipe') {
        if (reduced) { el.style.setProperty('--rr', '0px'); continue; }
        // the dark chapter arrives rounded and settles flat against the paper
        var w = 1 - Math.min(prog / 0.30, 1);
        el.style.setProperty('--rr', (w * 56).toFixed(1) + 'px');
      } else if (t.kind === 'device') {
        if (reduced) continue;
        var d = (prog - 0.5) * 2;                       // -1 .. 1
        el.style.setProperty('--dry', (-8 + d * 7).toFixed(2) + 'deg');
        el.style.setProperty('--drx', (3 - d * 4).toFixed(2) + 'deg');
        el.style.setProperty('--py', (d * -22).toFixed(1) + 'px');
        var feed = el.querySelector('[data-feed]');
        if (feed && !feed.matches(':hover') && !feed.dataset.touched) {
          var maxS = feed.scrollHeight - feed.clientHeight;
          feed.scrollTop = Math.max(0, Math.min(maxS, prog * maxS * 1.25 - maxS * 0.12));
        }
      }
    }

    // marquee drifts on its own clock, independent of scroll
    if (!reduced) {
      for (var m = 0; m < marquees.length; m++) {
        var q = marquees[m];
        q.x -= 0.34 * dt * q.dir;
        if (q.dir > 0 && q.x <= -q.w) q.x += q.w;
        if (q.dir < 0 && q.x >= 0) q.x -= q.w;
        q.el.style.setProperty('--mx', q.x.toFixed(1) + 'px');
      }
    }

    requestAnimationFrame(frame);
  }

  if (hasJS) {
    // seed the reversed marquee so it starts inside its own wrap window
    marquees.forEach(function (q) { if (q.dir < 0) q.x = -q.w; });
    measure();
    addEventListener('resize', measure, { passive: true });
    addEventListener('load', measure);
    requestAnimationFrame(frame);

    // let a real touch on the feed take over from the scroll-driven position
    var feedEl = document.querySelector('[data-feed]');
    if (feedEl) {
      ['touchstart', 'wheel'].forEach(function (ev) {
        feedEl.addEventListener(ev, function () { feedEl.dataset.touched = '1'; }, { passive: true });
      });
    }
  }

  /* ── count-up ────────────────────────────────────────────────────────── */
  /* The final value is already in the DOM, so with JS off or reduced motion on
     the number is simply correct (SPEC M8). */
  if (hasJS && !reduced && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, to = parseInt(el.getAttribute('data-count'), 10);
        if (!to) return;
        var t0 = performance.now(), dur = 900;
        (function step(now) {
          var k = Math.min((now - t0) / dur, 1);
          k = 1 - Math.pow(1 - k, 3);
          el.textContent = String(Math.round(to * k));
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });
  }

  /* ── signup ──────────────────────────────────────────────────────────── */
  function digits(s) { return (s || '').replace(/\D/g, ''); }

  function pretty(d) {
    d = d.slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return '(' + d.slice(0, 3) + ') ' + d.slice(3);
    return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + ' ' + d.slice(6);
  }

  /** Returns E.164 or null. Mirrors normalizePhone() in backend/Code.gs. */
  function normalize(raw) {
    var d = digits(raw);
    if (d.length === 11 && d[0] === '1') d = d.slice(1);
    if (d.length !== 10) return null;
    if (d[0] === '0' || d[0] === '1') return null;   // area code
    if (d[3] === '0' || d[3] === '1') return null;   // exchange
    return '+1' + d;
  }

  document.querySelectorAll('.signup').forEach(function (form) {
    var input = form.querySelector('.signup__input');
    var btn = form.querySelector('.signup__go');
    var txt = form.querySelector('.signup__go-txt');
    var msg = form.querySelector('.signup__msg');
    var pot = form.querySelector('.signup__pot');
    if (!input || !btn) return;

    var idle = txt ? txt.textContent : 'Send';

    input.addEventListener('input', function () {
      var start = input.selectionStart, before = input.value.length;
      input.value = pretty(digits(input.value));
      if (start !== null && start < before) {
        var delta = input.value.length - before;
        input.setSelectionRange(start + delta, start + delta);
      }
      if (msg) { msg.textContent = ''; msg.removeAttribute('data-s'); }
    });

    function say(text, state) {
      if (!msg) return;
      msg.textContent = text;
      if (state) msg.setAttribute('data-s', state); else msg.removeAttribute('data-s');
    }

    function sayHTML(html) {
      if (!msg) return;
      msg.innerHTML = html;
      msg.setAttribute('data-s', 'note');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (pot && pot.value) return;                   // a bot filled the honeypot

      var phone = normalize(input.value);
      if (!phone) {
        say('That does not look like a US mobile number. Ten digits, area code first.', 'err');
        input.focus();
        return;
      }

      if (!SIGNUP_ENDPOINT) {
        // Never report a success we did not get. Point at something that works.
        sayHTML('Texts are not switched on yet. ' +
                '<a href="https://luma.com/me6t2z7s" target="_blank" rel="noopener">RSVP on Luma</a> ' +
                'or follow <a href="https://www.instagram.com/catholicleadersinaction/" target="_blank" rel="noopener">@catholicleadersinaction</a> ' +
                'and you will get the next date.');
        return;
      }

      btn.setAttribute('data-busy', '');
      if (txt) txt.textContent = 'Sending';
      say('');

      fetch(SIGNUP_ENDPOINT, {
        method: 'POST',
        // text/plain keeps this a CORS simple request; Apps Script cannot answer a preflight
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ phone: phone, source: location.pathname, consent: true })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.ok) {
            form.reset();
            say('Got it. We will text you when the next evening is set.', 'ok');
          } else {
            say((data && data.error) || 'That did not go through. Try again in a minute.', 'err');
          }
        })
        .catch(function () {
          say('That did not go through. Check your connection and try again.', 'err');
        })
        .then(function () {
          btn.removeAttribute('data-busy');
          if (txt) txt.textContent = idle;
        });
    });
  });
})();
