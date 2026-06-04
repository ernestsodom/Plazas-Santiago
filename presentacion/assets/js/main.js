/* =====================================================================
   Vista Victoria — interacciones
   ===================================================================== */
(function () {
  'use strict';
  const doc = document;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header sólido + barra de progreso ---------- */
  const header = doc.getElementById('header');
  const progress = doc.getElementById('progress');
  const hero = doc.getElementById('inicio');

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    const h = doc.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    const trigger = hero ? hero.offsetHeight - header.offsetHeight - 40 : 200;
    header.classList.toggle('is-solid', y > trigger);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- Menú móvil ---------- */
  const nav = doc.getElementById('nav');
  const toggle = doc.getElementById('navToggle');
  if (toggle && nav) {
    const close = () => { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menú'); };
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    doc.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ---------- Scroll reveal ---------- */
  const reveal = Array.from(doc.querySelectorAll('[data-reveal]'));
  if (prefersReduced || !('IntersectionObserver' in window)) {
    reveal.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveal.forEach(el => io.observe(el));
  }

  /* ---------- Nav activo según sección ---------- */
  const sections = ['entorno', 'proyecto', 'conjunto', 'casa', 'programa', 'contacto']
    .map(id => doc.getElementById(id)).filter(Boolean);
  const navLinks = Array.from(nav ? nav.querySelectorAll('a') : []);
  function linkFor(id) { return navLinks.find(a => a.getAttribute('href') === '#' + id); }
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(a => a.classList.remove('is-active'));
          const link = linkFor(entry.target.id);
          if (link) link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- Tabs del programa ---------- */
  const tabs = Array.from(doc.querySelectorAll('.tab'));
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const id = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.toggle('is-active', t === tab));
      doc.querySelectorAll('.panel').forEach(p => p.classList.toggle('is-active', p.id === 'panel-' + id));
    });
  });

  /* ---------- Lightbox ---------- */
  const lightbox = doc.getElementById('lightbox');
  const lbImg = doc.getElementById('lightboxImg');
  const lbCap = doc.getElementById('lightboxCap');
  const lbClose = doc.getElementById('lightboxClose');
  let lastFocus = null;

  function openLightbox(src, cap, alt) {
    if (!lightbox) return;
    lastFocus = doc.activeElement;
    lbImg.src = src; lbImg.alt = alt || cap || '';
    lbCap.textContent = cap || '';
    lightbox.classList.add('is-open');
    doc.body.style.overflow = 'hidden';
    lbClose.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    doc.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 400);
    if (lastFocus) lastFocus.focus();
  }
  doc.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', () => {
      const img = el.querySelector('img');
      if (!img) return;
      openLightbox(img.currentSrc || img.src, el.getAttribute('data-cap'), img.alt);
    });
  });
  if (lightbox) {
    lightbox.addEventListener('click', e => { if (e.target === lightbox || e.target === lbImg) closeLightbox(); });
    lbClose.addEventListener('click', closeLightbox);
    doc.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox(); });
  }

  /* ---------- Año dinámico ---------- */
  const yearEls = doc.querySelectorAll('[data-year]');
  yearEls.forEach(el => { el.textContent = new Date().getFullYear(); });
})();
