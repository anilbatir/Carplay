/* Dilek BATIR — anilbatir.com animasyon katmanının birebir uyarlaması (GSAP + ScrollTrigger + Lenis) */
(() => {
  // Yenileyince (F5) sayfa her zaman en üstten başlar
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const toTop = () => window.scrollTo(0, 0);
  toTop();
  addEventListener('beforeunload', toTop);
  addEventListener('pageshow', toTop);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const one = (s, c = document) => c.querySelector(s);
  const all = (s, c = document) => [...c.querySelectorAll(s)];
  const SVGNS = 'http://www.w3.org/2000/svg';

  /* ---------- 1. Çıkartmalar (dönen yazılı yuvarlak etiketler) ---------- */
  all('[data-sticker]').forEach((el, i) => {
    const id = 'ring' + i;
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('class', 'st-ring');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `<defs><path id="${id}" d="M100,100 m-79,0 a79,79 0 1,1 158,0 a79,79 0 1,1 -158,0"/></defs>
      <text><textPath href="#${id}" textLength="492" lengthAdjust="spacing">${el.dataset.ring || ''}</textPath></text>`;
    const sym = document.createElement('span');
    sym.className = 'st-sym';
    sym.textContent = el.dataset.sym || '';
    el.append(svg, sym);
    if (i % 2) svg.style.animationDirection = 'reverse';
  });

  /* ---------- 2. Harf bölme ---------- */
  const splitChars = el => {
    const text = el.textContent;
    el.textContent = '';
    return [...text].map(ch => {
      const s = document.createElement('span');
      s.className = 'char';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch === ' ' ? ' ' : ch;
      el.append(s);
      return s;
    });
  };
  const heroChars = all('.hero-title .split').flatMap(splitChars);
  const assembleChars = all('.assemble .aw').flatMap(splitChars);

  /* ---------- 3. Dev yazıları kutusuna oturt (hiçbir çözünürlükte harf alt satıra düşmez) ---------- */
  const fit = () => {
    all('[data-fit]').forEach(el => {
      const p = el.parentElement, cs = getComputedStyle(p);
      const avail = p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      el.style.fontSize = '100px';
      const w = el.offsetWidth;
      if (!w || !avail) { el.style.fontSize = ''; return; }
      let size = 100 * avail * 0.97 / w;
      const max = +el.dataset.fitMax, vh = +el.dataset.fitVh;
      if (max) size = Math.min(size, max);
      if (vh && innerWidth > 760) size = Math.min(size, innerHeight * vh);
      el.style.fontSize = size.toFixed(1) + 'px';
    });
  };
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fit(); window.ScrollTrigger && ScrollTrigger.refresh(); });
  let rz;
  let lastW = innerWidth;
  addEventListener('resize', () => { if (innerWidth === lastW) return; lastW = innerWidth; clearTimeout(rz); rz = setTimeout(fit, 60); });

  /* ---------- 4. Sinüs bandı yolları ---------- */
  const wavePath = (amp, phase, cy, periods) => {
    let d = '';
    for (let x = -200; x <= 2200; x += 20) {
      const y = cy + amp * Math.sin((x / 2000) * Math.PI * 2 * periods + phase);
      d += (x === -200 ? 'M' : 'L') + x + ',' + y.toFixed(1) + ' ';
    }
    return d;
  };
  const pA = one('#wavePathA'), pB = one('#wavePathB');
  pA.setAttribute('d', wavePath(95, 0, 210, 1.25));
  pB.setAttribute('d', wavePath(-80, 0.9, 210, 1.1));
  function placeRider(t) {
    const g = one('#waveRider');
    if (!g || !pA.getTotalLength) return;
    const L = pA.getTotalLength(), p = pA.getPointAtLength(L * t), q = pA.getPointAtLength(Math.min(L, L * t + 2));
    const ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
    g.setAttribute('transform', `translate(${p.x.toFixed(1)},${p.y.toFixed(1)}) rotate(${(ang + t * 360).toFixed(1)})`);
  }

  /* ---------- 5. Mobil menü ---------- */
  const menuBtn = one('.menu-btn'), menu = one('#mobile-menu');
  const setMenu = open => {
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  all('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Pop-up: ÇEK BENİ etiketi açar ---------- */
  const pop = one('#pop'), tag = one('.hang-tag');
  let moved = false, lenisRef = null;
  const openPop = () => { if (pop.open) return; pop.showModal(); lenisRef && lenisRef.stop(); };
  pop.addEventListener('close', () => { lenisRef && lenisRef.start(); });
  pop.addEventListener('click', e => { if (e.target === pop) pop.close(); });
  all('[data-pop-close]', pop).forEach(b => b.addEventListener('click', () => pop.close()));
  // tıklama da, çekip bırakma da aynı pencereyi açar
  tag.addEventListener('click', e => { e.preventDefault(); e.stopImmediatePropagation(); if (!moved) openPop(); }, true);
  // telefondaki sabit buton doğrudan arama başlatır (tel: bağlantısı); iletişim bölümü ve footer görünürken çekilir
  const sticky = one('.sticky-cta');
  if ('IntersectionObserver' in window) {
    const seen = new Set();
    const io = new IntersectionObserver(es => {
      es.forEach(en => { if (en.isIntersecting) seen.add(en.target); else seen.delete(en.target); });
      sticky.classList.toggle('off', seen.size > 0);
    }, { threshold: 0.15 });
    [one('#seviyorum'), one('.footer')].forEach(el => io.observe(el));
  }

  /* ---------- Footer: parmak harflerin üzerinde gezdikçe harfler zıplar ---------- */
  const fw = one('.footer-word');
  const litTimers = new WeakMap();
  const light = el => {
    if (!el || el.parentElement !== fw || el.classList.contains('gap')) return;
    el.classList.add('lit');
    clearTimeout(litTimers.get(el));
    litTimers.set(el, setTimeout(() => el.classList.remove('lit'), 650));
  };
  const underFinger = e => { const t = e.touches[0]; if (t) light(document.elementFromPoint(t.clientX, t.clientY)); };
  fw.addEventListener('touchstart', underFinger, { passive: true });
  fw.addEventListener('touchmove', underFinger, { passive: true });

  /* ---------- Kütüphane yoksa / azaltılmış hareket: her şey durağan ---------- */
  const pre = one('.preloader');
  const hoverReady = () => {
    all('.stat,.note,.page').forEach(e => e.classList.add('hov'));
    one('.footer-word').classList.add('ready');
  };
  if (reduce || !window.gsap || !window.ScrollTrigger) {
    pre && pre.remove();
    hoverReady();
    placeRider(0.5);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  ScrollTrigger.defaults({ toggleActions: 'play reverse play reverse' });
  ScrollTrigger.clearScrollMemory('manual');

  /* ---------- Harf harf gelen yazılar: kaydırdıkça her harf alttan yükselir ---------- */
  const splitMask = el => {
    const text = el.textContent.trim();
    if (!el.hasAttribute('aria-hidden')) el.setAttribute('aria-label', text);
    el.textContent = '';
    const chars = [];
    text.split(/\s+/).forEach((word, wi, arr) => {
      const w = document.createElement('span');
      w.className = 'cw';
      w.setAttribute('aria-hidden', 'true');
      [...word].forEach(ch => {
        const m = document.createElement('span'), c = document.createElement('span');
        m.className = 'cm'; c.className = 'ci'; c.textContent = ch;
        m.append(c); w.append(m); chars.push(c);
      });
      el.append(w);
      if (wi < arr.length - 1) el.append(' ');
    });
    return chars;
  };
  all('.j-word').forEach(splitMask);
  all('.about-head h2, .journey-head h2, .services-head h2, .reviews-head h2, .faq-head h2').forEach(hd => {
    gsap.fromTo(splitMask(hd), { yPercent: 130 }, { yPercent: 0, ease: 'power2.out', stagger: 0.06,
      scrollTrigger: { trigger: hd, start: 'top 95%', end: 'top 58%', scrub: 0.6 } });
  });

  /* ---------- 6. Yumuşak kaydırma ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  lenisRef = lenis;
  const go = t => { if (lenis) lenis.scrollTo(t, { offset: 0, duration: 1.4 }); else t.scrollIntoView({ behavior: 'smooth' }); };

  /* ---------- 7. ÇEK BENİ: aşağı çek → bırak → pop-up açılır ---------- */
  const hang = one('.hang'), str = one('.hang-string');
  const STR = 84, FIRE = 70;
  let sy = 0, dy = 0, down = false;
  tag.addEventListener('dragstart', e => e.preventDefault());
  tag.addEventListener('pointerdown', e => {
    down = true; moved = false; sy = e.clientY; dy = 0;
    try { tag.setPointerCapture(e.pointerId); } catch (_) {}
    hang.classList.add('drag');
    gsap.killTweensOf(str);
  });
  tag.addEventListener('pointermove', e => {
    if (!down) return;
    dy = Math.max(0, Math.min(180, (e.clientY - sy) * 0.9));
    if (dy > 5) moved = true;
    gsap.set(str, { height: STR + dy });
    hang.classList.toggle('armed', dy > FIRE);
  });
  const release = () => {
    if (!down) return;
    down = false;
    const fire = dy > FIRE;
    hang.classList.remove('drag', 'armed');
    gsap.to(str, { height: STR, duration: 1.2, ease: 'elastic.out(1.1, 0.3)' });
    if (fire) openPop();
    setTimeout(() => { moved = false; }, 50);
  };
  tag.addEventListener('pointerup', release);
  tag.addEventListener('pointercancel', release);
  // çekme hareketinden sonra gelen tıklamayı yut (tıklama tek başına yine çalışır)

  all('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const t = id.length > 1 && one(id);
    if (!t) return;
    e.preventDefault();
    go(t);
  }));

  /* ---------- 8. Açılış: mühür, π sayacı, büyüyen halkalar ---------- */
  gsap.set(heroChars, { yPercent: 115, rotate: () => gsap.utils.random(-25, 25) });
  gsap.set('.hero-in', { y: 40, opacity: 0 });
  gsap.set('.float-sticker, .inline-sticker', { scale: 0, rotate: -120 });
  gsap.set('.nav', { yPercent: -160 });
  gsap.set('.hang', { yPercent: -110 });
  gsap.set('.chalk span', { opacity: 0 });

  const counter = { v: 0 };
  const countEl = one('.pre-count span');
  pre.style.animation = 'none';
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .from('.pre-seal', { scale: 0, rotate: -40, duration: 1, ease: 'back.out(2.2)' })
    .from('.pre-stream', { clipPath: 'inset(0 100% 0 0)', duration: 1.6, ease: 'none' }, 0.2)
    .to(counter, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => (countEl.textContent = Math.round(counter.v)) }, 0.2)
    .to('.pre-seal', { scale: 1.12, rotate: 4, duration: 0.3, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 1.3)
    .to('.rings i', { scale: 1, duration: 1.1, stagger: 0.09, ease: 'power3.inOut' }, 1.85)
    .set(pre, { autoAlpha: 0, onComplete: () => pre.remove() })
    .to(heroChars, { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.03, ease: 'back.out(1.6)' }, '-=0.35')
    .to('.float-sticker, .inline-sticker', { scale: 1, rotate: 0, duration: 1.2, stagger: 0.12, ease: 'elastic.out(1, 0.55)' }, '<0.3')
    .to('.hero-in', { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, '<0.1')
    .to('.nav', { yPercent: 0, duration: 0.9 }, '<')
    .to('.hang', { yPercent: 0, duration: 1.4, ease: 'elastic.out(1, 0.5)' }, '<0.2')
    .to('.chalk span', { opacity: 1, duration: 1.2, stagger: 0.12, ease: 'power1.out' }, '<0.2')
    .add(() => { lenis && lenis.start(); ScrollTrigger.refresh(); }, '<');

  /* ---------- 9. Gezinme çubuğu: aşağı inerken gizlen ---------- */
  let lastY = 0;
  ScrollTrigger.create({
    onUpdate: self => {
      const y = self.scroll();
      one('.nav').classList.toggle('hide', y > 300 && y > lastY && menu.hidden);
      lastY = y;
    }
  });

  /* ---------- 10. Hero: fare ile derinlik + kaydırınca dağılma ---------- */
  if (fine) {
    const qs = all('.float-sticker').map(el => ({ x: gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3' }), d: +el.dataset.depth }));
    one('.hero').addEventListener('pointermove', e => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      qs.forEach(q => { q.x(nx * 70 * q.d); q.y(ny * 70 * q.d); });
    });
  }
  const heroST = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hero-title', { yPercent: 30, scale: 0.9, ease: 'none', scrollTrigger: heroST });
  gsap.to('.fs-1', { yPercent: -160, rotate: -90, ease: 'none', scrollTrigger: heroST });
  gsap.to('.fs-2', { yPercent: -220, rotate: 120, ease: 'none', scrollTrigger: heroST });
  gsap.to('.fs-3', { yPercent: -120, rotate: 60, ease: 'none', scrollTrigger: heroST });
  gsap.to('.chalk', { yPercent: -18, ease: 'none', scrollTrigger: heroST });

  /* ---------- 11. Sinüs bandı: kayan yazı, hız kaydırmayla artar ---------- */
  const tpA = one('#waveTpA'), tpB = one('#waveTpB');
  const unitA = tpA.parentNode.getComputedTextLength() / 6, unitB = tpB.parentNode.getComputedTextLength() / 6;
  let offA = 0, offB = -unitB, boost = 0, riderT = 0;
  ScrollTrigger.create({ trigger: '.wave', start: 'top bottom', end: 'bottom top',
    onUpdate: s => { boost = Math.min(Math.abs(s.getVelocity()) / 120, 14); } });
  gsap.ticker.add(() => {
    const sp = 1.4 + boost;
    boost *= 0.92;
    offA -= sp; offB += sp * 0.85;
    if (offA < -unitA) offA += unitA;
    if (offB > 0) offB -= unitB;
    tpA.setAttribute('startOffset', offA);
    tpB.setAttribute('startOffset', offB);
    riderT += 0.0016 + boost * 0.0004;
    placeRider(0.35 + 0.3 * (0.5 + 0.5 * Math.sin(riderT * Math.PI * 2)));
  });
  gsap.from('.wave-svg', { scaleY: 0, duration: 1.2, ease: 'elastic.out(1,0.6)', scrollTrigger: { trigger: '.wave', start: 'top 85%' } });

  /* ---------- 12. Harfler toplanıyor (bir kez oynar, yarıda kalmaz) + sayaçlar ---------- */
  gsap.fromTo(assembleChars,
    { x: () => gsap.utils.random(-420, 420), y: () => gsap.utils.random(-240, 240), rotate: () => gsap.utils.random(-140, 140), scale: () => gsap.utils.random(0.4, 1.8), opacity: 0 },
    { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, duration: 1.3, ease: 'back.out(1.3)', stagger: { each: 0.04, from: 'random' }, clearProps: 'transform',
      scrollTrigger: { trigger: '.assemble', start: 'top 82%' } });
  all('.count').forEach(el => {
    const to = +el.dataset.to, o = { v: 0 };
    el.textContent = '0';
    gsap.to(o, { v: to, duration: 2.2, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v)),
      scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  gsap.from('.stat', { scale: 0, rotate: -180, duration: 1.3, stagger: 0.15, ease: 'back.out(1.5)', clearProps: 'transform',
    onComplete: () => all('.stat').forEach(e => e.classList.add('hov')), scrollTrigger: { trigger: '.stat-row', start: 'top 85%' } });

  /* ---------- 13. Hakkımda: yay açılır, dev yazı akar, notlar yapışır ---------- */
  gsap.fromTo('.about', { borderRadius: '50% 50% 0 0 / 320px 320px 0 0' }, { borderRadius: '0% 0% 0 0 / 0px 0px 0 0', ease: 'none',
    scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'top 15%', scrub: true } });
  gsap.fromTo('.about-marquee span', { xPercent: 0 }, { xPercent: -45, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });
  all('.note').forEach((n, i) => {
    gsap.from(n, { y: 200, rotate: (i % 2 ? 1 : -1) * 30, opacity: 0, duration: 1.2, delay: i * 0.08, ease: 'back.out(1.4)', clearProps: 'transform,opacity',
      onComplete: () => n.classList.add('hov'), scrollTrigger: { trigger: '.notes', start: 'top 85%' } });
  });

  /* ---------- 14. Metot: sayfa sağa akar ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const track = one('.journey-track'), dot = one('.numline-dot'), line = one('.numline');
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    // adımlar iki ayrı seviyede durur (1 ve 3 üstte, 2 ve 4 altta); oklar geçerken görüntü çapraz kayar
    const stops = all('.j-step', track);
    const levelOf = i => i % 2;
    let gaps = [], drop = 0;
    const measure = () => {
      drop = parseFloat(getComputedStyle(stops[1]).top) || 0;
      gaps = stops.slice(0, -1).map((st, i) => ({
        a: st.offsetLeft + st.offsetWidth - innerWidth * 0.12,
        b: stops[i + 1].offsetLeft + innerWidth * 0.3,
        from: levelOf(i), to: levelOf(i + 1)
      }));
    };
    const camY = progress => {
      const c = progress * dist() + innerWidth / 2;
      let level = levelOf(0);
      for (const g of gaps) {
        if (c >= g.b) { level = g.to; continue; }
        if (c > g.a) { const t = (c - g.a) / (g.b - g.a); level = g.from + (g.to - g.from) * (t * t * (3 - 2 * t)); }
        break;
      }
      return -level * drop;
    };
    measure();
    ScrollTrigger.addEventListener('refreshInit', measure);
    const slide = gsap.to(track, { x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.journey', pin: '.journey-pin', start: 'top top', end: () => '+=' + dist(), scrub: 0.8, invalidateOnRefresh: true,
        onUpdate: s => { gsap.set(dot, { x: s.progress * line.offsetWidth * 0.96, rotate: s.progress * 720 }); gsap.set(track, { y: camY(s.progress) }); } } });
    // her parça kaydırdıkça sırayla gelir; ilk adım bölüm ekrana girerken, diğerleri sağdan yaklaşırken
    const pieces = (st, i, start, end) => i === 0
      ? { trigger: '.journey', start: 'top 72%', end: 'top 0%', scrub: 0.6 }
      : { containerAnimation: slide, scrub: true, trigger: st, start, end };
    all('.j-step').forEach((st, i) => {
      const dir = i % 2 ? -1 : 1;
      gsap.fromTo(all('.ci', one('.j-word', st)), { yPercent: 130 }, { yPercent: 0, ease: 'power2.out', stagger: 0.18, scrollTrigger: pieces(st, i, 'left 100%', 'left 38%') });
      gsap.from(one('.j-num', st), { scale: 0, rotate: -120, ease: 'back.out(2)', scrollTrigger: pieces(st, i, 'left 95%', 'left 60%') });
      gsap.from(one('.j-card', st), { y: dir * -240, rotate: dir * 28, opacity: 0, ease: 'power2.out', scrollTrigger: pieces(st, i, 'left 80%', 'left 30%') });
      gsap.from(all('.j-card > *', st), { y: 26, opacity: 0, stagger: 0.2, ease: 'power1.out', scrollTrigger: pieces(st, i, 'left 62%', 'left 22%') });
      gsap.from(one('.j-sticker', st), { scale: 0, rotate: -260, ease: 'back.out(1.6)', scrollTrigger: pieces(st, i, 'left 70%', 'left 28%') });
      gsap.fromTo(one('.j-note', st), { clipPath: 'inset(-20% 100% -20% 0%)' }, { clipPath: 'inset(-20% -5% -20% 0%)', ease: 'none', scrollTrigger: pieces(st, i, 'left 50%', 'left 12%') });
    });
    // oklar: görüntü çapraz kayarken yavaş yavaş çizilir, ucu en son gelir
    all('.j-arrow').forEach(svg => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: svg, containerAnimation: slide, start: 'left 74%', end: 'left 2%', scrub: true } });
      all('path', svg).forEach((p, k) => {
        const L = p.getTotalLength();
        gsap.set(p, { strokeDasharray: L, strokeDashoffset: L });
        tl.to(p, { strokeDashoffset: 0, ease: 'none', duration: k ? 0.2 : 0.8 });
      });
    });
    gsap.from('.j-eq', { scale: 0, ease: 'back.out(2)', scrollTrigger: { trigger: '.j-end', containerAnimation: slide, start: 'left 95%', end: 'left 68%', scrub: true } });
    gsap.from('.j-end [data-sticker]', { scale: 0.2, rotate: -360, ease: 'none', scrollTrigger: { trigger: '.j-end', containerAnimation: slide, start: 'left 100%', end: 'right 100%', scrub: true } });
    gsap.from('.numline-axis', { scaleX: 0, transformOrigin: '0 50%', ease: 'none', scrollTrigger: { trigger: '.journey', start: 'top 60%', end: 'top 8%', scrub: 0.6 } });
    gsap.from('.numline .tick', { opacity: 0, stagger: 0.2, ease: 'none', scrollTrigger: { trigger: '.journey', start: 'top 55%', end: 'top 4%', scrub: 0.6 } });
    gsap.from('.journey-hint', { opacity: 0, x: -40, ease: 'none', scrollTrigger: { trigger: '.journey', start: 'top 40%', end: 'top 5%', scrub: 0.6 } });
    return () => { ScrollTrigger.removeEventListener('refreshInit', measure); gsap.set(track, { y: 0 }); };
  });
  mm.add('(max-width: 899px)', () => {
    all('.j-step').forEach(st => {
      gsap.fromTo(all('.ci', one('.j-word', st)), { yPercent: 130 }, { yPercent: 0, ease: 'power2.out', stagger: 0.18,
        scrollTrigger: { trigger: st, start: 'top 95%', end: 'top 55%', scrub: 0.6 } });
      gsap.from(one('.j-card', st), { y: 90, opacity: 0, duration: 1, ease: 'back.out(1.4)', scrollTrigger: { trigger: st, start: 'top 75%' } });
      gsap.from(one('.j-sticker', st), { scale: 0, rotate: -200, duration: 1, ease: 'back.out(1.6)', scrollTrigger: { trigger: st, start: 'top 75%' } });
      gsap.from(one('.j-num', st), { scale: 0, rotate: -120, duration: 0.7, ease: 'back.out(2)', scrollTrigger: { trigger: st, start: 'top 88%' } });
      gsap.from(all('.j-card > *', st), { y: 22, opacity: 0, stagger: 0.12, duration: 0.7, delay: 0.25, scrollTrigger: { trigger: st, start: 'top 75%' } });
      gsap.fromTo(one('.j-note', st), { clipPath: 'inset(-20% 100% -20% 0%)' }, { clipPath: 'inset(-20% -5% -20% 0%)', duration: 1.1, ease: 'power1.inOut', scrollTrigger: { trigger: one('.j-note', st), start: 'top 92%' } });
    });
  });

  /* ---------- 15. Hizmetler: rulolar yuvarlanarak gelir ---------- */
  gsap.fromTo('.services-giant', { xPercent: -35 }, { xPercent: -65, ease: 'none', scrollTrigger: { trigger: '.services', start: 'top bottom', end: 'bottom top', scrub: true } });
  all('.roll').forEach((r, i) => {
    gsap.from(r, { xPercent: 160 + i * 40, rotate: 540, ease: 'power2.out', scrollTrigger: { trigger: '.rolls', start: 'top 95%', end: 'top 35%', scrub: 1 } });
  });
  gsap.from('.roll-card h3, .roll-card ul', { y: 40, opacity: 0, stagger: 0.08, duration: 0.9, scrollTrigger: { trigger: '.rolls', start: 'top 55%' } });

  /* ---------- 16. Yorumlar: sayfalar masaya düşer ---------- */
  all('.page').forEach((p, i) => {
    gsap.from(p, { y: -140, rotate: gsap.utils.random(-25, 25), scale: 1.15, opacity: 0, duration: 0.9, delay: (i % 3) * 0.12, ease: 'bounce.out', clearProps: 'transform,opacity',
      onComplete: () => p.classList.add('hov'), scrollTrigger: { trigger: p, start: 'top 90%' } });
  });

  /* ---------- 17. İletişim ve footer ---------- */
  gsap.fromTo('.contact-rings i', { scale: 0.2 }, { scale: 1.05, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'center center', scrub: true } });
  gsap.from('.contact-title span', { yPercent: 120, rotate: i => (i ? 10 : -10), opacity: 0, duration: 1.2, stagger: 0.12, ease: 'back.out(1.8)', clearProps: 'transform,opacity',
    scrollTrigger: { trigger: '.contact', start: 'top 65%' } });
  gsap.fromTo('.footer-word span', { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.04, ease: 'back.out(2)', clearProps: 'transform',
    onComplete: () => one('.footer-word').classList.add('ready'),
    scrollTrigger: { trigger: '.footer', start: 'top bottom' } });

  /* ---------- 18. İmleç ---------- */
  if (fine) {
    const c = one('.cursor');
    const cx = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3' }), cy = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3' });
    addEventListener('pointermove', e => { c.classList.add('on'); cx(e.clientX); cy(e.clientY); });
    document.addEventListener('pointerleave', () => c.classList.remove('on'));
    all('a, button, summary, [data-sticker], .stat').forEach(el => {
      el.addEventListener('pointerenter', () => c.classList.add('big'));
      el.addEventListener('pointerleave', () => c.classList.remove('big'));
    });
  }

  addEventListener('load', () => { if (intro.isActive()) toTop(); fit(); ScrollTrigger.refresh(); });
})();
