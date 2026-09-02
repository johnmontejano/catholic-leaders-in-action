/* CLIA — progressive enhancement only, and nothing else.

   The page is complete at paint. Every section, every image and every word is
   laid out and legible with this file absent, with JavaScript off, and with
   prefers-reduced-motion on. Nothing here creates content, pins a section, or
   drives composition from a scroll offset.

   Five behaviours, and this is the complete list:
     1. the nav pill retracting on the way down and returning on the way up
     2. the mobile menu panel — open, close, Esc, focus return, scroll lock
     3. the section the reader is standing in, mirrored into aria-current
     4. every disclosure mirrors its open state into aria-expanded
     5. the scrub envelope, which is the ONLY frame loop in this file and is
        dormant in this build because no clip is on disk                      */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 0. the entrance, where the stylesheet cannot run it ─────────────
     See styles.css, "THE ENTRANCE, ON THE BROWSERS THAT CANNOT SCRUB IT".
     Safari before 26 has no `animation-timeline`, so on most iPhones the CSS
     reveal never existed. The html.js class is what lets the fallback
     pre-state be written at all; without script it is never applied. */
  document.documentElement.classList.add('js');
  var canScrub = window.CSS && CSS.supports && CSS.supports('animation-timeline: view()');
  if (!reduced && !canScrub) {
    var rvs = document.querySelectorAll('.rv');
    var showAll = function () {
      for (var i = 0; i < rvs.length; i++) rvs[i].classList.add('is-in');
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            entries[i].target.classList.add('is-in');
            io.unobserve(entries[i].target);
          }
        }
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
      for (var r = 0; r < rvs.length; r++) io.observe(rvs[r]);
      /* NO GLOBAL TIMER. A "light everything after n seconds" lock would
         light every band a slow reader had not reached yet, and then nothing
         below would ever enter — the fallback would defeat itself for exactly
         the reader it exists for. IntersectionObserver is universal where this
         branch runs; the only fence needed is the no-IO branch below. */
    } else {
      showAll();
    }
  }
  var root = document.documentElement;

  /* ── 1. the pill retracts ─────────────────────────────────────────────
     The whole bar leaves on the way down and comes back on the way up. Its
     geometry never changes: it does not shrink, it does not gain a shadow, it
     does not swap ground. That is the difference between a 2021 nav and this
     one, and the listener does no layout work at all. */
  var lastY = window.scrollY;
  if (!reduced) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      var down = y > lastY && y > 160;
      root.classList.toggle('is-down', down);
      lastY = y;
    }, { passive: true });
  }

  /* ── 2. the menu panel ────────────────────────────────────────────────
     A card that drops under the nav, not a full-screen takeover. The trigger
     is the word MENU with the page's own 5px marker under it; opening swaps
     the word to CLOSE and the marker animates its width. */
  var menu = document.querySelector('[data-menu]');
  var mb = document.querySelector('[data-menu-btn]');
  if (menu && mb) {
    var label = mb.querySelector('.mnu__t');
    var mark = mb.querySelector('.mnu__r');
    var open = false;

    /* CONTAINMENT. The page behind the panel is scroll-locked, so a keyboard
       user who tabbed out of the panel used to land on controls in a page they
       could not scroll to see. Everything outside the panel and its own
       trigger goes `inert` while the panel is open, and focus is moved into
       the panel on open. Escape and focus-return were already correct.
       toggleAttribute is a no-op where inert is unsupported, which leaves the
       old behaviour rather than a broken one.

       THE LIST IS DERIVED, NOT WRITTEN DOWN. It used to be seven hand-named
       selectors, and one of them was `footer` — which stopped meaning the page
       footer the day a section caption was marked up as a <footer> inside
       <main>. `querySelector` took the caption, the real footer kept its six
       tabbable links, and the trap this comment describes had been gone for
       several passes before a review walked the tabs and found them. A list of
       names cannot survive the document changing under it, so the list is now
       computed from the tree: every child of <body> that holds neither the
       panel nor its trigger, plus, inside the branch that does hold the
       trigger, every sibling branch that is not on the path to the button.
       Anything added to the page in future is muted by construction. */
    var muted = (function () {
      var out = [];
      var walk = function (parent) {
        for (var i = 0; i < parent.children.length; i++) {
          var el = parent.children[i];
          if (el === menu || el.contains(menu)) continue;   // the panel itself
          if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
          if (el === mb) continue;                          // the trigger stays live
          if (el.contains(mb)) { walk(el); continue; }      // on the path: descend
          out.push(el);
        }
      };
      walk(document.body);
      return out;
    })();

    var sizeMark = function () {
      if (mark && label) mark.style.width = label.getBoundingClientRect().width + 'px';
    };
    var setMenu = function (want) {
      open = want;
      root.classList.toggle('is-menu', want);
      document.body.style.overflow = want ? 'hidden' : '';
      mb.setAttribute('aria-expanded', want ? 'true' : 'false');
      if (label) label.textContent = want ? 'Close' : 'Menu';
      sizeMark();
      for (var v = 0; v < muted.length; v++) muted[v].toggleAttribute('inert', want);
      if (want) {
        /* The panel is visibility:hidden until the class lands, and a hidden
           subtree cannot take focus. Reading a layout property flushes the
           new style synchronously, so the focus below always sticks. */
        void menu.offsetWidth;
        var first = menu.querySelector('a[href]');
        if (first) first.focus();
      }
    };

    sizeMark();
    window.addEventListener('resize', sizeMark);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeMark);

    mb.addEventListener('click', function () { setMenu(!open); });
    menu.addEventListener('click', function (ev) {
      var t = ev.target;
      if (t.closest && t.closest('a[href]')) { setMenu(false); return; }
      if (t.hasAttribute && t.hasAttribute('data-menu-close')) { setMenu(false); mb.focus(); }
    });
    /* THE RING IS CLOSED BY HAND. `inert` removes the page behind the panel
       from the tab order, which is most of the job but not the end of it: with
       everything else muted, the last link in the panel still tabs to the end
       of the DOCUMENT, and the browser hands focus to its own chrome. A
       keyboard walk reads that as leaving the page — which is what a trap is
       supposed to make impossible. So Tab wraps explicitly across the panel
       and its trigger, which is also the Close control. Four links, then
       Close, then round again; Shift+Tab runs the same ring backwards. */
    var ring = function () {
      var live = [mb].concat([].slice.call(menu.querySelectorAll('a[href],button,[tabindex]:not([tabindex="-1"])')));
      return live.filter(function (el) {
        var r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
    };
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Tab' && open) {
        var list = ring();
        if (!list.length) return;
        var at = list.indexOf(document.activeElement);
        var to = at < 0 ? 0 : at + (ev.shiftKey ? -1 : 1);
        if (to < 0) to = list.length - 1;
        if (to >= list.length) to = 0;
        ev.preventDefault();
        list[to].focus();
        return;
      }
      if (ev.key === 'Escape' && open) { setMenu(false); mb.focus(); }
    });
  }

  /* ── 3. the section you are standing in ───────────────────────────────
     Reported, never styled with the accent: the marker is a hairline. */
  var navLinks = document.querySelectorAll('.bar__nav a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    for (var n = 0; n < navLinks.length; n++) byId[navLinks[n].getAttribute('href').slice(1)] = navLinks[n];
    var here = new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        var a = byId[entries[e].target.id];
        if (!a) continue;
        if (entries[e].isIntersecting) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      }
    }, { rootMargin: '-45% 0px -45% 0px' });
    for (var id in byId) {
      var sec = document.getElementById(id);
      if (sec) here.observe(sec);
    }
  }

  /* ── 4. the entrance is GONE FROM THIS FILE ───────────────────────────
     It used to be an IntersectionObserver writing .is-in, a per-child
     transition-delay ladder, and two timers whose only job was to guarantee
     that nothing was left invisible if any of it failed. All of it is now
     eleven lines of CSS: `animation-timeline: view()` behind an @supports
     guard and a prefers-reduced-motion guard (styles.css, "entrance motion").

     Three things came out of that trade and they are the whole argument for
     it: the reveal now exists with JavaScript off, the pre-state that needed
     an inline <head> script no longer exists at all, and there is no timer
     left that could fail to fire. See research/design-2026.md §1.4. */

  /* ── 4b. every disclosure reports its state ───────────────────────────
     <details> opens and closes on its own with this file absent. What it does
     not do on its own is publish aria-expanded. Two paths, because `toggle`
     fires ASYNCHRONOUSLY: the property is mirrored for scripted toggles and
     the event for real clicks. Native behaviour is untouched. */
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

  /* ── 5. the scrub envelope ────────────────────────────────────────────
     What it is allowed to touch: video.currentTime. That is the whole list. It
     never writes a style, a class, a transform, a size or a position, so no
     composition on this page can ever depend on it.

     No clip is on disk, so tools/video-slots.mjs emits no <video> at all, this
     observer finds nothing, and __scrubRunning stays false forever. That is
     the state this build ships in: four declared slots, zero clips, every slot
     on its declared fallback.                                                */
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
        var dur = v.duration;
        if (!dur || !isFinite(dur)) continue;
        var r = v.getBoundingClientRect();
        var span = r.height + window.innerHeight;
        var p = span > 0 ? (window.innerHeight - r.top) / span : 0;
        p = p < 0 ? 0 : (p > 1 ? 1 : p);
        var t = p <= 0.5 ? p * 2 : (1 - p) * 2;
        v.currentTime = t * dur;
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
})();

/* THE POSTER WALL'S SCRUB CONTROL WENT WITH THE WALL. It was 45 lines that
   moved `object-position` on three plates under pointer, arrow keys and tap.
   It worked — and what it revealed, two steps down the June plate, was a
   third-party logo lockup and two named individuals that no fold audit had
   ever read, because none of it was in the fold at rest. The page does not
   keep a surface that can paint un-audited pixels. */
