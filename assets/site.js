/* Kopé — petites interactions communes (menu mobile, apparition douce, filtre des catégories) */
(function () {
  var doc = document.documentElement;
  doc.classList.add('js');

  // Barre de navigation : bordure au défilement, menu mobile
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    var burger = nav.querySelector('.burger');
    if (burger) {
      burger.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      nav.querySelectorAll('.menu a').forEach(function (a) {
        a.addEventListener('click', function () {
          nav.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  // Apparition douce des blocs
  var items = document.querySelectorAll('.rv');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  // Recherche : filtre les catégories présentées sur la page
  var form = document.getElementById('search');
  if (form) {
    var input = document.getElementById('q');
    var cats = Array.prototype.slice.call(document.querySelectorAll('.cat'));
    var none = document.querySelector('.no-cat');
    var norm = function (s) {
      return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    };
    var apply = function (term) {
      var t = norm(term).trim();
      var shown = 0;
      cats.forEach(function (c) {
        var hit = !t || norm(c.getAttribute('data-k') + ' ' + c.textContent).indexOf(t) !== -1;
        c.classList.toggle('hide', !hit);
        if (hit) shown++;
      });
      if (none) none.style.display = shown ? 'none' : 'block';
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      apply(input.value);
      var target = document.getElementById('categories');
      if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
    input.addEventListener('input', function () { apply(input.value); });
    document.querySelectorAll('.trade').forEach(function (tile) {
      tile.addEventListener('click', function () {
        input.value = tile.getAttribute('data-q') || '';
        apply(input.value);
        var target = document.getElementById('categories');
        if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      });
    });
    document.querySelectorAll('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        input.value = chip.textContent;
        apply(input.value);
        var target = document.getElementById('categories');
        if (target) target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  // Année du pied de page
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
