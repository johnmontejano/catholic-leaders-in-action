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

  /* ── 3b. the record's rail changes photograph with the row ────────────
     Four plates stand on top of one another in #record's sticky rail, one per
     evening, and exactly one of them carries .is-on. The row whose band
     crosses the middle tenth of the screen names it; CSS does the fade.

     WHY THIS IS SCRIPT AND NOT A SCROLL-DRIVEN KEYFRAME. A crossfade written
     on `animation-timeline: view()` would park three of the four plates at an
     opacity extreme for most of their crossing, which is the exact family
     tools/frozen.mjs exists to catch. A class and a transition have no pose
     to be stuck in.

     WITH THIS FILE ABSENT the first plate is the one the markup marks and the
     rail shows June 2 for the whole record — the same page, one photograph
     instead of four. Under prefers-reduced-motion the observer still runs and
     the stylesheet's own `transition: none` makes the change instant, which
     is what a reader who asked for no motion should get: the right picture,
     without the fade. Below 900 there is no stack at all — the four plates
     are an ordinary column — and .is-on paints nothing. */
  var recRows = document.querySelectorAll('#record .idx tbody tr[data-rec]');
  var recPlates = document.querySelectorAll('#record .rec__ph[data-rec]');
  if (recRows.length && recPlates.length && 'IntersectionObserver' in window) {
    var showPlate = function (k) {
      for (var i = 0; i < recPlates.length; i++)
        recPlates[i].classList.toggle('is-on', recPlates[i].getAttribute('data-rec') === k);
    };
    var recObs = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++)
        if (entries[i].isIntersecting) showPlate(entries[i].target.getAttribute('data-rec'));
    }, { rootMargin: '-45% 0px -45% 0px' });
    for (var r = 0; r < recRows.length; r++) recObs.observe(recRows[r]);
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

  /* ── 6. THE TWO CHAPTER LINES ASSEMBLE ────────────────────────────────
     The one thing on this page that has to be done in script, and the reason
     is that a line is not a thing the stylesheet can address. `::first-line`
     styles one; there is no selector for the second, and no way to give the
     third a delay. So the lines are MEASURED and then made into elements.

     WHAT IT DOES, EXACTLY: for each [data-kinetic] paragraph, walk its single
     text node word by word with a Range, read each word's client rect, and
     start a new row whenever the top edge moves. That is the browser's own
     line breaking, read back — not a guess at where it broke, and not a
     re-implementation of it — so `text-wrap: balance`, the nbsp in
     "in&nbsp;another", the Spanish quotation marks and every width on the
     ladder are all handled by not having an opinion about any of them.

     IT RUNS AFTER document.fonts.ready, and that is not a nicety: a line
     measured in the fallback face breaks in a different place, and the page
     would assemble the wrong lines correctly. It re-runs on resize for the
     same reason.

     THE SPACES ARE KEPT. Line wrappers are blocks, so a text node holding one
     space between two of them contributes nothing to layout and everything to
     the clipboard: without it, copying the quotation yields "social life,even
     family" — the failure verify.md lists by name.

     AND NOTHING HERE FADES. The reveal is a mask and a translate, so a reader
     who never reaches the paragraph, or whose observer never fires, has type
     at full ink rather than a hole; tools/cold.mjs and audit.mjs A14 both
     count faded elements and neither one changes because of this. */
  var kinetic = document.querySelectorAll('[data-kinetic]');
  if (kinetic.length) {
    var lineify = function (el) {
      if (el._knSrc == null) el._knSrc = el.textContent;
      el.textContent = el._knSrc;
      var node = el.firstChild;
      if (!node || node.nodeType !== 3) return;
      var text = node.data, words = [], i = 0;
      while (i < text.length) {
        while (i < text.length && text.charAt(i) === ' ') i++;
        var s = i;
        while (i < text.length && text.charAt(i) !== ' ') i++;
        if (i > s) words.push([s, i]);
      }
      if (!words.length) return;
      var range = document.createRange(), rows = [];
      for (var w = 0; w < words.length; w++) {
        range.setStart(node, words[w][0]);
        range.setEnd(node, words[w][1]);
        var top = Math.round(range.getBoundingClientRect().top);
        var last = rows.length ? rows[rows.length - 1] : null;
        /* 2px, because a line that carries a taller glyph reports a rect one
           subpixel off its neighbours and a strict equality would split one
           line into three. */
        if (!last || Math.abs(top - last.top) > 2) rows.push({ top: top, a: words[w][0], b: words[w][1] });
        else last.b = words[w][1];
      }
      var frag = document.createDocumentFragment();
      for (var k = 0; k < rows.length; k++) {
        var mask = document.createElement('span');
        mask.className = 'kn__l';
        mask.style.setProperty('--kn-i', k);
        var ink = document.createElement('span');
        ink.className = 'kn__i';
        ink.textContent = text.slice(rows[k].a, rows[k].b);
        mask.appendChild(ink);
        frag.appendChild(mask);
        if (k < rows.length - 1) frag.appendChild(document.createTextNode(' '));
      }
      el.textContent = '';
      el.appendChild(frag);
      el.classList.add('is-split');
    };

    var lightKn = function (el) { el.classList.add('is-lit'); };
    var knObs = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e++) {
        if (!entries[e].isIntersecting) continue;
        lightKn(entries[e].target);
        knObs.unobserve(entries[e].target);
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 }) : null;

    var splitAll = function () {
      for (var k = 0; k < kinetic.length; k++) {
        var el = kinetic[k];
        var lit = el.classList.contains('is-lit');
        lineify(el);
        if (lit || !knObs) lightKn(el);
        else knObs.observe(el);
      }
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(splitAll);
    else splitAll();
    var knT = 0, knW = window.innerWidth;
    window.addEventListener('resize', function () {
      /* width only: a phone's URL bar collapsing is a height change and is not
         a re-wrap, and re-splitting on it would restart the entrance under a
         reader who is standing still. */
      if (window.innerWidth === knW) return;
      knW = window.innerWidth;
      clearTimeout(knT);
      knT = setTimeout(splitAll, 160);
    });
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
