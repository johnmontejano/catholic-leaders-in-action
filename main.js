/* Catholic Leaders in Action — main.js (the Exo Ape system, 2026-09-03)
   CSS owns every entrance (.is-in) and every timed transition (one easing token). GSAP + ScrollTrigger own the scrubs:
   the sheets pinning under the next one, the reel opening between two words, the record's plates drifting at their own rates. */
(function () {
  'use strict';
  const html = document.documentElement;
  const MOTION = html.classList.contains('motion');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* §1 — menu (Esc closes, focus trapped, scroll locked) */
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

  /* §2 — nav: ink over a light sheet, white over ink; collapses to the mark + Menu on the first tick */
  const nav = $('[data-nav]');
  const navLinks = $$('[data-nav-links] a');
  const themed = $$('[data-theme]');
  function navState() {
    if (!nav) return;
    const x = parseFloat(getComputedStyle(html).getPropertyValue('--pad')) + 10, y = 40;
    let cur = null;
    for (const s of themed) { const r = s.getBoundingClientRect(); if (r.left <= x && r.right > x && r.top <= y && r.bottom > y) cur = s; }   // last in DOM order = the sheet on top
    nav.classList.toggle('nav--ink', !!cur && cur.dataset.theme === 'light');
    nav.classList.toggle('nav--tight', window.scrollY > 8);
    const id = cur && cur.id;
    navLinks.forEach(a => { const on = id && a.getAttribute('href') === '#' + id; if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', navState, { passive: true });
  window.addEventListener('resize', navState, { passive: true });
  navState();

  /* §3 — entrances: IntersectionObserver adds .is-in (the pre-states exist only under html.motion) */
  const revealables = $$('[data-reveal],[data-plate],[data-rule],.hero');
  if (MOTION && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      for (const en of entries) if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    revealables.forEach(el => io.observe(el));
    const guard = new IntersectionObserver(entries => {   // stalled-frame guard: anything half visible for 1.2s is shown
      for (const en of entries) if (en.intersectionRatio >= 0.5 && !en.target.classList.contains('is-in')) {
        setTimeout(() => { if (!en.target.classList.contains('is-in')) en.target.classList.add('is-in'); }, 1200);
      }
    }, { threshold: [0.5] });
    revealables.forEach(el => guard.observe(el));
  } else {
    revealables.forEach(el => el.classList.add('is-in'));
  }
  const hero = $('.hero');
  if (hero) {
    const go = () => { hero.classList.add('is-in'); $$('[data-reveal]', hero).forEach(el => el.classList.add('is-in')); };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(go, 80));
    setTimeout(go, 900);
  }

  /* §4 — smooth scroll (Lenis) feeding ScrollTrigger */
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

  /* §5–§7 — the scrubs (html.motion only) */
  if (MOTION && hasGsap) {
    const gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true });

    /* §5 — the sheets pin themselves in CSS (a sticky stage inside a 200vh + dwell section, the next sheet pulled up
       by 100vh so it rises over the held one). Nothing to do here; the scrubs below only animate INSIDE a held sheet. */
    const dwellOf = el => parseFloat(getComputedStyle(el).getPropertyValue('--dwell')) || 500;

    /* §5a — the hero: the display line is cropped by the fold at rest and rises through the first part of the dwell.
       Its rest position is calc(100vh - 186px), which puts the fold in the leading above "beyond" — only the ascender
       tips show — and it finishes with the block 40px from the top. The paragraph keeps the right column throughout. */
    const heroTitle = $('[data-hero-title]'), heroSay = $('[data-hero-say]');
    if (hero && heroTitle) {
      gsap.matchMedia().add('(min-width:1024px)', () => {
        const travel = () => Math.max(0, window.innerHeight - 226);
        const t = gsap.fromTo(heroTitle, { y: 0 }, {
          y: () => -travel(), ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: () => '+=' + travel(), scrub: true, invalidateOnRefresh: true },
        });
        const t2 = heroSay && gsap.fromTo(heroSay, { y: 0 }, {
          y: () => Math.round(travel() * 0.18), ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: () => '+=' + travel(), scrub: true, invalidateOnRefresh: true },
        });
        return () => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); if (t2) { t2.scrollTrigger && t2.scrollTrigger.kill(); t2.kill(); } };
      });
    }

    /* §6 — the reel: two words far apart and a small window between them; over the sheet's dwell the window opens to
       the whole viewport and the words close until they read as one phrase. The plate stays dark the whole way, which
       is what keeps the serif legible at full size. */
    const reel = $('[data-reel]'), win = $('[data-reel-win]'), wA = $('[data-reel-a]'), wB = $('[data-reel-b]');
    if (reel && win && wA && wB) {
      const words = wA.parentElement;
      const pad = () => parseFloat(getComputedStyle(html).getPropertyValue('--pad'));
      const small = () => window.innerWidth < 1024;
      const startA = () => pad() - (words.getBoundingClientRect().left + wA.offsetLeft);
      const startB = () => (window.innerWidth - pad() - wB.offsetWidth) - (words.getBoundingClientRect().left + wB.offsetLeft);
      const clip0 = () => {
        const w = small() ? 206 : 600, h = small() ? 115 : 340, r = win.getBoundingClientRect();
        const ix = Math.max(0, (r.width - w) / 2), iy = Math.max(0, (r.height - h) / 2);
        return `inset(${iy.toFixed(1)}px ${ix.toFixed(1)}px)`;
      };
      const tl = gsap.timeline({ scrollTrigger: { trigger: reel.closest('[data-sheet]') || reel, start: 'top top', end: () => '+=' + dwellOf(reel.closest('[data-sheet]') || reel), scrub: true, invalidateOnRefresh: true } });
      tl.fromTo(win, { clipPath: clip0 }, { clipPath: 'inset(0px 0px)', ease: 'none' }, 0)
        .fromTo(wA, { x: startA }, { x: 0, ease: 'none' }, 0)
        .fromTo(wB, { x: startB }, { x: 0, ease: 'none' }, 0);
    }

    /* §7 — the record's plates: each drifts at its own rate through the field sheet's dwell, so the module is read as
       one system being broken rather than as five unrelated placements. ≥1024 only. */
    gsap.matchMedia().add('(min-width:1024px)', () => {
      const field = $('[data-field]');
      if (!field) return;
      const sheet = field.closest('[data-sheet]') || field;
      const tws = $$('[data-drift]', field).map(p => {
        const v = parseFloat(p.dataset.drift) || 0;
        return gsap.fromTo(p, { y: v }, { y: -v, ease: 'none', scrollTrigger: { trigger: sheet, start: 'top top', end: '+=' + dwellOf(sheet), scrub: true, invalidateOnRefresh: true } });
      });
      return () => tws.forEach(t => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); });
    });

    const refresh = () => ST.refresh();
    window.addEventListener('load', refresh);
    document.fonts && document.fonts.ready.then(refresh);
  }

  /* §8 — FAQ: animate grid-template-rows 0fr→1fr; native <details> stays keyboard-native */
  $$('details.faq__item').forEach(d => {
    const q = $('summary', d), body = $('.faq__body', d);
    if (!q || !body) return;
    q.addEventListener('click', e => {
      e.preventDefault();
      if (d.open) {
        d.classList.remove('is-open');
        const done = () => { d.open = false; body.removeEventListener('transitionend', done); };
        body.addEventListener('transitionend', done);
        setTimeout(() => { if (!d.classList.contains('is-open')) d.open = false; }, 700);
      } else {
        d.open = true;
        requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('is-open')));
      }
    });
  });

  /* §9 — failsafe off once everything is armed */
  if (window.__motionFailsafe) { clearTimeout(window.__motionFailsafe); }
})();
