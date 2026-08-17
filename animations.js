// ─────────────────────────────────────────────────────────────────────────────
// Animation & effects engine for Our Little Universe
// ─────────────────────────────────────────────────────────────────────────────
window.UniverseFX = (() => {
  'use strict';

  const COLORS = ['#ff9ab5', '#f5cc83', '#bba8ff', '#fff9f3'];
  const SYMBOLS = ['♡', '✦', '✨', '💫', '🌸'];

  function prefersReducedMotion() {
    return matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function tenorEmbed(id) {
    return `https://tenor.com/embed/${id}`;
  }

  function makeGifFrame(id, label, extraClass = '') {
    const frame = document.createElement('div');
    frame.className = `gif-frame ${extraClass}`.trim();
    frame.innerHTML = `<iframe src="${tenorEmbed(id)}" title="${label}" frameborder="0" loading="lazy"></iframe>`;
    return frame;
  }

  // ── Particles ──────────────────────────────────────────────────────────────

  function burst(originX = innerWidth / 2, originY = innerHeight / 2, count = 50) {
    for (let i = 0; i < count; i++) {
      const p = document.createElement('i');
      p.className = 'burst-particle';
      p.style.left = `${originX}px`;
      p.style.top = `${originY}px`;
      p.style.color = COLORS[i % COLORS.length];
      p.textContent = SYMBOLS[i % SYMBOLS.length];
      document.body.append(p);

      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const dist = 80 + Math.random() * Math.min(innerWidth, innerHeight) * 0.4;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;

      p.animate(
        [
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${x}px,${y}px) rotate(${Math.random() * 720}deg) scale(0)`, opacity: 0 }
        ],
        { duration: 900 + Math.random() * 700, easing: 'cubic-bezier(0.15, 0.85, 0.25, 1)' }
      );
      setTimeout(() => p.remove(), 1700);
    }
  }

  function confetti(count = 80) {
    if (prefersReducedMotion()) return;
    for (let i = 0; i < count; i++) {
      const c = document.createElement('i');
      c.className = 'confetti-piece';
      c.style.left = `${Math.random() * 100}vw`;
      c.style.top = '-20px';
      c.style.background = COLORS[i % COLORS.length];
      c.style.animationDuration = `${2 + Math.random() * 2}s`;
      c.style.animationDelay = `${Math.random() * 0.8}s`;
      document.body.append(c);
      setTimeout(() => c.remove(), 4500);
    }
  }

  function heartRain(duration = 4000) {
    if (prefersReducedMotion()) return;
    const interval = setInterval(() => {
      const h = document.createElement('span');
      h.className = 'heart-rain';
      h.textContent = Math.random() > 0.5 ? '♡' : '💕';
      h.style.left = `${Math.random() * 100}vw`;
      h.style.animationDuration = `${2.5 + Math.random() * 2}s`;
      document.body.append(h);
      setTimeout(() => h.remove(), 5000);
    }, 180);
    setTimeout(() => clearInterval(interval), duration);
  }

  function shootingStar(container) {
    if (prefersReducedMotion() || !container) return;
    const star = document.createElement('i');
    star.className = 'shooting-star';
    star.style.left = `${40 + Math.random() * 55}%`;
    star.style.top = `${Math.random() * 40}%`;
    container.append(star);
    setTimeout(() => star.remove(), 2400);
  }

  // ── GIF systems ────────────────────────────────────────────────────────────

  function mountGif(host, gif, extraClass = '') {
    if (!host || !gif?.id) return;
    host.appendChild(makeGifFrame(gif.id, gif.label, extraClass));
  }

  function buildMarquee(container, gifs, speed = 38) {
    if (!container || !gifs?.length) return;
    const track = document.createElement('div');
    track.className = 'gif-marquee-track';
    track.style.setProperty('--marquee-speed', `${speed}s`);

    const items = [...gifs, ...gifs];
    items.forEach((gif, i) => {
      const item = document.createElement('div');
      item.className = 'gif-marquee-item';
      item.appendChild(makeGifFrame(gif.id, gif.label, 'marquee-frame'));
      const cap = document.createElement('span');
      cap.className = 'gif-marquee-label';
      cap.textContent = gif.label;
      item.append(cap);
      track.append(item);
    });

    container.append(track);
  }

  function spawnAmbientGifs(container, gifs) {
    if (!container || prefersReducedMotion() || !gifs?.length) return;
    gifs.forEach((gif, i) => {
      const el = document.createElement('div');
      el.className = 'ambient-gif';
      el.style.left = `${5 + (i * 17) % 85}%`;
      el.style.top = `${10 + (i * 19) % 75}%`;
      el.style.animationDelay = `${i * 2.1}s`;
      el.style.animationDuration = `${16 + i * 2}s`;
      el.appendChild(makeGifFrame(gif.id, gif.label, 'ambient-frame'));
      container.append(el);
    });
  }

  function buildGifWall(container, gifs) {
    if (!container) return;
    gifs.forEach((gif, i) => {
      const tile = document.createElement('button');
      tile.className = 'gif-wall-tile reveal';
      tile.style.transitionDelay = `${(i % 6) * 0.06}s`;
      tile.innerHTML = `
        ${makeGifFrame(gif.id, gif.label, 'wall-frame').outerHTML}
        <span>${gif.label}</span>
      `;
      tile.addEventListener('click', () => {
        tile.classList.add('pop');
        burst(
          tile.getBoundingClientRect().left + tile.offsetWidth / 2,
          tile.getBoundingClientRect().top + tile.offsetHeight / 2,
          25
        );
        setTimeout(() => tile.classList.remove('pop'), 600);
      });
      container.append(tile);
    });
  }

  // ── Scroll & motion ────────────────────────────────────────────────────────

  function initScrollReveal(selector = '.reveal') {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('gif-pop')) {
          entry.target.classList.add('gif-pop-active');
        }
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

    els.forEach((el) => observer.observe(el));
  }

  function initParallax() {
    if (prefersReducedMotion()) return;
    const layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        layers.forEach((el) => {
          const speed = parseFloat(el.dataset.parallax) || 0.15;
          const rect = el.getBoundingClientRect();
          const offset = (rect.top + rect.height / 2 - innerHeight / 2) * speed;
          el.style.transform = `translateY(${offset}px)`;
        });
        ticking = false;
      });
    }, { passive: true });
  }

  function initGifFloat() {
    if (prefersReducedMotion()) return;
    document.querySelectorAll('.gif-float').forEach((el) => {
      const range = parseFloat(el.dataset.floatRange) || 12;
      const dur = parseFloat(el.dataset.floatDur) || 4;
      el.animate(
        [
          { transform: 'translateY(0) rotate(0deg)' },
          { transform: `translateY(-${range}px) rotate(${range > 8 ? 3 : 1}deg)` },
          { transform: 'translateY(0) rotate(0deg)' }
        ],
        { duration: dur * 1000, iterations: Infinity, easing: 'ease-in-out' }
      );
    });
  }

  function initCursorSparkle() {
    if (prefersReducedMotion() || 'ontouchstart' in window) return;
    let last = 0;
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - last < 60) return;
      last = now;
      if (Math.random() > 0.65) return;

      const s = document.createElement('span');
      s.className = 'cursor-sparkle';
      s.textContent = Math.random() > 0.6 ? '✦' : '♡';
      s.style.left = `${e.clientX}px`;
      s.style.top = `${e.clientY}px`;
      document.body.append(s);
      setTimeout(() => s.remove(), 800);
    });
  }

  function initSectionGlow() {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('section-active', entry.isIntersecting);
      });
    }, { threshold: 0.25 });
    sections.forEach((s) => observer.observe(s));
  }

  function pulseElement(el) {
    if (!el) return;
    el.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }],
      { duration: 450, easing: 'ease-out' }
    );
  }

  function screenTransition(fromEl, toEl, onMid) {
    fromEl.classList.add('screen-exit');
    setTimeout(() => {
      fromEl.classList.add('hidden');
      fromEl.classList.remove('screen-exit');
      toEl.classList.remove('hidden');
      toEl.classList.add('screen-enter');
      onMid?.();
      setTimeout(() => toEl.classList.remove('screen-enter'), 700);
    }, 450);
  }

  // ── Floating Hearts (persistent ambient) ──────────────────────────────────

  function spawnFloatingHearts(container, count = 15) {
    if (prefersReducedMotion() || !container) return;
    const hearts = ['♡', '❤', '💕', '✦', '♥'];
    for (let i = 0; i < count; i++) {
      const h = document.createElement('span');
      h.className = 'fh-heart';
      h.textContent = hearts[i % hearts.length];
      h.style.left = `${Math.random() * 100}%`;
      h.style.fontSize = `${10 + Math.random() * 14}px`;
      h.style.animationDuration = `${8 + Math.random() * 12}s`;
      h.style.animationDelay = `${Math.random() * 10}s`;
      h.style.color = COLORS[i % COLORS.length];
      container.appendChild(h);
    }
  }

  // ── Twinkling Stars ───────────────────────────────────────────────────────

  function spawnTwinkleStars(container, count = 50) {
    if (prefersReducedMotion() || !container) return;
    const classes = ['', 'gold', 'pink', 'lav'];
    for (let i = 0; i < count; i++) {
      const star = document.createElement('span');
      const cls = classes[Math.floor(Math.random() * classes.length)];
      star.className = `twinkle-star${cls ? ' ' + cls : ''}${Math.random() > 0.85 ? ' large' : ''}`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty('--twinkle-dur', `${2 + Math.random() * 4}s`);
      star.style.setProperty('--twinkle-delay', `${Math.random() * 5}s`);
      container.appendChild(star);
    }
  }

  // ── Enhanced Scroll Reveal (cinematic variants) ───────────────────────────

  function initCinematicReveal() {
    const variants = document.querySelectorAll('.reveal-left, .reveal-right, .reveal-scale');
    if (!variants.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    variants.forEach((el) => observer.observe(el));
  }

  // ── 3D Tilt Effect ────────────────────────────────────────────────────────

  function init3DTilt(selector = '.tilt-3d') {
    if (prefersReducedMotion() || 'ontouchstart' in window) return;
    document.querySelectorAll(selector).forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.03)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)';
      });
    });
  }

  return {
    burst,
    confetti,
    heartRain,
    shootingStar,
    mountGif,
    makeGifFrame,
    buildMarquee,
    spawnAmbientGifs,
    buildGifWall,
    initScrollReveal,
    initParallax,
    initGifFloat,
    initCursorSparkle,
    initSectionGlow,
    pulseElement,
    screenTransition,
    prefersReducedMotion,
    spawnFloatingHearts,
    spawnTwinkleStars,
    initCinematicReveal,
    init3DTilt
  };
})();
