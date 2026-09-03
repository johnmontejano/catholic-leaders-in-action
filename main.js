/* Catholic Leaders in Action — main.js
   Contract: research/redesign-2026-09/PLAN-2.md §2. CSS owns every entrance (.is-in); GSAP + ScrollTrigger own the scrubs. */
(function () {
  'use strict';
  const html = document.documentElement;
  const JS = html.classList.contains('js');
  const MOTION = html.classList.contains('motion');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* §1 — menu (keyboard: Esc closes, focus trapped, scroll locked) */
  const menu = $('[data-menu]'), openBtn = $('[data-menu-open]'), closeBtn = $('[data-menu-close]');
  let lastFocus = null;
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    openBtn && openBtn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (open) { lastFocus = document.activeElement; (closeBtn || menu).focus(); }
    else if (lastFocus) { lastFocus.focus(); }
  }
  openBtn && openBtn.addEventListener('click', () => setMenu(true));
  closeBtn && closeBtn.addEventListener('click', () => setMenu(false));
  menu && $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => {
    if (!menu || !menu.classList.contains('is-open')) return;
    if (e.key === 'Escape') setMenu(false);
    if (e.key === 'Tab') {
      const f = $$('a,button', menu).filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* §2 — nav: theme per section (data-theme), current link, hide on scroll down */
  const nav = $('[data-nav]');
  const navLinks = $$('[data-nav-links] a');
  const themed = $$('[data-theme]');
  function navTheme() {
    if (!nav) return;
    const y = nav.getBoundingClientRect().height / 2;
    let cur = null;
    for (const s of themed) { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) cur = s; }   // last match = deepest
    nav.classList.toggle('nav--onyx', !!cur && cur.dataset.theme === 'light');
    // past the hero the nav takes the surface under it as its ground (96%), with a rule beneath
    const overHero = !cur || cur.classList.contains('hero');
    const surf = overHero ? '' : cur.classList.contains('surface-linen') ? 'linen' : cur.tagName === 'FOOTER' ? 'onyx' : cur.dataset.theme === 'dark' ? 'roast' : 'parchment';
    nav.classList.toggle('nav--ground', !overHero);
    ['parchment', 'linen', 'roast', 'onyx'].forEach(k => nav.classList.toggle('nav--s-' + k, surf === k));
    const id = cur && cur.id;
    navLinks.forEach(a => { const on = id && a.getAttribute('href') === '#' + id; if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  let lastY = 0;
  function navHide() {
    if (!nav) return;
    const y = window.scrollY;
    nav.classList.toggle('nav--hide', y > lastY + 4 && y > 200 && !document.body.classList.contains('menu-open'));
    if (Math.abs(y - lastY) > 4) lastY = y;
  }
  window.addEventListener('scroll', () => { navTheme(); navHide(); }, { passive: true });
  navTheme();

  /* §3 — entrances: IntersectionObserver adds .is-in (also the safety net for anything still in its pre-state) */
  $$('[data-delay]').forEach(el => { const v = parseFloat(el.dataset.delay); if (!isNaN(v)) el.style.setProperty('--d', v + 's'); });
  const revealables = $$('[data-reveal],[data-img],[data-rule],.hero');
  if (MOTION && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      for (const en of entries) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
    revealables.forEach(el => io.observe(el));
    // stalled-frame guard: anything ≥50% visible for 1.2s that is still in its pre-state
    const guard = new IntersectionObserver(entries => {
      for (const en of entries) {
        if (en.intersectionRatio >= 0.5 && !en.target.classList.contains('is-in')) {
          setTimeout(() => { if (!en.target.classList.contains('is-in')) en.target.classList.add('is-in'); }, 1200);
        }
      }
    }, { threshold: [0.5] });
    revealables.forEach(el => guard.observe(el));
  } else {
    revealables.forEach(el => el.classList.add('is-in'));
  }
  // hero: settle on load (fonts ready), never later than 900ms
  const hero = $('.hero');
  if (hero) {
    const go = () => hero.classList.add('is-in');
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(go, 80));
    setTimeout(go, 900);
  }

  /* §4 — smooth scroll (Lenis) + ScrollTrigger proxy */
  let lenis = null;
  if (MOTION && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(t => lenis.raf(t * 1000));
      window.gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    html.classList.add('lenis');
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const t = $(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault(); setMenu(false); lenis.scrollTo(t, { offset: 0, duration: 1.2 });
    }));
  }

  /* §5–§7 — the scrubs (html.motion only). CSS owns scale/clip-path/opacity on every revealed element. GSAP 3.12.3+ folds an
     element's individual `scale` into its own transform (and sets it to none), so on a CSS-scaled img GSAP tweens the CSS
     `translate` property instead of x/y — it composes with `scale` and never touches `transform`. GSAP owns scale only
     where CSS has no pre-state (the band photographs, the gallery plates). */
  if (MOTION && hasGsap) {
    const gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });
    const refresh = () => ST.refresh();
    const scrub = (trigger, more) => Object.assign({ trigger, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }, more);
    const visImg = band => $$('.band__pic img', band).find(i => getComputedStyle(i).display !== 'none') || null;

    gsap.matchMedia().add({ desk: '(min-width:1024px)', mob: '(max-width:1023px)' }, ctx => {
      /* §5 — hero: on scroll out the photo rises 60px and the deep layer comes to .45, scrubbed over the hero's own height */
      if (hero) {
        gsap.timeline({ scrollTrigger: scrub(hero, { start: 'top top' }) })
          .fromTo(visImg(hero), { translate: '0px 0px' }, { translate: '0px -60px', ease: 'none' }, 0)
          .to($('.band__deep', hero), { opacity: .45, ease: 'none' }, 0);
      }
      // the other bands: the photo 1→1.08 across the band's scroll, the deep layer 0→.3 over its last 40%
      $$('[data-band]').filter(b => b !== hero).forEach(band => {
        const img = visImg(band), deep = $('.band__deep', band);
        if (!img) return;
        const tl = gsap.timeline({ scrollTrigger: scrub(band) });
        tl.fromTo(img, { scale: 1 }, { scale: 1.08, ease: 'none', duration: 1 }, 0);
        deep && tl.fromTo(deep, { opacity: 0 }, { opacity: .3, ease: 'none', duration: .4 }, .6);
      });

      /* §6 — photographs: the img drifts +N→−N across the figure's visibility; the .ph__box clips (motion.css oversizes the img by 2N).
         A sticky figure (#next at ≥1024) rides its section, so the drift only runs while a visible edge moves. */
      $$('[data-parallax]').forEach(fig => {
        const img = $('.ph__box img', fig);
        if (!img || fig.closest('[data-pin]')) return;
        const n = parseFloat(fig.dataset.parallax) || 30;
        fig.style.setProperty('--px', n + 'px');
        const trig = getComputedStyle(fig).position === 'sticky' ? (fig.closest('section') || fig) : fig;
        gsap.fromTo(img, { translate: '0px ' + n + 'px' }, { translate: '0px ' + -n + 'px', ease: 'none', scrollTrigger: scrub(trig) });
      });

      /* §7 — the record gallery, ≥1024 only (below, the plates are a column and the CSS entrances run) */
      const gal = $('#record .gallery[data-pin]');
      if (ctx.conditions.desk && gal) gallery(gal);

      // footer: rises 12% of its height as it enters (scrub, once)
      const foot = $('.footer');
      foot && gsap.fromTo(foot, { yPercent: 12 }, { yPercent: 0, ease: 'none', scrollTrigger: scrub(foot, { end: 'top 60%', once: true }) });
    });

    function gallery(gal) {
      const track = $('.gallery__track', gal), plates = $$('.gallery__plate', gal);
      const num = $('.gallery__num', gal), cap = $('.gallery__cap', gal);
      if (!track || !plates.length) return;
      const gutter = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gutter')) || 96;
      const last = plates[plates.length - 1];
      // the pin runs until the last plate sits centred in the viewport (the strip ends on the sisters, not on two halves)
      const dist = () => Math.max(0, track.offsetWidth - window.innerWidth + (window.innerWidth / 2 - last.offsetWidth / 2 - gutter()));
      // the scroll distance lives in a spacer's height (not in pin-spacer padding), so the page's spacing alphabet stays clean
      let space = gal.nextElementSibling;
      if (!space || !space.classList.contains('gallery__space')) { space = document.createElement('div'); space.className = 'gallery__space'; space.setAttribute('aria-hidden', 'true'); gal.after(space); }
      const setSpace = () => { space.style.height = dist() + 'px'; };
      setSpace(); ST.addEventListener('refreshInit', setSpace);
      // pin the strip and move the track 1:1 with the scroll
      const move = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: {
        trigger: gal, pin: true, pinSpacing: false, start: 'top top', end: () => '+=' + dist(), scrub: 1, anticipatePin: 1, invalidateOnRefresh: true } });
      // the counter: two stacked spans inside a clip (motion.css); the old numeral leaves the way the new one arrives
      let a = null, b = null, cur = 1;
      if (num) { const t = num.textContent.trim(); num.textContent = ''; a = document.createElement('span'); b = a.cloneNode(); a.textContent = t; num.append(a, b); }
      function flip(i, dir) {
        i = Math.min(Math.max(i, 1), plates.length);
        if (i === cur) return;
        cur = i;
        const p = plates[i - 1];
        if (a) {
          b.textContent = String(i).padStart(2, '0');
          gsap.killTweensOf([a, b]);
          gsap.fromTo(b, { yPercent: 100 * dir }, { yPercent: 0, duration: .4, ease: 'power3.inOut' });
          gsap.to(a, { yPercent: -100 * dir, duration: .4, ease: 'power3.inOut' });
          [a, b] = [b, a];
        }
        if (cap) {   // the plate's caption line (text only), plus plate 4's sold-out line as its second span
          const fc = $('figcaption', p);
          cap.textContent = p.dataset.cap || (fc && fc.firstChild ? fc.firstChild.textContent.trim() : '');
          gsap.fromTo(cap, { y: 8 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: .4, ease: 'power2.out', overwrite: true });
        }
      }
      plates.forEach((p, i) => {
        const img = $('img', p), n = i + 1;
        // (a) the photograph drifts +40→−40 against the track (a second speed inside the shelf); .is-in from here if the IO misses
        gsap.fromTo(img, { translate: '40px 0px' }, { translate: '-40px 0px', ease: 'none', scrollTrigger: {
          trigger: p, containerAnimation: move, start: 'left right', end: 'right left', scrub: true, invalidateOnRefresh: true,
          onEnter: () => p.classList.add('is-in') } });
        // (b) the plate settles 1.06→1 on its own baseline as it enters (the img's scale belongs to CSS; the plate has none)
        gsap.fromTo(p, { scale: 1.06, transformOrigin: '50% 100%' }, { scale: 1, ease: 'none', scrollTrigger: {
          trigger: p, containerAnimation: move, start: 'left right', end: 'left 60%', scrub: true, invalidateOnRefresh: true } });
        // (c) plate n takes the counter when the gap before it crosses the viewport's centre line (the last plate's own
        //     centre never reaches it: the strip ends flush at the gutter), and hands it back when the gap recrosses
        // (c) plate n takes the counter once ≥60% of it is on screen (65% here, so plate 2 — already 60% in at the pin's
        //     first frame — still hands 01 a moment) and gives it back on the way up
        ST.create({ trigger: p, containerAnimation: move, start: () => 'left ' + Math.round(window.innerWidth - .65 * p.offsetWidth), end: 'right left',
          invalidateOnRefresh: true, onEnter: () => flip(n, 1), onLeaveBack: () => flip(n - 1, -1) });
      });
      // the strip's photographs load a screen early so no plate is ever empty inside the pin
      ST.create({ trigger: gal, start: 'top 200%', once: true, onEnter: () => $$('img', track).forEach(im => { im.loading = 'eager'; }) });
    }

    // measure again once fonts and the strip's photographs have settled
    window.addEventListener('load', refresh);
    document.fonts && document.fonts.ready.then(refresh);
    $$('[data-pin] img').forEach(im => { if (!im.complete) im.addEventListener('load', refresh, { once: true }); });
  }

  /* §8 — marquee: clone once for the loop */
  $$('[data-marquee] .marquee__track').forEach(track => {
    if (track.dataset.cloned) return;
    const copy = track.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    [...copy.children].forEach(c => { c.setAttribute('aria-hidden', 'true'); track.appendChild(c); });
    track.dataset.cloned = '1';
    // pace: the half-track travels at ≤85px/s at every width (a colophon, not a ticker)
    const pace = () => { track.style.animationDuration = Math.max(27, track.scrollWidth / 2 / 85).toFixed(1) + 's'; };
    pace(); window.addEventListener('resize', pace, { passive: true });
  });

  /* §9 — FAQ: animate grid-template-rows 0fr→1fr, no jump; native <details> stays keyboard-native */
  $$('details.faq__item').forEach(d => {
    const q = $('summary', d), body = $('.faq__body', d);
    if (!q || !body) return;
    q.addEventListener('click', e => {
      e.preventDefault();
      if (d.open) {
        d.classList.remove('is-open');
        const done = () => { d.open = false; body.removeEventListener('transitionend', done); };
        body.addEventListener('transitionend', done);
        setTimeout(() => { if (!d.classList.contains('is-open')) d.open = false; }, 500);
      } else {
        d.open = true;
        requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('is-open')));
      }
    });
  });

  /* §10 — failsafe off once everything is armed */
  if (window.__motionFailsafe) { clearTimeout(window.__motionFailsafe); }
})();
