(() => {
  'use strict';

  const config = window.UNIVERSE_CONFIG;
  const FX = window.UniverseFX;
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  const SECRET_COUNT = 5;

  const state = {
    secrets: new Set(JSON.parse(localStorage.getItem('universe-secrets') || '[]')),
    reasonsOpened: 0,
    lightboxIndex: 0,
    loveBurstIndex: 0,
    typeTimer: null,
    photos: [],
    albumPhotos: [],
    giftOpened: new Set()
  };

  const PHOTO_DEFAULTS = [
    { caption: 'Ek aur pyaara pal', sub: 'Yaadon ki album se', cat: 'moments' },
    { caption: 'Meri favourite tasveer', sub: 'Dil ne khud click kar li', cat: 'moments' },
    { caption: 'Tum ho toh sab special', sub: 'Chhoti memory, badi feeling', cat: 'moments' },
    { caption: 'Smile pakad li', sub: 'Forever ke liye save', cat: 'booba' },
    { caption: 'Hum dono ka moment', sub: 'SIDWANI vibes only', cat: 'us' },
    { caption: 'Desi dil, desi look', sub: 'Traditional & gorgeous', cat: 'desi' },
    { caption: 'Party mode on hai', sub: 'Celebrate karte raho', cat: 'celebration' },
    { caption: 'Candid & cute', sub: 'Filter ki zaroorat nahi', cat: 'booba' },
    { caption: 'Saath ka sukoon', sub: 'Bas tum chahiye', cat: 'us' },
    { caption: 'Roshni wali photo', sub: 'Meri duniya yahan hai', cat: 'moments' }
  ];
  const PHOTO_CATS = ['moments', 'booba', 'us', 'desi', 'celebration'];

  function buildPhotoCatalog() {
    const used = new Set([...config.memoryPhotoIds, ...config.polaroidPhotoIds]);
    state.photos = config.photoFiles.map((id, i) => {
      const meta = config.photoMeta[id];
      if (meta) return { id, image: `assets/photos/website/${id}.jpg`, ...meta };
      const fallback = PHOTO_DEFAULTS[i % PHOTO_DEFAULTS.length];
      return {
        id,
        image: `assets/photos/website/${id}.jpg`,
        caption: fallback.caption,
        sub: fallback.sub,
        cat: PHOTO_CATS[i % PHOTO_CATS.length]
      };
    });
    state.albumPhotos = state.photos.filter((p) => !used.has(p.id));
  }

  function photoById(id) {
    return state.photos.find((p) => p.id === id);
  }

  function albumIndexForPhotoId(id) {
    const idx = state.photos.findIndex((p) => p.id === id);
    return idx >= 0 ? idx : 0;
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  function calcAge(birthday) {
    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const birthdayThisYear = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (today < birthdayThisYear) age--;
    return age;
  }

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3600);
  }

  function burst(x, y, count) {
    FX.burst(x, y, count);
  }

  // ── Love meter & secrets ───────────────────────────────────────────────────

  function updateLoveMeter() {
    const pct = (state.secrets.size / SECRET_COUNT) * 100;
    const fill = $('#love-meter-fill');
    const text = $('#love-meter-text');
    if (fill) fill.style.width = `${pct}%`;
    if (text) {
      text.textContent = state.secrets.size === SECRET_COUNT
        ? 'Universe unlock ho gaya ♡'
        : `${state.secrets.size} mein se ${SECRET_COUNT} secrets mile`;
    }
  }

  function unlockSecret(index) {
    if (state.secrets.has(index)) {
      toast(config.secrets[index]);
      return;
    }
    state.secrets.add(index);
    localStorage.setItem('universe-secrets', JSON.stringify([...state.secrets]));
    $('#secret-count').textContent = `${state.secrets.size} mein se ${SECRET_COUNT} secrets mile`;
    updateLoveMeter();
    toast(config.secrets[index]);
    FX.pulseElement($('#memory-heart'));
    if (state.secrets.size === SECRET_COUNT) {
      burst(undefined, undefined, 70);
      FX.confetti(100);
      FX.heartRain(5000);
    }
  }

  // ── GIF mounting ───────────────────────────────────────────────────────────

  function mountAllGifs() {
    const { gifs } = config;
    const map = {
      '#landing-gif': gifs.landing,
      '#gif-hero': gifs.hero,
      '#gif-hero-alt': gifs.heroAlt,
      '#gif-story': gifs.story,
      '#gif-memories': gifs.memories,
      '#gif-memories-alt': gifs.memoriesAlt,
      '#gif-reasons': gifs.reasons,
      '#gif-secret': gifs.secret,
      '#gif-secret-alt': gifs.secretAlt,
      '#gif-letter': gifs.letter,
      '#gif-cake': gifs.cake,
      '#gif-promises': gifs.promises,
      '#gif-final': gifs.final,
      '#gif-final-alt': gifs.finalAlt,
      '#gif-final-extra': gifs.finalExtra,
      '#gif-flying': gifs.flying,
      '#gif-flying-alt': gifs.flyingAlt
    };
    Object.entries(map).forEach(([sel, gif]) => FX.mountGif($(sel), gif));
  }

  function initGifSystems() {
    FX.buildMarquee($('#gif-parade'), config.gifMarquee, 42);
    FX.buildGifWall($('#gif-wall'), config.gifWall);
  }

  function showAmbientLayer() {
    const layer = $('#ambient-gifs');
    layer?.classList.remove('hidden');
    FX.spawnAmbientGifs(layer, config.ambientGifs);
  }

  // ── Dynamic content ────────────────────────────────────────────────────────

  function buildTimeline() {
    config.timeline.forEach((moment, i) => {
      const card = document.createElement('article');
      card.className = 'moment reveal';
      card.style.transitionDelay = `${i * 0.08}s`;
      card.innerHTML = `
        <small>${moment.date} · ${moment.emoji}</small>
        <h3>${moment.title}</h3>
        <p>${moment.text}</p>
      `;
      card.addEventListener('click', () => {
        card.classList.toggle('open');
        if (card.classList.contains('open')) burst(undefined, undefined, 15);
      });
      $('#timeline').append(card);
    });
  }

  function albumIndexForImage(src) {
    const idx = state.photos.findIndex((p) => p.image === src);
    return idx >= 0 ? idx : 0;
  }

  function buildGallery() {
    const tones = {
      pink: ['#e98ba6', '#b9769e'],
      purple: ['#8377c4', '#d59eb6'],
      gold: ['#dbad67', '#e47f99'],
      blue: ['#4e86ac', '#b09cda']
    };

    config.memoryPhotoIds.forEach((photoId, i) => {
      const photo = photoById(photoId);
      if (!photo) return;
      const tone = config.memoryTones[i] || 'pink';
      const [a, b] = tones[tone] || tones.pink;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'memory reveal';
      card.style.setProperty('--a', a);
      card.style.setProperty('--b', b);
      card.style.setProperty('--r', `${i % 2 ? 2.5 : -2.5}deg`);
      card.style.transitionDelay = `${i * 0.1}s`;
      card.innerHTML = `<img loading="lazy" src="${photo.image}" alt="${photo.caption}"><b>${photo.caption}</b>`;
      card.addEventListener('click', () => openLightbox(albumIndexForPhotoId(photoId)));
      $('#gallery').append(card);
    });
  }

  function buildOurPhotos() {
    const container = $('#our-photos');
    if (!container || !config.polaroidPhotoIds?.length) return;

    config.polaroidPhotoIds.forEach((photoId, i) => {
      const photo = photoById(photoId);
      if (!photo) return;
      const sub = config.polaroidSubs[i] || photo.sub;
      const polaroid = document.createElement('button');
      polaroid.type = 'button';
      polaroid.className = 'polaroid reveal';
      polaroid.style.transitionDelay = `${i * 0.15}s`;
      polaroid.style.setProperty('--r', `${i === 1 ? 0 : i === 0 ? -3 : 3}deg`);
      polaroid.innerHTML = `
        <img loading="lazy" src="${photo.image}" alt="${photo.caption}"/>
        <figcaption>
          <b>${photo.caption}</b>
          <small>${sub}</small>
        </figcaption>
      `;
      polaroid.addEventListener('click', () => {
        openLightbox(albumIndexForPhotoId(photoId));
        burst(undefined, undefined, 25);
      });
      container.append(polaroid);
    });
  }

  function buildPhotoFilters() {
    const container = $('#photo-filters');
    if (!container || !config.photoFilters?.length) return;

    config.photoFilters.forEach((filter) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `photo-filter${filter.id === 'all' ? ' active' : ''}`;
      chip.textContent = filter.label;
      chip.dataset.filter = filter.id;
      chip.addEventListener('click', () => {
        $$('.photo-filter').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        filterPhotoAlbum(filter.id);
      });
      container.append(chip);
    });
  }

  function filterPhotoAlbum(category) {
    $$('#photo-album .album-tile').forEach((tile) => {
      const show = category === 'all' || tile.dataset.cat === category;
      tile.classList.toggle('hidden', !show);
    });
  }

  function buildPhotoAlbum() {
    const container = $('#photo-album');
    if (!container || !state.albumPhotos.length) return;

    const intro = document.querySelector('.photo-album-intro');
    if (intro) {
      intro.textContent = `Hamari tasveerein — ${state.albumPhotos.length} alag-alag moments, ek bhi repeat nahi 📸`;
    }

    state.albumPhotos.forEach((photo, i) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'album-tile reveal';
      tile.dataset.cat = photo.cat;
      tile.style.transitionDelay = `${(i % 12) * 0.05}s`;
      tile.innerHTML = `
        <img loading="lazy" src="${photo.image}" alt="${photo.caption}"/>
        <span class="album-caption">
          <b>${photo.caption}</b>
          <small>${photo.sub || ''}</small>
        </span>
      `;
      tile.addEventListener('click', () => {
        openLightbox(albumIndexForPhotoId(photo.id));
        burst(undefined, undefined, 20);
      });
      container.append(tile);
    });
  }

  function buildGiftGuess() {
    const gg = config.giftGuess;
    if (!gg) return;

    $('#gift-guess-eyebrow').textContent = gg.eyebrow;
    $('#gift-guess-title').innerHTML = gg.title.replace('asli reel', '<em>asli reel</em>');
    $('#gift-guess-hint').textContent = gg.hint;
    $('#gift-guess-prompt').textContent = gg.pickPrompt;

    const shuffled = [...gg.boxes].sort(() => Math.random() - 0.5);
    const container = $('#gift-boxes');
    container.innerHTML = '';

    shuffled.forEach((box, i) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'gift-box reveal';
      el.dataset.boxId = box.id;
      el.style.transitionDelay = `${i * 0.12}s`;
      el.innerHTML = `
        <span class="gift-box-lid" aria-hidden="true"></span>
        <span class="gift-box-body">
          <span class="gift-box-emoji">${box.emoji}</span>
          <span class="gift-box-label">${box.label}</span>
          <span class="gift-box-cta">${gg.reelCta || 'Reel chalao →'}</span>
        </span>
      `;
      el.addEventListener('click', () => openGiftBox(box, el));
      container.append(el);
    });
  }

  function openGiftBox(box, el) {
    if (state.giftOpened.has(box.id)) return;

    state.giftOpened.add(box.id);
    el.classList.add('opened');
    el.disabled = true;

    const gg = config.giftGuess;
    const reveal = $('#gift-reveal');
    const video = $('#gift-video');
    const placeholder = $('#gift-video-placeholder');

    reveal.classList.remove('hidden');
    $('#gift-reveal-title').textContent = box.revealTitle;
    $('#gift-reveal-text').textContent = box.revealText;
    reveal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    if (box.video) {
      video.src = box.video;
      video.classList.remove('hidden');
      placeholder.classList.add('hidden');
      video.onerror = () => {
        video.classList.add('hidden');
        placeholder.classList.remove('hidden');
        placeholder.textContent = `${gg.videoPlaceholder || 'Reel add karo'}: ${box.video}`;
      };
      video.load();
    } else {
      video.classList.add('hidden');
      placeholder.classList.remove('hidden');
    }

    if (box.isReal) {
      toast(gg.rightPick);
      burst(undefined, undefined, 90);
      FX.confetti(120);
      FX.heartRain(5000);
      $('#gift-guess-status').textContent = gg.rightPick;
    } else {
      toast(gg.wrongPick);
      burst(undefined, undefined, 30);
      $('#gift-guess-status').textContent = gg.wrongPick;
    }

    if (state.giftOpened.size === gg.boxes.length) {
      setTimeout(() => {
        $('#gift-guess-status').textContent = gg.bothOpened;
        toast(gg.bothOpened);
        FX.confetti(80);
      }, 1200);
    }
  }

  function buildReasons() {
    config.reasons.forEach((reason, i) => {
      const card = document.createElement('button');
      card.className = 'reason reveal';
      card.style.transitionDelay = `${i * 0.07}s`;
      card.innerHTML = `<span class="number">0${i + 1}</span><p>${reason}</p>`;
      card.addEventListener('click', () => {
        if (card.classList.contains('open')) return;
        card.classList.add('open');
        state.reasonsOpened++;
        $('#reason-count').textContent = `${state.reasonsOpened} mein se ${config.reasons.length} reasons khul gayi`;
        burst(undefined, undefined, 20);
        if (state.reasonsOpened === config.reasons.length) {
          $('#forever').classList.remove('hidden');
          burst(undefined, undefined, 55);
          FX.heartRain(3000);
        }
      });
      $('#reason-grid').append(card);
    });
  }

  function buildBubuGrid() {
    config.bubuMoments.forEach((moment, i) => {
      const card = document.createElement('button');
      card.className = 'bubu-card reveal';
      card.style.transitionDelay = `${i * 0.1}s`;
      card.innerHTML = `
        <div class="bubu-card-gif">${FX.makeGifFrame(moment.id, moment.label).outerHTML}</div>
        <b>${moment.label}</b>
        <p>${moment.caption}</p>
      `;
      card.addEventListener('click', () => {
        card.classList.toggle('open');
        toast(moment.caption);
        if (!card.dataset.popped) {
          card.dataset.popped = '1';
          burst(undefined, undefined, 30);
        }
      });
      $('#bubu-grid').append(card);
    });
  }

  function buildPromises() {
    config.promises.forEach((promise, i) => {
      const item = document.createElement('div');
      item.className = 'promise-item reveal';
      item.style.transitionDelay = `${i * 0.12}s`;
      item.innerHTML = `<span class="promise-dot">♡</span><p>${promise}</p>`;
      $('#promise-list').append(item);
    });
  }

  function buildCandles() {
    [22, 42, 62, 82, 102].forEach((x, i) => {
      const candle = document.createElement('button');
      candle.className = 'candle';
      candle.style.left = `${x}%`;
      candle.style.top = `${i % 2 ? 45 : 34}px`;
      candle.setAttribute('aria-label', `Blow out candle ${i + 1}`);
      candle.addEventListener('click', () => {
        if (candle.classList.contains('out')) return;
        candle.classList.add('out');
        candle.disabled = true;
        burst(undefined, undefined, 12);
        if ($$('.candle.out').length === 5) {
          $('#wish-button').disabled = false;
          $('#cake-status').textContent = `Saari candles bujh gayi! Ab wish maang lo, ${config.nickname || config.herName} ✦`;
        }
      });
      $('#candles').append(candle);
    });
  }

  // ── Front page ─────────────────────────────────────────────────────────────

  function buildLandingTags() {
    config.frontPage.tags.forEach((tag, i) => {
      const chip = document.createElement('span');
      chip.className = 'landing-tag';
      chip.textContent = tag;
      chip.style.left = `${6 + (i * 14) % 82}%`;
      chip.style.top = `${8 + (i * 13) % 78}%`;
      chip.style.animationDelay = `${i * 0.9}s`;
      chip.style.animationDuration = `${12 + i * 1.5}s`;
      $('#landing-tags').append(chip);
    });
  }

  function populateFrontPage(age) {
    const { lock, lock2, landing, opening } = config.frontPage;
    $('#lock-eyebrow').textContent = lock.eyebrow;
    $('#lock-title-before').textContent = lock.titleBefore;
    $('#lock-hint').textContent = lock.hint;
    $('#lock-hint-small').textContent = lock.hintSmall || '';
    $('#lock-button').textContent = lock.button;
    $('#lock-nudge').textContent = lock.nudge;
    $('#lock-her-name').textContent = `${config.herName}.`;
    $('#passcode').placeholder = '• • • • • •';

    $('#lock2-eyebrow').textContent = lock2.eyebrow;
    $('#lock2-title').innerHTML = lock2.title;
    $('#lock2-hint').textContent = lock2.hint;
    $('#lock2-hint-small').textContent = lock2.hintSmall || '';
    $('#lock2-button').textContent = lock2.button;
    $('#lock2-nudge').textContent = lock2.nudge;
    $('#passcode-2').placeholder = lock2.placeholder;

    $('#landing-eyebrow').textContent = landing.eyebrow;
    $('#landing-title-before').textContent = landing.titleBefore;
    $('#landing-teaser').textContent = landing.teaser;
    $('#landing-button-text').textContent = landing.button;
    $('#landing-footnote').textContent = landing.footnote;
    $('#moon-label').textContent = landing.moonLabel;
    $('#opening-eyebrow').textContent = opening.eyebrow;
    $('#skip-opening').textContent = opening.skip;
    $('#her-name').textContent = config.herName;
    $('#subtitle').textContent = config.subtitle;
    $('#age-badge').textContent = landing.ageText.replace('{age}', age);
    config.openingLines = opening.lines;
  }

  function matchesLock2(value) {
    return value.trim().toLowerCase() === config.lock2Code.toLowerCase();
  }

  function bindLockScreen() {
    const passLen = config.passcode.length;

    $('#unlock-form').addEventListener('submit', (e) => {
      e.preventDefault();
      if ($('#passcode').value === config.passcode) {
        $('#lock-note').textContent = '';
        FX.screenTransition($('#lock'), $('#lock2'), () => {
          burst(undefined, undefined, 40);
          $$('#lock2 .reveal').forEach((el) => el.classList.add('visible'));
        });
      } else {
        $('#lock-note').textContent = config.frontPage.lock.wrongPass;
        $('#passcode').classList.add('shake');
        setTimeout(() => $('#passcode').classList.remove('shake'), 500);
      }
    });

    $('#passcode').addEventListener('input', (e) => {
      if (e.target.value.length === passLen && e.target.value === config.passcode) {
        $('#unlock-form').requestSubmit();
      }
    });

    $('#unlock-form-2').addEventListener('submit', (e) => {
      e.preventDefault();
      const guess = $('#passcode-2').value;
      if (matchesLock2(guess)) {
        $('#lock2-note').textContent = '';
        FX.screenTransition($('#lock2'), $('#landing'), () => burst(undefined, undefined, 50));
      } else {
        $('#lock2-note').textContent = config.frontPage.lock2.wrongPass;
        $('#passcode-2').classList.add('shake');
        setTimeout(() => $('#passcode-2').classList.remove('shake'), 500);
      }
    });

    $('#passcode-2').addEventListener('input', (e) => {
      if (matchesLock2(e.target.value)) {
        $('#unlock-form-2').requestSubmit();
      }
    });
  }

  function playOpening() {
    FX.screenTransition($('#landing'), $('#opening'));
    let line = 0;
    let char = 0;
    const typeNext = () => {
      const text = config.openingLines[line];
      $('#type-text').textContent = text.slice(0, char + 1);
      char++;
      if (char < text.length) {
        state.typeTimer = setTimeout(typeNext, 30);
      } else {
        state.typeTimer = setTimeout(() => {
          line++;
          char = 0;
          if (line < config.openingLines.length) typeNext();
          else finishOpening();
        }, 850);
      }
    };
    setTimeout(typeNext, 400);
  }

  function finishOpening() {
    clearTimeout(state.typeTimer);
    FX.screenTransition($('#opening'), $('#site'), () => {
      window.scrollTo(0, 0);
      burst(undefined, undefined, 60);
      FX.confetti(60);
      showAmbientLayer();
      FX.initScrollReveal();
      FX.initGifFloat();
    });
  }

  // ── Interactions ───────────────────────────────────────────────────────────

  function revealLetter() {
    $('#letter-card').classList.remove('hidden');
    $('#envelope').classList.add('opened');
    $('#envelope').setAttribute('aria-expanded', 'true');
    burst(undefined, undefined, 25);
    const text = config.letter;
    let i = 0;
    $('#letter-text').innerHTML = '<p></p>';
    const p = $('#letter-text p');
    const tick = () => {
      p.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, 10);
    };
    tick();
  }

  function openLightbox(index) {
    const album = state.photos;
    if (!album?.length) return;

    state.lightboxIndex = ((index % album.length) + album.length) % album.length;
    const photo = album[state.lightboxIndex];
    $('#lightbox-image').src = photo.image;
    $('#lightbox-image').alt = photo.caption;
    $('#lightbox-caption').innerHTML = photo.sub
      ? `<b>${photo.caption}</b><small>${photo.sub}</small>`
      : `<b>${photo.caption}</b>`;
    if (!$('#lightbox').open) $('#lightbox').showModal();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    $('#lightbox').close();
    document.body.style.overflow = '';
  }

  function sendKiss() {
    toast('Kiss pahunch gayi — million sparkles ke saath 💋');
    burst(undefined, undefined, 50);
    FX.heartRain(3500);
  }

  function spawnFloatingQuotes() {
    if (FX.prefersReducedMotion()) return;
    config.floatingQuotes.forEach((quote, i) => {
      const el = document.createElement('span');
      el.className = 'float-quote';
      el.textContent = quote;
      el.style.left = `${8 + (i * 15) % 80}%`;
      el.style.top = `${12 + (i * 17) % 70}%`;
      el.style.animationDelay = `${i * 1.4}s`;
      el.style.animationDuration = `${14 + i * 2}s`;
      $('#floating-quotes').append(el);
    });
  }

  function bindScrollProgress() {
    window.addEventListener('scroll', () => {
      const max = document.body.scrollHeight - innerHeight;
      $('.scroll-progress i').style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
    }, { passive: true });
  }

  function bindNavSpy() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        $$('.nav a').forEach((link) => {
          link.classList.toggle('active', link.dataset.nav === entry.target.dataset.section);
        });
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    $$('[data-section]').forEach((s) => observer.observe(s));
  }

  function bindMusic() {
    const audio = $('#audio');
    audio.src = config.music.src;
    audio.onerror = () => { $('#music-button').title = 'Add a local audio file in config.js'; };
    audio.addEventListener('play', () => $('#music-button').classList.add('playing'));
    audio.addEventListener('pause', () => $('#music-button').classList.remove('playing'));
    $('#music-button').addEventListener('click', () => {
      if (!config.music.src) { toast('Pehle config.js mein apna gaana add karo 🎵'); return; }
      audio.paused ? audio.play().catch(() => toast('Phir se tap karo music ke liye.')) : audio.pause();
    });
  }

  function bindEvents() {
    $('#start-story').addEventListener('click', () => {
      if (config.music.src) $('#audio').play().catch(() => {});
      playOpening();
    });
    $('#skip-opening').addEventListener('click', finishOpening);

    $('#secret-star').addEventListener('click', () => unlockSecret(0));
    $('#dont-click').addEventListener('click', () => unlockSecret(1));
    $('#memory-heart').addEventListener('click', () => unlockSecret(2));
    $('#moon').addEventListener('click', () => unlockSecret(4));
    $('#moon').addEventListener('keydown', (e) => { if (e.key === 'Enter') unlockSecret(4); });

    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'l' && !$('#lightbox').open) { unlockSecret(3); burst(); }
      if (e.key === 'Escape' && $('#lightbox').open) closeLightbox();
      if ($('#lightbox').open && e.key === 'ArrowLeft') openLightbox(state.lightboxIndex - 1);
      if ($('#lightbox').open && e.key === 'ArrowRight') openLightbox(state.lightboxIndex + 1);
    });

    $('#envelope').addEventListener('click', revealLetter);
    $('#read-again').addEventListener('click', revealLetter);

    $('#wish-button').addEventListener('click', () => {
      toast('Tumhari wish stars ke paas safe hai — pakka ♡');
      burst(undefined, undefined, 90);
      FX.confetti(120);
      FX.heartRain(5000);
      location.hash = 'gift-guess';
    });

    $('#gift').addEventListener('click', () => {
      $('#gift').classList.add('open');
      $('#gift').setAttribute('aria-expanded', 'true');
      $('#final-message').classList.remove('hidden');
      $('#final-celebration').innerHTML = '<p class="final-celebration-note">Tumhare Dudu ki taraf se — har universe se saari mohabbat ke saath ♡</p>';
      burst(undefined, undefined, 80);
      FX.confetti(100);
      FX.heartRain(6000);
    });

    $('#kiss').addEventListener('click', sendKiss);
    $('#replay').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    $('#love-burst').addEventListener('click', () => {
      toast(config.loveNotes[state.loveBurstIndex % config.loveNotes.length]);
      state.loveBurstIndex++;
      burst(undefined, undefined, 55);
      FX.heartRain(2000);
    });

    $('#close-lightbox').addEventListener('click', closeLightbox);
    $('#previous-image').addEventListener('click', () => openLightbox(state.lightboxIndex - 1));
    $('#next-image').addEventListener('click', () => openLightbox(state.lightboxIndex + 1));
    $('#lightbox').addEventListener('click', (e) => { if (e.target === $('#lightbox')) closeLightbox(); });
    $('#lightbox').addEventListener('close', () => { document.body.style.overflow = ''; });

    if (config.giftUrl) {
      $('#gift-link').href = config.giftUrl;
      $('#gift-link').classList.remove('hidden');
    }
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  function init() {
    populateFrontPage(calcAge(config.birthday));
    buildLandingTags();
    $('#final-text').textContent = config.finalText;
    $('#secret-count').textContent = `${state.secrets.size} mein se ${SECRET_COUNT} secrets mile`;

    buildPhotoCatalog();
    mountAllGifs();
    initGifSystems();
    buildTimeline();
    buildGallery();
    buildOurPhotos();
    buildPhotoFilters();
    buildPhotoAlbum();
    buildGiftGuess();
    buildReasons();
    buildBubuGrid();
    buildPromises();
    buildCandles();
    bindLockScreen();
    bindEvents();
    bindScrollProgress();
    bindNavSpy();
    bindMusic();
    updateLoveMeter();
    spawnFloatingQuotes();

    FX.initCursorSparkle();
    FX.initSectionGlow();
    FX.initParallax();

    const stars = $('#shooting-stars');
    FX.shootingStar(stars);
    setInterval(() => FX.shootingStar(stars), 5500);

    $$('#lock .reveal').forEach((el) => el.classList.add('visible'));
  }

  init();
})();
