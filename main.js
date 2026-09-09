/* Catholic Leaders in Action — main.js, 2026-09-03.

   Vanilla but for one dependency. The reference reaches for GSAP +
   ScrollTrigger + Lenis; everything it actually does with the first two is a
   scrubbed gsap.set() or a one-shot IntersectionObserver, and both survive the
   translation to plain rAF and IO. Lenis does not survive it — the whole page's
   motion is tuned against its ~500ms of scroll lag, and the same reveals fired
   off a hard native scroll read as abrupt no matter how well timed they are.
   So Lenis is vendored and the rest is hand-written. What does not survive
   translation at all is the taste, so the numbers below are copied rather than
   invented — they come from research/sequel/MOTION.md and
   research/sequel/HOME.md.

     §0 smooth scroll §6 the manifesto stage — the page's defining move
     §1 menu          §7 counters
     §2 nav           §8 partner row   §8b2 the rooms   §8c the evening's clock
     §3 reveals       §9 the Instagram feed
     §4 clock         §10 video tiles
     §5 countdown     §11 the SMS signup
                      §14 /start/'s map                                   */

(() => {
  'use strict';

  const q  = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Read once. styles.css §17 runs the hero's drift and dim as scroll-driven
     animations where the engine supports them; this is the same test, so
     exactly one of the two is ever live. The string appears once on each side
     on purpose — a typo in a second place is the failure mode. */
  const NATIVE = !calm && typeof CSS !== 'undefined' && CSS.supports && CSS.supports('animation-timeline', 'view()');
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;

  /* §0 — the smooth-scroll layer -------------------------------------------
     The reference's exact Lenis configuration (research/sequel/MOTION.md §2.1):
     duration 1.2 on an expo-out curve, syncTouch on. This is the single
     largest reason their page feels different from ours — every reveal below
     is tuned against ~500ms of scroll lag, and firing the same reveals off a
     hard native scroll is what made ours read as abrupt. Lenis drives real
     scrollTop, so `scrollY` and getBoundingClientRect stay truthful and every
     scrubbed section below keeps working unchanged. */
  /* Not on touch. The reference sets syncTouch, but syncTouch takes Android's
     native scroll — which is already momentum-smooth and runs on the compositor
     — and re-drives it from JavaScript on the main thread. On the owner's
     Samsung that reads as stutter, and no amount of tuning fixes it because the
     platform was already doing the job better. Wheel devices keep Lenis; touch
     devices get the scroll the OS gives them, and the bus below falls through
     to the native listener, so every scrubbed section behaves identically. */
  const touch = matchMedia('(hover:none) and (pointer:coarse)').matches;
  let lenis = null;
  if (!calm && !touch && typeof Lenis === 'function') {
    lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      syncTouch: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);

    /* Anchors have to go through Lenis or the browser's own jump fights it.
       The offset clears the fixed bar. */
    /* The chrome is shared across four pages now, so its section links are
       written root-absolute — /#evening, not #evening — and one string works
       from every depth. On the home page those are still same-document
       anchors and must still land on the same 72px; anywhere else they are
       real navigations and the browser takes them. The test is the resolved
       URL, not the attribute: same origin and same path means same document. */
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href]');
      if (!a) return;
      let id;
      try {
        const u = new URL(a.href, location.href);
        if (u.origin !== location.origin || u.pathname !== location.pathname) return;
        id = u.hash;
      } catch { return; }
      if (!id) return;
      if (id === '#' || id === '#top') { e.preventDefault(); lenis.scrollTo(0, { offset: 0 }); return; }
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      /* Sections below the fold are content-visibility:auto, so on a first jump
         the ones in between may still be reporting their intrinsic-size guess
         and the target moves under the animation. The guesses are measured
         (styles.css §2c) so the error is small, but the settle check makes the
         landing exact regardless: once the scroll finishes, if the target is
         not where it should be, close the remainder without another animation. */
      lenis.scrollTo(t, {
        offset: -72,
        onComplete: () => {
          const drift = Math.round(t.getBoundingClientRect().top - 72);
          if (Math.abs(drift) > 4) lenis.scrollTo(scrollY + drift, { immediate: true });
        },
      });
    });
  }

  /* Geometry, measured once instead of every frame.

     Every scrubbed section below used to call getBoundingClientRect() or read
     offsetHeight INSIDE the scroll handler and then write a style — eight
     forced synchronous layouts per frame between the pinned stage, the two
     photo cards and the collage. On a desktop that is invisible. On a phone it
     is the whole reason the scroll stutters: the browser cannot use its cached
     layout, so it re-lays-out a 500-element document sixty times a second.

     None of those numbers change while you scroll. A page-coordinate top and a
     height are stable until something reflows, so they are read in one batch
     here and the handlers do arithmetic against scrollY. Re-measured on resize,
     after the fonts settle and after the images land — the three things that
     actually move boxes. */
  const measured = [];
  let vh = innerHeight, vw = innerWidth;
  const measureOne = (m, sy) => {
    const r = m.el.getBoundingClientRect();
    m.top = r.top + (sy === undefined ? scrollY : sy); m.h = r.height; m.w = r.width;
  };
  /* Sections below the fold are `content-visibility:auto` (§2c), so until one
     has been rendered once it reports its contain-intrinsic-size guess rather
     than its real height — and a cache filled at load would hold that guess
     forever. Each tracked box re-measures itself as it approaches, a viewport
     and a half out, which is well before its number is used for anything and
     rare enough to cost nothing. */
  const track = el => {
    const m = { el, top: 0, h: 0, w: 0 };
    measured.push(m);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) measureOne(m); },
        { rootMargin: '150% 0px' }).observe(el);
    }
    return m;
  };
  let dropDrumCache = null;
  const remeasure = () => {
    vh = innerHeight; vw = innerWidth;
    const sy = scrollY;
    for (const m of measured) measureOne(m, sy);
    dropDrumCache && dropDrumCache();
  };

  /* One scroll bus. Every scrubbed section below reads the same frame, which is
     the cheap version of their single global ScrollTrigger. When Lenis is
     running it is the clock — its own event fires once per rAF already, so a
     second rAF throttle would only add a frame of lag to the scrub. */
  const onScroll = (() => {
    const subs = [];
    let ticking = false;
    const run = () => {
      ticking = false;
      const y = scrollY;
      for (const f of subs) f(y);
    };
    if (lenis) lenis.on('scroll', () => { ticking = false; run(); });
    else addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(run); }
    }, { passive: true });
    addEventListener('resize', () => {
      remeasure();
      if (!ticking) { ticking = true; requestAnimationFrame(run); }
    });
    return f => { subs.push(f); f(scrollY); };
  })();

  /* §1 — menu -------------------------------------------------------------
     The iris and the burger are CSS (§6). What has to be JS is the character
     stagger, because open and close are not the same animation: opening, each
     link starts 80ms after the one above it and its glyphs 20ms apart on a
     400ms curve; closing, every glyph leaves together in 150ms. Setting the
     delays inline and clearing them on the way out is what buys that
     asymmetry with one set of CSS rules. */
  const menu = q('#menu'), toggle = q('#navToggle');
  if (menu && toggle) {
    const links = qa('.menu-nav a', menu);
    let split = false;
    let closeTimer = 0;

    /* Splitting seven labels into ~70 spans used to happen inside the first
       tap. Measured on a 6x-throttled phone that first open cost 61.4ms
       against ~27ms for every one after it, which is the stall the owner
       reported. It is the same work either way, so it runs while the phone is
       idle instead of while a finger is waiting on it. */
    const warm = () => {
      if (split) return;
      split = true;
      /* `hidden` is the no-JS guard and nothing else: .menu is already
         visibility:hidden + clip-path:circle(0) when closed, so dropping the
         attribute once JS is up costs no visibility and buys the overlay its
         first layout at idle rather than under the first tap. */
      menu.hidden = false;
      if (!calm) links.forEach((a, li) => splitChars(a.querySelector('.lbl') || a, 0.02, 0.2 + li * 0.08));
    };
    'requestIdleCallback' in window
      ? requestIdleCallback(warm, { timeout: 2000 })
      : setTimeout(warm, 1200);

    /* Queried once. These six were re-resolved on every single toggle. */
    const behind = [q('#main'), q('.foot'), q('.skip'), q('.nav-links'), q('.nav-mark'), q('.nav .btn-fill')]
      .filter(Boolean);

    const set = open => {
      clearTimeout(closeTimer);
      menu.hidden = false;
      warm();                       /* a tap that beats the idle callback */

      /* The delays are inline on each .ch from the split and stay there; the
         way out zeroes them in CSS off .closing rather than writing ~70 inline
         styles per tap. */
      menu.classList.toggle('closing', !open);

      menu.toggleAttribute('data-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      nav && nav.toggleAttribute('data-menu', open);

      /* Lenis owns the scroll now, so the lock goes through it; the overflow
         fallback is for the reduced-motion path where Lenis never starts. */
      if (lenis) open ? lenis.stop() : lenis.start();
      document.body.style.overflow = open ? 'hidden' : '';

      /* Without this, Tab walks straight out of the open overlay and into the
         page behind it — measured: the fourth Tab landed on "Watch the film"
         in the hero. `inert` takes the rest of the document out of the tab
         order and out of the accessibility tree in one attribute. */
      /* Not `nav` — #navToggle lives inside it, so inerting the header took
         the close button out of the hit-test stack and left the only exit as
         the Escape key, which no phone has. Inert the bar's contents around
         the toggle instead, and the footer, which Tab was escaping into. */
      behind.forEach(el => el.toggleAttribute('inert', open));

      if (open) links[0] && links[0].focus({ preventScroll: true });
      else {
        toggle.focus({ preventScroll: true });
        closeTimer = setTimeout(() => {
          if (!menu.hasAttribute('data-open')) { menu.hidden = true; menu.classList.remove('closing'); }
        }, 320);
      }
    };
    toggle.addEventListener('click', () => set(!menu.hasAttribute('data-open')));
    menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && menu.hasAttribute('data-open')) set(false); });
  }

  /* §2 — the nav's centre links fade out on the way down, back on the way up.
     A deadband keeps a trackpad's jitter from flickering them. */
  const nav = q('#nav');
  if (nav) {
    let last = scrollY;
    /* THE BAR NEEDS A GROUND ONCE IT IS OFF THE HERO — on a phone, and only
       there. The reference's bar is transparent forever and it can be: every
       one of its pages is film under the chrome. Ours are white type on black
       at a full-width measure below 900px, so body copy ran straight through
       the mark and the RSVP pill — captured at 390 on /team/, "Virginia
       Department of Emergency Managem[RSVP →]ent" with the organisation's own
       logo sitting on top of another organisation's. A scrim cannot fix that;
       it darkens the copy but the copy is still there, and a half-legible word
       under a button reads as breakage, not as depth.
       So: transparent over a hero, grounded past it. The threshold is the
       hero's own height where there is one and 8px where there is not, which
       is what makes /team/, /start/ and /events/ grounded from the first
       pixel of scroll and leaves the home page's fold exactly as it was. */
    const heroEl0 = q('.hero');
    const groundAt = () => (heroEl0 ? heroEl0.offsetHeight - 72 : 8);
    /* AND NOT OVER A FULL-BLEED PICTURE. A ground fixes the collision and, laid
       over the manifesto's plates or the photo wall, it also lays a 122px black
       letterbox across the top of a picture that runs to the edge of the
       screen — which is a worse fault than the one it fixes, and not one the
       reference has, because the reference's bar is transparent over film
       everywhere. So the ground asks what is actually beneath it: two hit tests
       down the middle of the bar, and if either lands inside something marked
       data-bleed the bar goes back to being a lens shade over the picture.
       Geometry, not elementFromPoint: the bar is not pointer-events:none — the
       reference's is and ours cannot be, because the whole bar is a target —
       so a hit test down the middle of it returns the BAR, every time, and the
       check silently never fires. Measured that way it reported 0 of 120.
       Marked: the manifesto's stage and the photo wall — the two blocks that
       are pure picture to their own top edge. NOT the perk marquee: its cards
       are only 306px tall and each carries a caption, so a bar without a ground
       over that band puts the caption straight back under the links, which is
       the fault this whole mechanism exists to remove. Measured: marking it
       took the collisions from 2 to 6. */
    const bleeds = qa('[data-bleed]');
    const overBleed = () => {
      for (const el of bleeds) {
        const r = el.getBoundingClientRect();
        if (r.top < 96 && r.bottom > 0 && r.width > 8) return true;
      }
      return false;
    };
    onScroll(y => {
      const d = y - last;
      if (Math.abs(d) > 6) {
        nav.toggleAttribute('data-hide', d > 0 && y > 160);
        last = y;
      }
      nav.toggleAttribute('data-ground', y > groundAt() && !overBleed());
    });
  }

  /* §3 — reveals ----------------------------------------------------------- */

  /* §3a the split. Their headlines do not fade as a block — every glyph is its
     own element and they arrive 20ms apart, blurring in without travelling
     (research/sequel/MOTION.md §3: startY 0, blur 8px, 500ms, stagger 20ms).
     That single detail is most of the difference between their headlines and
     a fade, so it is worth the DOM.

     The walk is recursive because the one word per headline in the serif
     italic is a real element and has to survive the split; words are wrapped
     as well as characters so a line still breaks between words rather than
     mid-word once every glyph is inline-block. */
  /* A WAVE HAS A CEILING. The reference staggers characters 20ms apart, which
     is right for "Not just another VC" and wrong for a 89-character sentence:
     measured, /team/'s h1 ran 2,100ms and the home page's second headline
     2,260ms, both of them still arriving long after the eye had settled and
     the /team/ one being the LCP element. The reference's own waves finish
     inside a second. So the step given is a MAXIMUM and the wave is capped at
     WAVE_MS — a short headline is unchanged at 20ms, a long one tightens.
     470 rather than 620 because the wave and the per-glyph transition ADD: an
     89-character sentence spent 1,152ms with its last word — which is always
     the payoff word, and on this page it is always the italic one — sitting
     between 20% and 35% ink. 470 + 380 is 850ms end to end, inside the second
     the reference's own waves finish in. */
  const WAVE_MS = 470;
  const splitChars = (root, step, base) => {
    let n = 0;
    const text = root.textContent.replace(/\s+/g, ' ').trim();
    const walk = node => {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          /* keep the gaps as real text so wrapping and copy-paste survive */
          for (const part of child.nodeValue.split(/(\s+)/)) {
            if (!part) continue;
            if (/^\s+$/.test(part)) { frag.append(part); continue; }
            const word = document.createElement('span');
            word.className = 'wd';
            for (const ch of [...part]) {
              const g = document.createElement('span');
              g.className = 'ch';
              g.textContent = ch;
              g.dataset.d = `${(base + n++ * step).toFixed(3)}s`;
              g.style.transitionDelay = g.dataset.d;
              word.append(g);
            }
            frag.append(word);
          }
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      }
    };
    walk(root);
    if (n > 1) {
      const cap = WAVE_MS / 1000 / (n - 1);
      if (cap < step) {
        let k = 0;
        for (const g of root.querySelectorAll('.ch')) {
          const d = `${(base + k++ * cap).toFixed(3)}s`;
          g.dataset.d = d; g.style.transitionDelay = d;
        }
      }
    }
    if (n) {
      /* The accessible name has to be the sentence, not fifteen letters. */
      root.setAttribute('aria-label', text);
      root.querySelectorAll('.wd').forEach(w => w.setAttribute('aria-hidden', 'true'));
      root.classList.add('split');
    }
    return n;
  };

  /* §3b — the hero's load timeline ----------------------------------------
     Their sequence, measured (MOTION.md §1.1): the bar drops 144px over 800ms
     on power3.out the moment the fonts settle; 700ms later the headline's
     glyphs blur in 50ms apart — a slower stagger than the section headings,
     because this one is the only headline anybody watches arrive — and the
     description and the play control rise 72px alongside them, 80ms apart. */
  const heroIntro = () => {
    const hero = q('.hero'), h1 = q('.hero h1');
    /* Only split if we are still early enough for the reveal to BE the first
       sight of the headline. The h1 renders at full opacity before this script
       runs, so on a cold throttled connection it painted at 1.5s and splitting
       at 4.1s yanked it away for the better part of a second before fading it
       back — a worse defect than the missing animation. Past this point the
       page has already been read; leave it alone. */
    const LATE = 900;
    if (h1 && !calm && performance.now() < LATE) {
      splitChars(h1, 0.05, 0.7);
      /* The glyphs' opacity:0/blur(8px) pre-state has to be resolved by the
         style engine BEFORE .in lands, or the browser coalesces both into one
         computation and the headline is simply born at its end state — which
         is what it has been doing. One forced reflow between the two is the
         whole fix. (The section headings never had this: their .in comes from
         an IntersectionObserver, which is already a later task.) */
      void h1.offsetWidth;
      h1.classList.add('in');
    }
    const bar = q('#nav');
    bar && bar.classList.add('in');
    hero && hero.classList.add('in');
  };

  /* Fired at ~30% visible, once. The variants and their distances live in CSS
     (§16); this only decides when. Waiting on document.fonts avoids revealing a
     headline mid-swap, which is the one thing that makes a blur reveal look
     cheap. */
  const reveal = () => {
    if (!calm) qa('.rv-t').forEach(el => splitChars(el, 0.02, 0));
    const items = qa('.rv');
    if (!items.length) return;
    if (calm || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        obs.unobserve(e.target);
      });
      /* Measured 2026-09-09: a threshold of 0.3 against a −5% margin fires with
         the element's top at 0.72–0.93 of the viewport height, which is below
         the line anyone reads at — the reveal is over before the eye arrives
         and the reader meets a static block. The reference triggers before the
         element is visible at all. A −22% bottom margin moves the line up into
         the middle third, where a reveal is something you watch rather than
         something you find already finished. */
    }, { threshold: 0.15, rootMargin: '0px 0px -22% 0px' });
    /* THE FIRST SCREEN ARRIVES ON LOAD. The −22% line above is right for
       something you scroll to and wrong for something already on the screen
       when the page opens: /start/'s map sits at 0.82 of the viewport height at
       scroll 0, so it fell below the trigger line and the page's landing frame
       lost the one component it is built around. Anything whose top is inside
       the first viewport is revealed on the load timeline instead, staggered by
       the same data-d it already carries — which is the reference's own
       behaviour and the reason its folds are never half-empty. */
    const firstScreen = [];
    items.forEach(el => {
      const top = el.getBoundingClientRect().top + scrollY;
      if (top < innerHeight * 0.98) firstScreen.push(el);
    });
    if (firstScreen.length) {
      requestAnimationFrame(() => firstScreen.forEach(el => el.classList.add('in')));
    }
    /* FOCUS REVEALS. A .rv block that has not been scrolled to is at opacity 0,
       and a keyboard visitor can reach the controls inside it before the
       observer ever fires — measured, five across the four pages, including
       "See the format" and "See the events". The focus ring was correct and
       painted on nothing. Focus is the same statement of intent that scrolling
       into view is, so it reveals the same way. Capture phase, one listener on
       the document, and it cannot fire twice because `.in` is checked first. */
    addEventListener('focusin', (e) => {
      const host = e.target instanceof Element && e.target.closest('.rv');
      if (host && !host.classList.contains('in')) host.classList.add('in');
    }, true);
    items.forEach(el => {
      if (el.classList.contains('in')) return;
      /* Anything taller than the viewport can never reach 30%; watch those at 0. */
      if (el.offsetHeight > innerHeight * 0.8) {
        new IntersectionObserver((es, o) => es.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); o.disconnect(); }
        }), { threshold: 0, rootMargin: '0px 0px -22% 0px' }).observe(el);
      } else io.observe(el);
    });
  };
  /* The reference races fonts.ready against a 3000ms cap and we copied it, but
     their faces are not font-display:swap and ours all are — three of them
     preloaded — so the long cap buys us nothing it buys them, and it was the
     whole of a 5.67s LCP on a cold throttled connection. Same mechanism, cap
     cut to the point where it still covers a slow swap. */
  (document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 300))]) : Promise.resolve())
    .then(() => { remeasure(); heroIntro(); reveal(); });

  /* Images arriving change heights, so the cache has to catch up once they do —
     and once more on full load for anything lazy that landed late. */
  addEventListener('load', remeasure);
  if (document.fonts) document.fonts.ready.then(remeasure);

  /* §4 — the hero clock, in San Francisco time ---------------------------- */
  const clock = q('#clock');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit',
      second: '2-digit', hour12: false
    });
    const tick = () => { clock.textContent = fmt.format(new Date()) + ' — SAN FRANCISCO'; };
    tick(); setInterval(tick, 1000);
  }

  /* §5 — countdown to the next evening ------------------------------------ */
  /* The instant used to be typed here, which meant the page was wrong the
     morning after the evening and stayed wrong until someone edited a file.
     tools/build-pages.mjs writes the attribute from the calendar data at
     build time now, so the date on the page and the date in the countdown
     cannot disagree. Nothing here reads a file: the instant is already in the
     HTML, which is why the block works with the network off.
     Once the evening is over the block goes: "Tonight" forever, or a negative
     number, is worse than an absent countdown, and the hourly job may be up to
     an hour behind (§7.6). Over means over — the end instant the card carries,
     the same one §13 prunes the card itself against, never a fixed window past
     the start. A three-hour evening that finished an hour ago is finished. The
     six-hour window survives only as the fallback for a card with no end at
     all, which the build no longer emits. */
  const cd = q('#countdown');
  const cdWhen = cd && cd.dataset.when ? Date.parse(cd.dataset.when) : NaN;
  const cdCard = cd && cd.closest('[data-end]');
  const cdEnd = cdCard ? Date.parse(cdCard.dataset.end) : NaN;
  const cdOver = !Number.isNaN(cdEnd)
    ? Date.now() >= cdEnd
    : Date.now() - cdWhen > 6 * 36e5;
  if (cd && !Number.isNaN(cdWhen) && cdOver) {
    const box = cd.closest('.count');
    if (box) box.hidden = true;
  } else if (cd && !Number.isNaN(cdWhen)) {
    const when = cdWhen;
    const tick = () => {
      const ms = when - Date.now();
      if (ms <= 0) { cd.textContent = 'Tonight'; return; }
      const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24,
            m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
      cd.textContent = d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`;
    };
    tick(); setInterval(tick, 1000);
  }

  /* §6 — the manifesto stage ---------------------------------------------- */
  /* The reference's signature move, reproduced with its own windows:
       0    → 7.8%   the content fades up
       7.8  → 23.5%  the card widens from the card-grid width to 100vw,
                     its radius goes 10 → 0 and its hairline 1px → 0
       23.5 → 71.5%  five statements roll past on a three-dimensional drum
       76.5 → 100%   all of it runs backwards and the content fades out
     The card starting at exactly the width of the two-card grid above it is
     the whole trick — it reads as one of those cards growing into the screen,
     not as a new element arriving. */
  const believe = q('#believe'), card = q('#believeCard'),
        body = q('#believeBody'), drum = q('#drum'),
        win = q('#believeLines'), duo = q('#duo');

  if (believe && card && drum && win && !calm) {
    const items = qa('li', drum);
    const N = items.length;
    /* their custom in/out — steep enough that each line clicks into place */
    const snap = t => t < .5 ? Math.pow(2 * t, 3.5) / 2 : 1 - Math.pow(2 * (1 - t), 3.5) / 2;

    let winH = 1, centres = null;
    const measureDrum = () => {
      winH = win.clientHeight || 1;
      centres = items.map(el => el.offsetTop + el.offsetHeight / 2);
    };
    dropDrumCache = () => { centres = null; };

    /* THE GROUNDS, 2026-09-09. Every element in the card carrying data-at is a
       ground, and the attribute is where in the drum it is centred. The weight
       is a straight linear ramp between neighbouring centres, deliberately not
       eased: two eased weights either side of a boundary do not sum to 1, and
       the missing fraction is a visible dip to black in the middle of every
       cross-fade. Linear, they always sum to 1. */
    /* Every ground in the stack, bottom first: the film carries data-at (it is
       always the floor and never wipes), each photograph carries the data-in /
       data-out pair that is its own wipe. data-w is the ground's own weight —
       the nave is the brightest and busiest frame in the archive and carries
       the middle of the section, so it sits below the film's weight and not at
       it — and it is written once here rather than every frame. */
    const plates = qa('[data-at],[data-in]', card);
    plates.forEach(el => {
      if (el.dataset.w) el.style.setProperty('--pw', el.dataset.w);
    });

    const mBelieve = track(believe), mCard = track(card), mDuo = duo ? track(duo) : null;

    const paint = y => {
      const span = mBelieve.h - vh;
      if (span <= 0) return;
      const p = clamp01((y - mBelieve.top) / span);

      /* The card. Its box is the whole stage and never changes — what opens is
         a clip, and the hairline rides a scale, because scrubbing width and
         height was layout on every frame and scored CLS 0.168 / 0.386. The
         geometry below is the same geometry; only what carries it changed. */
      const W = mCard.w, H = mCard.h;
      const restW = mDuo ? mDuo.w : Math.min(1080, vw * 0.92);
      /* On a phone a 16:9 card off a 350px column is 197px tall in an 844px
         stage — nearly all void. Floor it so the stage is mostly card. */
      const restH = vw < 600
        ? Math.max(restW * 9 / 16, Math.min(H * 0.66, 540))
        : restW * 9 / 16;

      /* THE OUTRO USED TO COST A SCREEN. The drum finished at p=0.7147 and the
         card did not begin closing until 0.7647, so a fifth of a 425vh section
         — 121vh, more than a full viewport at 1440x900 — was a plate with no
         statement on it and nothing else happening. Captured cold it is a
         completely empty frame, and it is the last thing the section says.
         The last statement now holds to 0.86 and the close runs from 0.88,
         which is 36vh: long enough to read as a bookend, too short to sit in. */
      const zoomIn  = clamp01((p - 0.09) / (0.26 - 0.09));
      const zoomOut = clamp01((p - 0.88) / (1 - 0.88));
      const open = zoomIn * (1 - zoomOut);

      const w = lerp(restW, W, open), h = lerp(restH, H, open);
      card.style.setProperty('--ix', `${Math.max(0, (W - w) / 2).toFixed(1)}px`);
      card.style.setProperty('--iy', `${Math.max(0, (H - h) / 2).toFixed(1)}px`);
      card.style.setProperty('--r',  `${lerp(10, 0, open).toFixed(2)}px`);
      card.style.setProperty('--sx', (W ? w / W : 1).toFixed(4));
      card.style.setProperty('--sy', (H ? h / H : 1).toFixed(4));
      card.style.setProperty('--bo', (1 - open).toFixed(3));
      /* THE LAST STATEMENT RIDES THE CARD OUT. Fading the body with zoomOut
         left the section's final 900px as a photograph with nothing written on
         it — captured cold at y=4350 and y=4600, two full screens of the shroud
         plate carrying no eyebrow, no sentence and no button, which is the last
         thing the manifesto says. The card's own clip is what closes the
         section; the body does not need to leave for that to read, and at the
         closed size (the duo card's 1080px) a 32px statement on a 20ch measure
         still fits with room. So it holds, and the section ends on its own
         conclusion instead of on an empty plate. */
      if (body) body.style.setProperty('--o', clamp01(p / 0.09).toFixed(3));

      /* the drum */
      const t = clamp01((p - 0.26) / (0.86 - 0.26));

      /* THE GROUNDS. A WIPE, NOT A DISSOLVE — 2026-09-09.
         Cross-fading was the obvious thing and it was wrong: measured at the
         boundary, the nave sat at 0.350 while the vault was still at 0.338, so
         a third of the section's length showed two unrelated photographs
         superimposed, and where the nave's arch crossed the vault's rib it
         produced a hard diagonal seam that belongs to neither picture. Two
         frames of one continuous shot can dissolve. Two different rooms cannot.
         So each ground WIPES over the one below it behind a feathered edge:
         the plate is at full weight the whole time and what travels is a mask,
         which means no pixel on the screen is ever showing two photographs and
         there is no moment when the ground is darker than either of them. The
         stack does the rest — once a plate is fully in, the one under it is
         simply covered.
         data-in / data-out are where in the drum each wipe starts and ends. */
      for (let k = 0; k < plates.length; k++) {
        const el = plates[k];
        const a = +el.dataset.in, bnd = +el.dataset.out;
        if (Number.isNaN(a)) { el.style.setProperty('--pv', '1'); continue; }
        const q = clamp01((t - a) / (bnd - a));
        /* The band is 100% of travel plus the feather either side, so the mask
           is fully off screen at q=0 and fully past it at q=1. */
        const FEATHER = 16;
        const edge = -FEATHER + q * (100 + 2 * FEATHER);
        el.style.setProperty('--w0', `${(edge - FEATHER).toFixed(1)}%`);
        el.style.setProperty('--w1', `${(edge + FEATHER).toFixed(1)}%`);
        el.style.setProperty('--pv', q > 0 ? '1' : '0');
      }
      /* The camera runs off p, not t. t is the WIPE clock — it is clamped to
         0.26..0.86 so the plates hand over inside the middle of the section —
         and driving the push-in from it meant the camera was frozen for the
         first quarter of the traverse and the last seventh. Those were two of
         the page's eight dead screens: y=2310 changed two elements between
         samples and y=3960 changed one, both inside #believe, both while a
         full-bleed photograph sat perfectly still under a paragraph. Same
         camera, same 11.5% and same 2.4%, spread over the whole 300vh instead
         of the middle 60% of it, so the ground is always creeping. */
      card.style.setProperty('--cam', (1 + 0.115 * p).toFixed(4));
      card.style.setProperty('--camy', (-2.4 * p).toFixed(3));
      /* The ground darkens as the statements accumulate. Measured 2026-09-09
         across the whole 3,240px, the plate never once exceeded 0.283 opacity
         and sat under a further 0.66 vignette on top of that: mean luminance
         13.3, 53.6% of the frame at pure black. That is not atmosphere, that is
         a section with the lights off, and it threw away the only thing in it a
         reader can look at. The arc is the same arc — it still closes darker
         than it opens — with the whole range lifted so the photograph is
         actually present. */
      card.style.setProperty('--veil', (0.92 - 0.18 * t).toFixed(3));
      const seg = t * (N - 1);
      const i = Math.min(N - 2, Math.floor(seg));
      const pos = N > 1 ? i + snap(seg - i) : 0;

      /* The drum moves by transform, which by definition does not affect layout,
         so clientHeight and every offsetTop are constants for the whole scrub.
         They used to be read after a style write, five times over, every frame
         of a 425vh section — write, read, write, read. Measured once instead,
         and dropped wherever the page's other geometry is dropped. */
      if (!centres) measureDrum();
      const mid = winH / 2;
      /* The falloff has to be normalised to the LINE PITCH, not the container.
         Against half the box (~260px) a neighbouring statement 110px away
         scored d=0.42, so (1-d)^3 left it at 0.195 opacity — three statements
         legible at once, and at the midpoint a full double image. Against the
         pitch, a neighbour scores 1 and disappears. */
      const pitch = N > 1 ? (centres[N - 1] - centres[0]) / (N - 1) : mid;
      const ia = Math.min(N - 1, Math.floor(pos)), ib = Math.min(N - 1, Math.ceil(pos));
      const target = lerp(centres[ia], centres[ib], pos - Math.floor(pos));
      const shift = mid - target;
      drum.style.transform = `translateY(${shift.toFixed(2)}px)`;

      for (let i2 = 0; i2 < N; i2++) {
        const el = items[i2];
        const signed = (centres[i2] + shift - mid) / pitch;   /* −1 above … +1 below */
        const d = Math.min(1, Math.abs(signed));
        /* LINEAR, 2026-09-09. (1−d)³ was chosen to stop three statements being
           legible at once, and it did — by making sure that between any two of
           them NONE of them is. Two neighbours at the midpoint each score
           d=0.5, so a cubed falloff gives 0.125 each and 0.25 total: the drum
           spends every handoff at a quarter of full ink. Measured at the four
           handoffs the totals were 0.33 / 0.36 / 0.16 / 0.40 — the third one
           is the strongest line on the section reading at a tenth of white,
           over the brightest ground on it.
           A linear falloff sums to exactly 1.0 at every position, which is the
           whole point and is what the reference does. The pitch normalisation
           above is what keeps a third statement out of it — that was always the
           part doing the work, and it still is. */
        el.style.opacity = (1 - d).toFixed(3);
        el.style.transform =
          `scale(${lerp(1, .6, d).toFixed(3)}) rotateX(${(60 * d * (signed > 0 ? -1 : 1)).toFixed(1)}deg)`;
        el.style.filter = d > 0.01 ? `blur(${d.toFixed(2)}px)` : 'none';
      }
    };
    onScroll(paint);
  }

  /* the hero's slow drift — 0.5px of travel per pixel of scroll, capped, so the
     headline separates from the frame behind it without the frame ever
     detaching from the section */
  const heroMedia = q('.hero-media'), heroEl = q('.hero');
  if (heroMedia && !calm && !NATIVE) {
    let heroDone = false;
    onScroll(y => {
      if (y > vh * 1.2) { if (!heroDone) { heroDone = true; heroEl && (heroEl.style.opacity = '0.5'); } return; }
      heroDone = false;
      heroMedia.style.transform = `translate3d(0,${Math.min(450, y * 0.5).toFixed(1)}px,0)`;
      /* the other half of the parallax pair: the hero dims 1 → .5 across 20–80% */
      if (heroEl) heroEl.style.opacity = (1 - 0.5 * clamp01((y - vh * 0.2) / (vh * 0.6))).toFixed(3);
    });
  }

  /* The photo cards' photographs pan with the scroll — half a card of travel
     over the card's whole traverse, linear, on the reference's own geometry
     (top:-50%, height:150%). This is what the 1.08 hover scale was standing in
     for, and it is the one that is actually on the reference. */
  /* And on the three subpages, the SAME move at a shorter throw. Measured
     2026-09-09: after the one-shot fade-up, exactly one element on /team/ and
     /events/ changed with scroll — the footer. Six portraits, two event cards
     and a photograph on /start/ all sat still for the whole page. This is not
     a new effect; it is the effect the home page already runs, given to the
     photographs that were missing it, at 0.28 of a frame rather than 0.5
     because these plates are shorter and a half-frame pan inside a 4:5 card
     shows its own edge. */
  /* Measured this round against the reference, sampling both pages at forty
     scroll positions and counting the elements whose transform / opacity /
     filter changed between consecutive samples: it never falls below three
     moving elements in forty samples, and we fell to two or fewer at EIGHT of
     them. The means were close — 13.6 against 15.8 — so the gap was never
     "more motion", it was that this page stops dead eight times and that one
     never does. Two of the eight were #evening: its six cells carry full-bleed
     media and were the only photographs on the page that sat still, because
     the table below was written before the cells had any. */
  const PAN = [['.pcard img, .pcard > video', '.pcard', 0.5],
               ['.cface img, .ephoto img, .hubphoto img', '.cface, .ephoto, .hubphoto', 0.28],
               ['.cell > img, .cell > picture > img, .cell > video', '.cell', 0.14]];
  if (!calm) for (const [sel, box, amt] of PAN) qa(sel).forEach(img => {
    /* .closest, not .parentElement — the WebP <picture> sits between them now. */
    const host = img.closest(box);
    if (!host) return;
    const m = track(host);
    onScroll(y => {
      const top = m.top - y;
      if (top + m.h < -100 || top > vh + 100) return;
      const p = clamp01((vh - top) / (vh + m.h));
      img.style.transform = `translate3d(0,${(p * m.h * amt).toFixed(1)}px,0)`;
    });
  });

  /* §6b — the two columns run at different rates -------------------------
     Measured against the reference this round: it changes 13.1 elements between
     consecutive scroll samples over a 9,363px page; we changed 7.7 over 14,085.
     Per screen that is two and a half times more of the page in motion, and it
     is the whole of "not as interactive". Reading what actually moves over
     there, the tell is `foundersColumn` appearing TWICE in the list — two
     columns of content travelling at different rates as you scroll past them.

     We have had that structure since the section was built and never used it:
     #voices is two fixed-width columns, the second already reversed so the
     tiles stagger. A static stagger is a composition; a differential is a
     parallax, and it is the same idea alive. One column lags, one leads, 34px
     each way over the section's whole traverse — enough to read as depth, far
     short of the point where the two stop looking like one row.

     No new element, no new listener: onScroll is the page's single rAF
     subscriber and `track` already caches the geometry it needs. */
  /* §6c — the last three dead screens were the footer ------------------
     y=12540, 12870 and 13200 changed 1, 0 and 0 elements: the longest still
     run on the page, and the reference's own footer is the one place it puts
     an animated SVG line precisely because a footer is where a long page is
     most likely to go quiet. This is not that; it is the wordmark this footer
     already sets at 8vw drifting against its columns, which is the same
     differential §6b uses and needs no new element. 40px over the footer's
     whole traverse — a wordmark that size reads a 40px lag as weight.

     #rooms-home was the other two, at 0 and 0. It is a map beside a list,
     which is the same two-column shape again. */
  /* Amounts are set from the MEASURED gap each pair has to spend, not by eye.
     A differential closes the space between two stacked boxes by amt + 0.55·amt
     at one end of the traverse, so .foot-base against .foot-fine at 14 closed
     21.7px of a 22px margin — the sign-off and the credit paragraph touching at
     the bottom of the scroll. Gaps here are 110px, 28px, 22px.

     minw is the second correction. .voices wraps below ~800px and .rooms-block
     is one column below 900px, and once two side-by-side columns become two
     stacked ones the differential is no longer separating them in depth, it is
     driving them into each other across a 16px flex gap. Below the guard the
     transform is cleared rather than merely left unwritten, because the last
     value from a wider viewport would otherwise stay stuck on the element. */
  if (!calm) {
    const pairs = [['#voices .vcol:first-child', '#voices .vcol:last-child', 34, '#voices .voices', 800],
                   ['.foot-line', '.foot-cols', 28, '.foot', 0],
                   ['.rooms-map', '.rooms-list', 26, '.rooms-block', 900],
                   /* By the last three samples the wordmark has scrolled past
                      and only the sign-off and the credit paragraph are on
                      screen, so pairing those two is what actually keeps the
                      bottom of the page alive. 14px, because this is fine
                      print and it should read as settling, not as sliding. */
                   ['.foot-base', '.foot-fine', 5, '.foot', 0]];
    for (const [aSel, bSel, amt, hostSel, minw] of pairs) {
      const host = q(hostSel), A = q(aSel), B = q(bSel);
      if (!host || !A || !B) continue;
      const m = track(host);
      let cleared = false;
      onScroll(y => {
        if (vw < minw) {
          if (!cleared) { A.style.transform = ''; B.style.transform = ''; cleared = true; }
          return;
        }
        cleared = false;
        const span = m.h + vh;
        if (span <= 0) return;
        const top = m.top - y;
        if (top + m.h < -120 || top > vh + 120) return;
        /* −1 above the fold to +1 below it, so the pair is level exactly when
           the block is centred and diverges either side of that. */
        const t2 = clamp01((vh - top) / span) * 2 - 1;
        A.style.transform = `translate3d(0,${(t2 * amt).toFixed(1)}px,0)`;
        B.style.transform = `translate3d(0,${(t2 * -amt * 0.55).toFixed(1)}px,0)`;
      });
    }
  }

  /* §7 — counters ---------------------------------------------------------- */
  /* 2000ms, power2.out, once. Suffixes are static text beside the span so the
     number can be replaced without touching the glyphs around it. */
  const nums = qa('#stats [data-to]');
  if (nums.length) {
    const run = el => {
      const to = +el.dataset.to, t0 = performance.now(), D = 2000;
      const step = now => {
        const p = Math.min(1, (now - t0) / D);
        /* power2.out — MOTION.md §1.2 row 17 names it verbatim; this was cubed. */
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 2)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (calm || !('IntersectionObserver' in window)) {
      nums.forEach(el => { el.textContent = el.dataset.to; });
    } else {
      /* Re-arm on the way out, so scrolling back gets the count again — the
         reference resets to 0 below half visibility and replays. */
      const io = new IntersectionObserver(es => {
        es.forEach(e => {
          if (e.isIntersecting && !e.target.dataset.ran) { e.target.dataset.ran = '1'; run(e.target); }
          else if (!e.isIntersecting && e.target.dataset.ran) { delete e.target.dataset.ran; e.target.textContent = '0'; }
        });
      }, { threshold: 0.6 });
      nums.forEach(el => io.observe(el));
    }
  }

  /* §8 — the partner row --------------------------------------------------- */
  /* Nothing. The strip was two counter-scrolling tracks built from this list at
     runtime; since 2026-09-09 it is three marks standing still and one line of
     names, both written in the HTML, so there is no track to fill and no
     duration to set. The names live in index.html because they are content.
     Removed: PARTNERS, the [data-track] loop, and @keyframes slide. */

  /* §8b2 — the rooms answer each other -------------------------------------
     The map and the list are two views of five things and they were two views
     that had never met: an independent read of the band captured a pin's
     transform and opacity before and after hovering its row and found them
     identical, and called the whole block "bolted on" for it — correctly. A
     list beside a map that does not point at the map is a list printed twice.
     So: pointing at a room lights its pin, and pointing at a pin lights its
     row. `data-room` is the venue id build-map.mjs already writes on both
     sides, so there is nothing to keep in step. Class, not inline style, so the
     transition lives in CSS with every other one; and it is bound on the LIST,
     which is where the anchors are, so a keyboard visitor gets it from focus
     for free without the map holding a single tab stop. */
  const roomsBlock = q('#rooms-home');
  if (roomsBlock) {
    const pinsById = new Map(qa('.hpin', roomsBlock).map(el => [el.dataset.room, el]));
    const lit = new Set();
    const light = (id, on) => {
      const pin = pinsById.get(id);
      if (pin) pin.classList.toggle('is-lit', on);
      if (on) lit.add(id); else lit.delete(id);
    };
    for (const a of qa('.rooms-list a', roomsBlock)) {
      const id = a.dataset.room;
      const on = () => light(id, true), off = () => light(id, false);
      a.addEventListener('pointerenter', on);
      a.addEventListener('pointerleave', off);
      a.addEventListener('focus', on);
      a.addEventListener('blur', off);
    }
  }

  /* §8c — the evening's clock ---------------------------------------------
     Three hours over one section, driven by where the section sits in the
     viewport rather than by a timer: at the moment #evening's top reaches the
     bottom of the window it reads 18:30, and when its bottom reaches the top
     it reads 21:30. Between those it is linear, quantised to five minutes so
     the digits step rather than flicker — a clock that changes every frame is
     a stopwatch, and this is meant to read as the evening passing.
     onScroll is the page's single rAF subscriber; this adds no listener and no
     timer, and under prefers-reduced-motion (`calm`) it is left at the 18:30
     the HTML already contains, which is a true statement about when the
     evening starts. */
  const eClock = q('#eveningClock');
  if (eClock && !calm) {
    const out = eClock.firstElementChild || eClock;
    const evening = q('#evening');
    if (evening) {
      const mE = track(evening);
      const START = 18 * 60 + 30, END = 21 * 60 + 30;
      let last = '';
      onScroll(y => {
        /* Measured from the section's own top, not from the moment it appears:
           tied to the viewport's bottom edge the clock read 19:25 before the
           heading had finished arriving, which says the evening is an hour old
           at the moment it is introduced. It now reads 18:30 while the header
           is on screen and reaches 21:30 as the last cell leaves. */
        const span = mE.h - vh;
        if (span <= 0) return;
        const p = clamp01((y - mE.top) / span);
        const mins = Math.round((START + (END - START) * p) / 5) * 5;
        /* Twelve-hour, because the sentence directly above this line says "6:30
           to 9:30" and the four cells below say "6:30 — the reception". A clock
           reading 18:30 beside copy reading 6:30 is the same moment written two
           ways on one screen. The hero's clock stays 24-hour: that one is the
           wall in San Francisco, not this evening. */
        const t = `${((Math.floor(mins / 60) - 1) % 12) + 1}:${String(mins % 60).padStart(2, '0')}`;
        if (t !== last) { out.textContent = t; last = t; }
      });
    }
  }

  /* §8b — the perk marquee -------------------------------------------------
     /membership's answer to "what do I get": nine photo cards a row, two rows
     running against each other at 30s. Each card is one sentence over a 45%
     scrim. Every claim here is in research/instagram-dossier.md. */
  const PERKS = [
    ['sept-audience', 'A keynote on one theme of Catholic Social Teaching'],
    ['panel-table',   'A panel of people who actually do the work'],
    ['after-talk',    'A reception at 6:30, and another one after'],
    ['laughing',      'Free, for ages 21 to 40'],
    ['serve-crew',    'A direct ministry action every month'],
    ['sept-group',    'Formed with the Archdiocese of San Francisco'],
    ['room-back',     'Business casual. No application — only a registration'],
    ['qa-hands',      'A room that has sold out every time'],
    ['sept-network',  'Seventeen speakers and panelists so far']
  ];
  const PERK_W = { 'sept-audience':800, 'panel-table':800, 'after-talk':800, 'laughing':780,
                   'serve-crew':900, 'sept-group':780, 'room-back':780, 'qa-hands':800,
                   'sept-network':800 };
  qa('[data-perks]').forEach((row, i) => {
    if (row.children.length) return;          /* pre-rendered in the HTML */
    const list = i ? [...PERKS].reverse() : PERKS;
    const card = ([img, line]) =>
      `<div class="perk"><img src="assets/img/${img}-${PERK_W[img]}.jpg" alt="" loading="lazy" decoding="async"><p>${line}</p></div>`;
    row.innerHTML = [...list, ...list].map(card).join('');
  });

  /* §9 — the Instagram feed ------------------------------------------------ */
  /* Every tile is a real post and links to its own permalink. Heights come from
     each file's own aspect ratio, which is what gives the columns their
     uneven, un-art-directed rhythm. */
  const POSTS = [
    ['Dc0IHIAFJ36_01', 'Dc0IHIAFJ36', 640, 335, 'Sep 1 · The room'],
    ['Dc0IHIAFJ36_02', 'Dc0IHIAFJ36', 640, 337, 'Sep 1 · Fr. Michael Sweeney, OP'],
    ['Dc0IHIAFJ36_10', 'Dc0IHIAFJ36', 640, 335, 'Sep 1 · Networking'],
    ['Db3x4v6hxow',    'Db3x4v6hxow', 360, 640, 'Aug 10 · Roberto Lacayo', 'interview-lacayo'],
    ['DcOpj1nG-9D_01', 'DcOpj1nG-9D', 640, 486, 'Aug 19 · The Shroud of Turin'],
    ['Dc0IHIAFJ36_03', 'Dc0IHIAFJ36', 640, 337, 'Sep 1 · In the room'],
    ['DchC3zoh-xg_01', 'DchC3zoh-xg', 640, 378, 'Aug 26 · After a meal'],
    ['Dc0IHIAFJ36_09', 'Dc0IHIAFJ36', 640, 337, 'Sep 1 · After the talk'],
    ['DbmTXzlGLPl_02', 'DbmTXzlGLPl', 640, 853, 'Aug 4 · Missionaries of Charity'],
    ['Dc0IHIAFJ36_04', 'Dc0IHIAFJ36', 640, 337, 'Sep 1 · The panel'],
    ['DbuObFxFJY3_03', 'DbuObFxFJY3', 640, 346, 'Aug 7 · The panel'],
    ['Dc0IHIAFJ36_05', 'Dc0IHIAFJ36', 640, 337, 'Sep 1 · Listening'],
    ['DbuObFxFJY3_02', 'DbuObFxFJY3', 640, 346, 'Aug 7 · Called to Serve'],
    ['DbmTXzlGLPl_04', 'DbmTXzlGLPl', 640, 853, 'Aug 4 · At the encampment'],
    ['Dc0IHIAFJ36_06', 'Dc0IHIAFJ36', 640, 337, 'Sep 1 · The panel'],
    ['DcOpj1nG-9D_02', 'DcOpj1nG-9D', 640, 486, 'Aug 19 · Othonia’s replica'],
    ['DZJY-BjJgjU_01', 'DZJY-BjJgjU', 640, 335, 'Jun 4 · The first evening'],
    ['Dc0IHIAFJ36_07', 'Dc0IHIAFJ36', 640, 337, 'Sep 1 · Handouts'],
    ['DawmlieFIHm_02', 'DawmlieFIHm', 640, 337, 'Jul 14 · Rights and Responsibilities'],
    ['Dc0IHIAFJ36_11', 'Dc0IHIAFJ36', 640, 335, 'Sep 1 · The full panel'],
    ['DbULpBWJ-ok',    'DbULpBWJ-ok', 640, 640, 'Jul 27 · Called to Serve'],
    ['DZ6Ga2yptfR',    'DZ6Ga2yptfR', 640, 640, 'Jun 23 · Called to Lead'],
    ['DcKANRuGtzj',    'DcKANRuGtzj', 640, 640, 'Aug 17 · The Work of Human Hands'],
    ['DZGufi6JAbk',    'DZGufi6JAbk', 640, 640, 'Jun 3 · Called to Lead, Vol. I'],
    ['DbuObFxFJY3_04', 'DbuObFxFJY3', 640, 346, 'Aug 7 · Questions from the floor'],
    ['Dc0IHIAFJ36_08', 'Dc0IHIAFJ36', 640, 337, 'Sep 1 · The hall'],
    ['DawmlieFIHm_09', 'DawmlieFIHm', 640, 337, 'Jul 14 · The reception'],
    ['DbuObFxFJY3_01', 'DbuObFxFJY3', 640, 345, 'Aug 7 · The hall'],
    ['DcOpj1nG-9D_01', 'DcOpj1nG-9D', 640, 486, 'Aug 19 · The Shroud, up close'],
    ['DbmTXzlGLPl_02', 'DbmTXzlGLPl', 640, 853, 'Aug 4 · Homeless ministry, SF']
  ];;
  let renderFeed = () => {};
  let attachVideoTiles = () => {};

  const feed = q('#feed');
  if (feed) {
    /* Five equal columns, filled round-robin so the aspect ratios interleave
       rather than clumping. Every tile is 3:4 and cropped — the source shapes
       vary wildly and a uniform tile is what makes the wall read as one
       surface instead of a contact sheet. */
    const COLS = 5;

    const card = ([file, code, w, h, cap, vid]) => `
      <a class="fcard" href="https://www.instagram.com/p/${code}/" target="_blank" rel="noopener noreferrer"
         aria-label="Instagram — ${String(cap).replace(/["<>]/g, '')} (opens in a new tab)">
        ${vid ? `<video muted loop playsinline preload="none"
                   poster="assets/feed/${file}-640.jpg" data-src="assets/video/${vid}.mp4"></video>`
              : `<picture><source type="image/webp"
                   srcset="assets/feed/${file}-400.webp 400w, assets/feed/${file}-640.webp 640w, assets/feed/${file}-900.webp 900w"
                   sizes="(max-width:800px) 33vw, 20vw"><img src="assets/feed/${file}-640.jpg"
                   srcset="assets/feed/${file}-400.jpg 400w, assets/feed/${file}-640.jpg 640w, assets/feed/${file}-900.jpg 900w"
                   sizes="(max-width:800px) 33vw, 20vw" width="640" height="853"
                   loading="lazy" decoding="async" alt=""></picture>`}
        <span class="fcard-ov">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"
            fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </a>`;

    /* One renderer, used both for the no-JS-markup case and for a refresh from
       feed.json, so a rebuilt wall is identical to a shipped one. */
    let fcols = qa('.fcol', feed);
    renderFeed = (el, posts) => {
      const cols = Array.from({ length: COLS }, () => []);
      posts.forEach((post, i) => cols[i % COLS].push(post));
      el.innerHTML = cols.map(c => `<div class="fcol">${c.map(card).join('')}</div>`).join('');
      fcols = qa('.fcol', el);
      attachVideoTiles(el);
    };

    if (!feed.children.length) renderFeed(feed, POSTS);   /* otherwise pre-rendered in the HTML */

    /* Each column drifts at its own rate as the section passes — .03 and .08 of
       the scroll, alternating. Offsets are measured from the section's centre so
       the drift stays bounded instead of accumulating down the page. */
    if (!calm) {
      const K = [0.03, 0.08, 0.03, 0.08, 0.03];
      const mFeed = track(feed);
      onScroll(y => {
        const top = mFeed.top - y;
        if (top + mFeed.h < -400 || top > vh + 400) return;
        const rel = (vh / 2) - (top + mFeed.h / 2);
        fcols.forEach((c, i) => { c.style.transform = `translate3d(0,${(rel * K[i]).toFixed(1)}px,0)`; });
      });
    }
  }

  /* §9b — the feed refreshes itself from data, not from markup -------------
     The wall is pre-rendered in index.html so it is real HTML for a crawler and
     for a visitor whose JS never arrives. But the source of truth is
     assets/feed/feed.json: on every load the page reads it, and if it names a
     different set of tiles than the DOM is showing, it rebuilds the columns.

     So publishing new posts is a data change. Drop a new feed.json (and its
     media) — from tools/refresh-feed.mjs, a scheduled job, or by hand — and
     every visitor gets the new wall on their next load, with no HTML edit and
     no redeploy of the page itself. The rebuild reuses renderFeed() below, so
     the parallax, the aspect ratios and the lazy video all come along. */
  const refreshFeed = async () => {
    const feed = q('#feed');
    if (!feed || !('fetch' in window)) return;
    try {
      const res = await fetch('assets/feed/feed.json', { cache: 'no-cache' });
      if (!res.ok) return;
      const data = await res.json();
      if (!data || !Array.isArray(data.tiles) || data.tiles.length < 15) return;

      const shown = qa('.fcard img, .fcard video', feed)
        .map(el => (el.getAttribute('src') || el.getAttribute('poster') || '')
          .replace(/^.*\/(.*?)-\d+\.(?:jpg|webp)$/, '$1'));
      /* Compare the SET, not the order: the shipped markup is column-major and
         the file is row-major, so an order comparison would rebuild the wall on
         every single load. What matters is whether the posts changed. */
      const next = data.tiles.map(t => t.id);
      const same = shown.length === next.length &&
        shown.slice().sort().join('|') === next.slice().sort().join('|');
      if (same) return;

      renderFeed(feed, data.tiles.map(t => [t.id, t.shortcode, t.w, t.h, t.alt, t.video]));
      remeasure();
    } catch { /* a feed that will not load is a feed that stays as it was */ }
  };

  /* §10 — video tiles ------------------------------------------------------ */
  /* Sources attach on approach, so the first load is images only. Playing only
     while on screen is both the polite thing to do to a battery and what the
     reference does; these clips carry no audio track at all, so there is no
     hover-to-unmute to reproduce. */
  /* The four below-the-fold tiles hold their poster in data-poster, because
     preload="none" stops the media bytes and not the poster — all four were
     being fetched eagerly, 168 KB of images two screens below the fold. The
     selector and the regex both have to know about it, or the source derivation
     below silently stops finding these videos and they stay still images. */
  /* §10a — /team/'s inline pill ------------------------------------------
     The hero on /team/ sets a looping clip inside the sentence. What ships in
     the markup is the still, because a <video> in a document with scripting
     disabled gets user-agent controls whether or not it asked for them —
     Chromium draws a play triangle, a mute button and a scrub bar, which on a
     decorative aria-hidden loop is a set of promises the element cannot keep.
     So the element is built here, from the still that is already correct, and
     only when it is going to move: a visitor on prefers-reduced-motion keeps
     the image and never has a video element at all. Everything after this
     line then treats it as one more tile — the same derivation, the same
     observer, the same play-on-screen. */
  if (!calm) qa('.thero-pill[data-clip]').forEach(pill => {
    const still = pill.querySelector('img');
    if (!still) return;
    const v = document.createElement('video');
    v.muted = v.loop = v.playsInline = true;
    v.preload = 'none';
    v.disablePictureInPicture = true;
    v.setAttribute('aria-hidden', 'true');
    v.width = still.width; v.height = still.height;
    v.poster = still.currentSrc || still.src;
    v.src = pill.dataset.clip;
    v.dataset.src = pill.dataset.clip;      /* so the derivation below stops */
    pill.append(v);
  });

  qa('video[poster],video[data-poster]').forEach(v => {
    if (v.querySelector('source') || v.dataset.src) return;
    const m = (v.dataset.poster || v.getAttribute('poster') || '')
      .match(/assets\/video\/([\w-]+)-poster\.(?:jpg|webp)$/);
    if (m) { v.dataset.src = `assets/video/${m[1]}.mp4`; v.dataset.srcMobile = `assets/video/${m[1]}-mobile.mp4`; }
  });

  const hero = q('#heroVideo');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) {
        if (v.dataset.poster && !v.poster) v.poster = v.dataset.poster;
        if (v.dataset.src && !v.src) {
          const mobile = matchMedia('(max-width:900px)').matches && v.dataset.srcMobile;
          v.src = mobile || v.dataset.src;
        }
        if (!calm) v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    }), { threshold: 0.1 });
    /* Exported so a feed rebuilt from feed.json gets its tiles observed too. */
    attachVideoTiles = (root = document) => qa('video', root).forEach(v => {
      if (v === hero) return;
      if (v.dataset.src === undefined) {
        const m = (v.getAttribute('poster') || '').match(/assets\/feed\/([\w-]+)-\d+\.(?:jpg|webp)$/);
        if (m) v.dataset.src = v.dataset.src || '';
      }
      io.observe(v);
    });
    attachVideoTiles();
  }

  /* The feed's own refresh runs after the observers exist, so a rebuilt wall is
     wired up exactly like the shipped one. */
  refreshFeed();

  /* §12 — the specular on the buttons ------------------------------------
     One delegated listener writes the pointer's position into the button as
     two custom properties; the CSS (§4) draws the highlight there. Percentages
     rather than px so the same rule serves every size of pill. Nothing runs
     for a touch pointer — there is no hover to track — and with the pointer
     away the properties are absent, so §4's initial values put the highlight at
     styles.css §1c's fixed lamp rather than at the button's centre.

     Three defects fixed here, none of them visible and all of them the class of
     thing the rest of this page has already been optimised against:

     (a) The rect was read inside the move handler. Event N+1's
         getBoundingClientRect() therefore followed event N's style write with
         style dirty — a forced synchronous layout per pointer event, at
         trackpad rates of 120Hz and up. It is cached on entry instead: nothing
         in the hover vocabulary alters the button's layout box (translateY is a
         transform, and the transformed box is the one we want anyway), so it
         cannot go stale while the pointer is inside. Any scroll that WOULD move
         it also moves the pointer out of it, which re-enters and re-reads.
     (b) pointerleave was capture-phase on document, so moving from the label
         onto the inner <svg class="arrow"> fired it and wiped the position —
         the light teleported for a frame on the way across every button on the
         page. relatedTarget settles it: a leave into the button's own subtree
         is not a leave.
     (c) --mx/--my are now registered inherits:false in styles.css, so the write
         no longer invalidates the label span and the arrow on every move.

     The travel is compressed to 62% of the pointer's excursion around the lamp.
     A highlight on a convex surface moves less than the eye that sees it; this
     is optics, not taste. It is a spatial remap inside the write that already
     happened — no transition, no lag, no extra frame. (The lagged version was
     proposed and killed in research/ui-2026/PLAN.md item 14; it stays killed.)
     None of this runs on the compositor and none of it touches scroll: it
     repaints one radial gradient while the pointer is over a 45x95px pill. */
  if (!calm && matchMedia('(hover:hover)').matches) {
    const K = 0.62;
    let hot = null, rect = null;
    /* Read from the stylesheet once, so the lamp has exactly one definition. */
    const rs = getComputedStyle(document.documentElement);
    const lamp = { x: parseFloat(rs.getPropertyValue('--lamp-x')) || 18,
                   y: parseFloat(rs.getPropertyValue('--lamp-y')) || 0 };

    document.addEventListener('pointerover', e => {
      const b = e.target.closest && e.target.closest('.btn,.play');
      if (b && b !== hot) { hot = b; rect = b.getBoundingClientRect(); }
    }, { passive: true, capture: true });

    document.addEventListener('pointermove', e => {
      const b = e.target.closest('.btn,.play');
      if (!b) return;
      if (b !== hot || !rect) { hot = b; rect = b.getBoundingClientRect(); }
      const px = (e.clientX - rect.left) / rect.width * 100;
      const py = (e.clientY - rect.top) / rect.height * 100;
      b.style.setProperty('--mx', `${(lamp.x + (px - lamp.x) * K).toFixed(1)}%`);
      b.style.setProperty('--my', `${(lamp.y + (py - lamp.y) * K).toFixed(1)}%`);
    }, { passive: true });

    document.addEventListener('pointerleave', e => {
      const b = e.target.closest && e.target.closest('.btn,.play');
      if (!b || (e.relatedTarget && b.contains(e.relatedTarget))) return;
      b.style.removeProperty('--mx'); b.style.removeProperty('--my');
      if (b === hot) { hot = null; rect = null; }
    }, { passive: true, capture: true });
  }

  /* §10b — the hero video actually starting -------------------------------
     `autoplay muted playsinline` is necessary and not sufficient: iOS Low
     Power Mode, Safari's power-saver and some data-saver modes reject the
     promise and leave the poster sitting there, which is exactly what "the
     video doesn't play" looks like. So: ask once on load, ask again when the
     tab comes back, and — the case the attribute alone can never cover — ask
     once more on the first real gesture, which is the one moment the browser
     will always say yes. Muted is re-asserted every time; a hero that
     suddenly has sound is worse than one that never plays. */
  if (hero && !calm) {
    let settled = false;
    const gestures = ['pointerdown', 'touchstart', 'keydown', 'wheel'];
    const drop = () => gestures.forEach(t => removeEventListener(t, kick));

    const attempt = () => {
      hero.muted = true;                       /* required, and re-asserted */
      const p = hero.play();
      if (p && p.then) p.then(() => { settled = true; drop(); }).catch(() => {});
    };
    const kick = () => { if (!settled) attempt(); else drop(); };

    hero.addEventListener('loadedmetadata', attempt, { once: true });
    hero.addEventListener('canplay', attempt, { once: true });
    hero.addEventListener('playing', () => { settled = true; drop(); }, { once: true });
    attempt();

    gestures.forEach(t => addEventListener(t, kick, { passive: true }));
    addEventListener('visibilitychange', () => {
      if (!document.hidden && hero.paused && scrollY < innerHeight) attempt();
    });
  }

  /* §13 — the hourly gap ---------------------------------------------------
     The build-time filter in tools/refresh-events.mjs is authoritative and it
     is right to within one hour, because that is how often the scheduled job
     runs. This closes that hour, and it is the whole of the client-side event
     logic: one pass over the elements that carry an end instant, at load, with
     no listener, no observer, no timer and no scroll work. A past event is
     never shown as next — not for an hour, not for a minute.

     With JavaScript off nothing here runs, and the page is still correct to
     within that hour, which is the right trade for a page that must work
     without script at all. */
  const now = Date.now();
  const dead = qa('[data-end]').filter(el => {
    const t = Date.parse(el.dataset.end);
    return !Number.isNaN(t) && t <= now;
  });
  if (dead.length) {
    dead.forEach(el => {
      el.hidden = true;
      /* A card that has an empty state keeps it as its own next sibling: the
         events page's lead card, and the home page's next-evening block. One
         rule serves both, which is the point — two prune rules on one site is
         how the home page came to outlive its own event. */
      const empty = el.nextElementSibling;
      if (empty && empty.hasAttribute('data-empty')) empty.hidden = false;
    });
    const up = q('#upcoming');
    if (up && !qa('.ecard', up).some(li => !li.hidden)) up.hidden = true;
  }

  /* §14 — /start/'s map ----------------------------------------------------
     THE PERFORMANCE CONTRACT, which is the part that matters on this page:
     zero scroll listeners, zero requestAnimationFrame loops, zero timers at
     rest. Nothing here runs while the page is scrolling and nothing runs when
     the visitor is not touching the map. Pin positions are baked percentages,
     so nothing measures the DOM and nothing thrashes layout. Everything that
     moves, moves on transform and opacity. The only fetch is same-origin, is
     deferred to the first focus of the city field, and its failure is
     non-fatal — the field stays a plain text input and every other thing on
     the page still works.

     With JavaScript off the map is not degraded, it is complete: the SVG is
     inline so all three layers render, the scale switch is :checked, and every
     pin is a link into a list that is visible anyway. The only things absent
     are the visitor's own pin and the distance figure, and nothing on the page
     implies they should be there. */
  const mapwrap = q('#mapwrap');
  if (mapwrap) {
    const scales = qa('input[name=mscale]', mapwrap);
    const detail = q('#map-detail');
    const dist = q('#map-dist');
    const stage = q('.mapstage', mapwrap);
    const proj = (() => {
      const el = q('#map-proj');
      try { return el ? JSON.parse(el.textContent) : null; } catch { return null; }
    })();

    /* An instant that has passed stops being "upcoming". Same contract as §13
       and the same trade: at load, once, with no timer, so the page is right to
       within an hour of the build even with the script off. */
    const nowMs = Date.now();
    qa('.vrow[data-when],.pin[data-when]').forEach(el => {
      if (Date.parse(el.dataset.when) > nowMs) return;
      const tag = q('[data-upcoming]', el);
      if (tag) tag.remove();
      const sr = q('.sr', el);
      if (sr) sr.textContent = sr.textContent.replace(/, upcoming$/, '');
    });

    /* ---- the scale control -------------------------------------------------
       The switch itself is CSS. The only thing JavaScript does for it is
       promote the two layers for the 700ms they are actually moving and then
       let go again — the same "promote at the moment of the press, never
       permanently" discipline .btn:active uses. */
    let zoomT = 0;
    scales.forEach(r => r.addEventListener('change', () => {
      mapwrap.classList.add('zooming');
      clearTimeout(zoomT);
      zoomT = setTimeout(() => mapwrap.classList.remove('zooming'), 700);
    }));

    /* ---- a pin, and the venue behind it ------------------------------------
       One channel, not two: hovering, focusing and tapping do the same thing.
       No information on this map is hover-only. */
    let onPin = null;
    const clearPin = () => {
      if (!onPin) return;
      qa('.pin.is-on,.vrow.is-on', mapwrap).forEach(el => el.classList.remove('is-on'));
      if (detail) detail.replaceChildren();
      onPin = null;
    };
    const showPin = (a) => {
      const row = q(`#v-${CSS.escape(a.dataset.v)}`);
      if (!row || !detail) return;
      qa('.pin.is-on,.vrow.is-on', mapwrap).forEach(el => el.classList.remove('is-on'));
      a.classList.add('is-on');
      row.classList.add('is-on');
      /* Built from the row itself rather than from a second copy of the same
         sentences, so the card and the list cannot disagree. */
      const body = q('.vbody', row);
      detail.replaceChildren(...[...body.children].map(n => n.cloneNode(true)));
      onPin = a;
    };
    qa('.pin[data-v]', mapwrap).forEach(a => {
      a.addEventListener('click', (e) => { e.preventDefault(); showPin(a); });
      a.addEventListener('focus', () => showPin(a));
      a.addEventListener('mouseenter', () => showPin(a));
    });
    /* The frame's own background clears it, and so does Escape. */
    stage && stage.addEventListener('click', (e) => { if (!e.target.closest('.pin')) clearPin(); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') clearPin(); });

    /* ---- the city field ----------------------------------------------------
       A real combobox against a gazetteer committed to this repository. There
       is no geocoding request on a keystroke: that is blocked by this site's
       posture and it would be a live feed of what somebody is typing to a third
       party. 25 KB of text from our own origin, fetched once, leaks nothing. */
    const input = q('#city');
    const list = q('#city-list');
    const R = 6371;
    const rad = (d) => d * Math.PI / 180;
    const haversine = (a, b, c, d) => {
      const dp = rad(c - a), dl = rad(d - b);
      const h = Math.sin(dp / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dl / 2) ** 2;
      return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
    };
    const fold = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    /* The same two projections build-map.mjs baked the layers with, so a point
       placed here lands where the same point would have been baked. */
    const project = (lay, lon, lat) => {
      const p = proj && proj[lay];
      if (!p) return null;
      let x, y;
      if (p.proj === 'ne1') {
        const ph = rad(lat), l = rad(lon), p2 = ph * ph, p4 = p2 * p2;
        x = l * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 - 0.001529 * p2)));
        y = ph * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)));
      } else {
        x = rad(lon);
        y = Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2));
      }
      return [p.cx + (x - p.x0) * p.k, p.cy - (y - p.y0) * p.k];
    };
    const inBox = (b, lon, lat) => lon >= b[0] && lon <= b[2] && lat >= b[1] && lat <= b[3];

    let places = null, loading = null, chosen = null, active = -1, options = [];

    const load = () => {
      if (places || loading) return loading;
      const src = input && input.dataset.src;
      if (!src) return null;
      loading = fetch(src).then(r => r.ok ? r.text() : Promise.reject())
        .then(t => {
          places = t.split('\n').filter(Boolean).map(l => {
            const [name, region, lat, lon] = l.split('|');
            return { name, region, lat: +lat, lon: +lon, key: fold(name) };
          });
        })
        /* Non-fatal by design: with no list the field is a plain text input,
           the visitor still types a city, and it still reaches the form. */
        .catch(() => { places = []; });
      return loading;
    };

    const closeList = () => {
      if (!list) return;
      list.hidden = true;
      list.replaceChildren();
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      active = -1; options = [];
    };

    const render = (matches) => {
      if (!list) return;
      if (!matches.length) { closeList(); return; }
      list.replaceChildren(...matches.map((m, i) => {
        const li = document.createElement('li');
        li.id = `city-o${i}`;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', 'false');
        li.append(m.name, ' ');
        const st = document.createElement('span');
        st.className = 'st';
        st.textContent = m.region;
        li.append(st);
        li.addEventListener('mousedown', (e) => { e.preventDefault(); commit(m); });
        return li;
      }));
      list.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      options = matches;
      active = -1;
    };

    const mark = () => {
      qa('li', list).forEach((li, i) => li.setAttribute('aria-selected', i === active ? 'true' : 'false'));
      if (active >= 0) input.setAttribute('aria-activedescendant', `city-o${active}`);
      else input.removeAttribute('aria-activedescendant');
    };

    const search = (raw) => {
      const s = fold(raw.trim());
      if (!s || !places) return [];
      const starts = [], has = [];
      for (const p of places) {
        if (p.key.startsWith(s)) starts.push(p);
        else if (s.length > 2 && p.key.includes(s)) has.push(p);
        if (starts.length >= 8) break;
      }
      return [...starts, ...has].slice(0, 8);
    };

    /* ---- the visitor's pin, and the number that is the payoff --------------
       The pin is an OPEN RING, never a filled disc, and it is labelled with the
       word "You". It exists only in this browser, for this session: nothing is
       stored, nothing is shared with another visitor, and no pin on this map is
       ever derived from anybody's submission. The map is CLIA's own record, not
       a guestbook. */
    const you = (() => {
      const a = document.createElement('span');
      a.className = 'pin is-you';
      a.dataset.dir = 'E';
      a.style.setProperty('--lead', '3.2%');
      const dot = document.createElement('i');
      dot.className = 'dot';
      dot.setAttribute('aria-hidden', 'true');
      const lbl = document.createElement('span');
      lbl.className = 'lbl';
      a.append(dot, lbl);
      return a;
    })();

    const conn = (() => {
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      s.setAttribute('class', 'mapconn');
      s.setAttribute('viewBox', '0 0 1000 750');
      s.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      s.setAttribute('aria-hidden', 'true');
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('stroke', 'rgba(245,238,214,.55)');
      l.setAttribute('stroke-width', '1.4');
      l.setAttribute('stroke-dasharray', '4 5');
      l.setAttribute('vector-effect', 'non-scaling-stroke');
      s.append(l);
      return { svg: s, line: l };
    })();

    const km = (v) => v >= 100 ? Math.round(v).toLocaleString('en-US')
      : v >= 10 ? v.toFixed(0) : v.toFixed(1);

    const place = (city) => {
      if (!proj || !city) return;
      /* Whichever scale actually contains the point — never a pin sitting on a
         frame it is not inside. */
      const lay = inBox(proj.sf.bbox, city.lon, city.lat) ? 'sf'
        : inBox(proj.bay.bbox, city.lon, city.lat) ? 'bay' : 'world';
      const xy = project(lay, city.lon, city.lat);
      if (!xy) return;
      const host = q(`.pins-${lay}`, mapwrap);
      if (!host) return;
      you.style.setProperty('--x', `${(xy[0] / 1000 * 100).toFixed(2)}%`);
      you.style.setProperty('--y', `${(xy[1] / 750 * 100).toFixed(2)}%`);
      you.dataset.dir = xy[0] > 620 ? 'W' : 'E';
      q('.lbl', you).textContent = `You · ${city.name}`;
      host.append(you);

      /* The connector is drawn only when both ends are on the frame the
         visitor is looking at and the straight line between them does not run
         the wrong way round the planet. A deterministic rule, no projection
         maths, and it never implies a route across the wrong half of the world.
         The distance is the payoff; the curve is not. */
      const sfXY = project(lay, proj.sf.city[0], proj.sf.city[1]);
      const wrap = Math.abs(city.lon - proj.sf.city[0]) > 150;
      conn.svg.remove();
      if (sfXY && !wrap) {
        conn.line.setAttribute('x1', sfXY[0]); conn.line.setAttribute('y1', sfXY[1]);
        conn.line.setAttribute('x2', xy[0]); conn.line.setAttribute('y2', xy[1]);
        host.parentNode.insertBefore(conn.svg, host);
      }

      /* Show the scale the pin is actually on. */
      const radio = q(`#ms-${lay}`, mapwrap);
      if (radio && !radio.checked) { radio.checked = true; radio.dispatchEvent(new Event('change')); }

      /* Eight kilometres is San Francisco itself, not "near San Francisco".
         Oakland is thirteen away and it is emphatically not where the five
         rooms are, which is the whole thing this page is careful about. */
      const d = haversine(proj.sf.city[1], proj.sf.city[0], city.lat, city.lon);
      if (dist) {
        dist.textContent = d < 8
          ? `That is where all five rooms are. Come to an evening — or start a second one here.`
          : `${city.name} is ${km(d)} km from San Francisco. Nothing there yet.`;
      }
      mapwrap.classList.add('has-city');
    };

    const setForm = (label) => {
      const go = q('#reg-go');
      if (!go) return;
      const base = go.dataset.form;
      /* The city only. Never a name, never an email, never a coordinate:
         a city is coarse and freely given, and identifying data does not belong
         in a query string that lands in somebody's server log. */
      go.href = label ? `${base}${base.includes('?') ? '&' : '?'}city=${encodeURIComponent(label)}&via=map` : base;
    };

    const commit = (m) => {
      chosen = m;
      const label = `${m.name}, ${m.region}`;
      input.value = label;
      closeList();
      place({ ...m, name: label });
      setForm(label);
    };

    const freeText = () => {
      const raw = input.value.trim();
      setForm(raw);
      if (!raw || chosen) return;
      /* Not on the list is not a dead end. The list is suggestions, never a
         gate — a dead end here would be the worst possible failure on a page
         whose whole purpose is that somebody is somewhere we have never been. */
      you.remove(); conn.svg.remove();
      mapwrap.classList.remove('has-city');
      const w = q('#ms-world', mapwrap);
      if (w && !w.checked) { w.checked = true; w.dispatchEvent(new Event('change')); }
      if (dist) dist.textContent = `We could not find ${raw} on this map, which changes nothing — put it in the form and we will find it.`;
    };

    if (input) {
      input.addEventListener('focus', load, { once: true });
      input.addEventListener('input', () => {
        chosen = null;
        const v = input.value;
        const go = () => render(search(v));
        if (places) go(); else { const p = load(); p && p.then(go); }
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closeList(); return; }
        if (e.key === 'Enter') {
          if (active >= 0 && options[active]) { e.preventDefault(); commit(options[active]); }
          else if (options.length) { e.preventDefault(); commit(options[0]); }
          else freeText();
          return;
        }
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        if (!options.length) return;
        e.preventDefault();
        active = e.key === 'ArrowDown'
          ? (active + 1) % options.length
          : (active <= 0 ? options.length : active) - 1;
        mark();
      });
      input.addEventListener('blur', () => { closeList(); freeText(); });
    }
  }

})();
