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
     §2 nav           §8 partner marquee
     §3 reveals       §9 the Instagram feed
     §4 clock         §10 video tiles
     §5 countdown     §11 the SMS signup                                    */

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
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
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
    let chars = [];
    let closeTimer = 0;

    const set = open => {
      clearTimeout(closeTimer);
      menu.hidden = false;

      if (open && !chars.length && !calm) {
        links.forEach((a, li) => {
          const n = splitChars(a.querySelector('.lbl') || a, 0.02, 0.2 + li * 0.08);
          if (!n) return;
          chars.push(...qa('.ch', a));
        });
      }
      /* the delays only exist on the way in */
      if (!open) { menu.classList.add('closing'); chars.forEach(c => { c.style.transitionDelay = '0s'; }); }
      else { menu.classList.remove('closing'); chars.forEach(c => { c.style.transitionDelay = c.dataset.d || ''; }); }

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
      const behind = [q('#main'), q('.foot'), q('.skip'), q('.nav-links'), q('.nav-mark'), q('.nav .btn-fill')]
        .filter(Boolean);
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
    onScroll(y => {
      const d = y - last;
      if (Math.abs(d) > 6) {
        nav.toggleAttribute('data-hide', d > 0 && y > 160);
        last = y;
      }
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
    }, { threshold: 0.3, rootMargin: '0px 0px -5% 0px' });
    items.forEach(el => {
      /* Anything taller than the viewport can never reach 30%; watch those at 0. */
      if (el.offsetHeight > innerHeight * 0.8) {
        new IntersectionObserver((es, o) => es.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in'); o.disconnect(); }
        }), { threshold: 0, rootMargin: '0px 0px -12% 0px' }).observe(el);
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
  /* Tuesday 6 October 2026, 6:30 PM Pacific = 2026-10-07T01:30:00Z. */
  const cd = q('#countdown');
  if (cd) {
    const when = Date.parse('2026-10-07T01:30:00Z');
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

      const zoomIn  = clamp01((p - 0.078) / (0.2353 - 0.078));
      const zoomOut = clamp01((p - 0.7647) / (1 - 0.7647));
      const open = zoomIn * (1 - zoomOut);

      const w = lerp(restW, W, open), h = lerp(restH, H, open);
      card.style.setProperty('--ix', `${Math.max(0, (W - w) / 2).toFixed(1)}px`);
      card.style.setProperty('--iy', `${Math.max(0, (H - h) / 2).toFixed(1)}px`);
      card.style.setProperty('--r',  `${lerp(10, 0, open).toFixed(2)}px`);
      card.style.setProperty('--sx', (W ? w / W : 1).toFixed(4));
      card.style.setProperty('--sy', (H ? h / H : 1).toFixed(4));
      card.style.setProperty('--bo', (1 - open).toFixed(3));
      if (body) body.style.setProperty('--o', clamp01(p / 0.078) * (1 - zoomOut));

      /* the drum */
      const t = clamp01((p - 0.2353) / (0.7147 - 0.2353));
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
        el.style.opacity = Math.pow(1 - d, 3).toFixed(3);
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
  if (!calm) qa('.pcard img, .pcard > video').forEach(img => {
    /* .closest, not .parentElement — the WebP <picture> sits between them now. */
    const m = track(img.closest('.pcard'));
    onScroll(y => {
      const top = m.top - y;
      if (top + m.h < -100 || top > vh + 100) return;
      const p = clamp01((vh - top) / (vh + m.h));
      img.style.transform = `translate3d(0,${(p * m.h * 0.5).toFixed(1)}px,0)`;
    });
  });

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

  /* §8 — the partner marquee ---------------------------------------------- */
  /* Two tracks at their two measured speeds, running against each other. The
     list is printed twice so translateX(-50%) is a seamless wrap. */
  const PARTNERS = [
    'Archdiocese of San Francisco', 'Office of Human Life & Dignity',
    'California Catholic Conference', 'Catholic Charities San Francisco',
    'Order of Malta, Western Association', 'Lay Mission Institute',
    'Pro-Life San Francisco', 'St. Anthony Foundation',
    'Missionaries of Charity', 'Star of the Sea Young Adults',
    'Bay Wide Young Adults', 'Marin Young Adult Group'
  ];
  qa('[data-track]').forEach((row, i) => {
    row.style.setProperty('--dur', i ? '47.2s' : '45s');
    if (row.children.length) return;          /* pre-rendered in the HTML */
    const list = i ? [...PARTNERS].reverse() : PARTNERS;
    row.innerHTML = [...list, ...list].map(n => `<span>${n}</span>`).join('');
  });

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
     for a touch pointer — there is no hover to track — and the values rest at
     the centre when the pointer leaves, so the next hover starts from a
     plausible place rather than the last exit point. */
  if (!calm && matchMedia('(hover:hover)').matches) {
    document.addEventListener('pointermove', e => {
      const b = e.target.closest('.btn,.play');
      if (!b) return;
      const r = b.getBoundingClientRect();
      b.style.setProperty('--mx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`);
      b.style.setProperty('--my', `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`);
    }, { passive: true });
    document.addEventListener('pointerleave', e => {
      const b = e.target.closest && e.target.closest('.btn,.play');
      if (b) { b.style.removeProperty('--mx'); b.style.removeProperty('--my'); }
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
})();
