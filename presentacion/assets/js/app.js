/* =====================================================================
   Vista Victoria — interacciones del sitio (compartido entre páginas)
   ===================================================================== */
(function () {
  'use strict';
  const doc = document;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header sólido + progreso de lectura */
  const header = doc.getElementById('header');
  const progress = doc.getElementById('progress');
  function onScroll() {
    const y = scrollY || pageYOffset;
    if (header) header.classList.toggle('is-solid', y > 40);
    if (progress) {
      const h = doc.documentElement.scrollHeight - innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Menú móvil */
  const nav = doc.getElementById('nav');
  const toggle = doc.getElementById('navToggle');
  if (nav && toggle) {
    const close = () => { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); };
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    doc.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* Reveal on scroll */
  const reveal = Array.from(doc.querySelectorAll('[data-reveal]'));
  if (reduced || !('IntersectionObserver' in window)) {
    reveal.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((ents) => {
      ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveal.forEach(el => io.observe(el));
  }

  /* Tabs (programa) */
  const tabs = Array.from(doc.querySelectorAll('.tab'));
  tabs.forEach(tab => tab.addEventListener('click', () => {
    const id = tab.getAttribute('data-tab');
    tabs.forEach(t => t.classList.toggle('is-active', t === tab));
    doc.querySelectorAll('.panel').forEach(p => p.classList.toggle('is-active', p.id === 'panel-' + id));
  }));

  /* Carruseles */
  doc.querySelectorAll('.gallery2').forEach(g => {
    const car = g.querySelector('.carousel');
    const slides = Array.from(car.querySelectorAll('.slide'));
    const dotsBox = g.querySelector('.dots');
    const prev = g.querySelector('[data-prev]');
    const next = g.querySelector('[data-next]');
    if (!slides.length) return;

    if (dotsBox) {
      slides.forEach((_, i) => {
        const b = doc.createElement('button');
        b.type = 'button'; b.setAttribute('aria-label', 'Ir a la imagen ' + (i + 1));
        b.addEventListener('click', () => slides[i].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', inline: 'center', block: 'nearest' }));
        dotsBox.appendChild(b);
      });
    }
    const dots = dotsBox ? Array.from(dotsBox.children) : [];

    function step(dir) {
      const w = slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(car).gap || 16);
      car.scrollBy({ left: dir * w, behavior: reduced ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', () => step(-1));
    if (next) next.addEventListener('click', () => step(1));

    function update() {
      const center = car.scrollLeft + car.clientWidth / 2;
      let idx = 0, best = Infinity;
      slides.forEach((s, i) => {
        const c = s.offsetLeft + s.offsetWidth / 2;
        const d = Math.abs(c - center);
        if (d < best) { best = d; idx = i; }
      });
      dots.forEach((d, i) => d.setAttribute('aria-current', String(i === idx)));
      if (prev) prev.disabled = car.scrollLeft <= 2;
      if (next) next.disabled = car.scrollLeft + car.clientWidth >= car.scrollWidth - 2;
    }
    car.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    addEventListener('resize', update);
    update();
  });

  /* Lightbox */
  const lb = doc.getElementById('lightbox');
  if (lb) {
    const lbImg = doc.getElementById('lightboxImg');
    const lbCap = doc.getElementById('lightboxCap');
    const lbClose = doc.getElementById('lightboxClose');
    let last = null;
    const open = (src, cap, alt) => {
      last = doc.activeElement; lbImg.src = src; lbImg.alt = alt || cap || '';
      lbCap.textContent = cap || ''; lb.classList.add('is-open'); doc.body.style.overflow = 'hidden'; lbClose.focus();
    };
    const close = () => { lb.classList.remove('is-open'); doc.body.style.overflow = ''; setTimeout(() => lbImg.src = '', 400); if (last) last.focus(); };
    doc.querySelectorAll('[data-lightbox]').forEach(el => el.addEventListener('click', () => {
      const img = el.querySelector('img'); if (img) open(img.currentSrc || img.src, el.getAttribute('data-cap'), img.alt);
    }));
    lb.addEventListener('click', e => { if (e.target === lb || e.target === lbImg) close(); });
    lbClose.addEventListener('click', close);
    doc.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('is-open')) close(); });
  }

  /* Año dinámico */
  doc.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
