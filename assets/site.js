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

// Formulaire « Être prévenu du lancement » / « Devenir prestataire » : le message arrive dans Kopé Admin.
(function () {
  var d = document.getElementById('kform');
  if (!d || typeof d.showModal !== 'function') return; // navigateur trop ancien : le lien WhatsApp reste
  var f = d.querySelector('form'), msg = d.querySelector('.kform-msg'), send = d.querySelector('.kform-send');
  var T = { launch: ['Être prévenu du lancement', "Laissez vos coordonnées : l'équipe Kopé vous prévient dès que l'appli est disponible."],
            provider: ['Devenir prestataire', "Dites-nous votre métier et votre quartier : l'équipe Kopé vous recontacte pour votre inscription."] };
  var API = 'https://nkohlcactttqoljejpsv.supabase.co/functions/v1/kope/api/public/sitecontact';
  document.querySelectorAll('[data-form]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      var k = T[b.getAttribute('data-form')] ? b.getAttribute('data-form') : 'launch';
      f.elements['topic'].value = k; d.querySelector('h3').textContent = T[k][0]; d.querySelector('.kform-sub').textContent = T[k][1];
      msg.textContent = ''; msg.className = 'kform-msg'; send.disabled = false; send.textContent = 'Envoyer';
      d.showModal();
    });
  });
  d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
  send.addEventListener('click', function () {
    var name = f.elements['name'].value.trim(), contact = f.elements['contact'].value.trim();
    if (!name || contact.replace(/\s/g, '').length < 6) { msg.className = 'kform-msg err'; msg.textContent = 'Indiquez votre nom et votre téléphone ou e-mail.'; return; }
    var text = (f.elements['place'].value.trim() ? 'Lieu : ' + f.elements['place'].value.trim() + '\n' : '') + f.elements['message'].value.trim();
    send.disabled = true; send.textContent = 'Envoi…'; msg.className = 'kform-msg'; msg.textContent = '';
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: f.elements['topic'].value, name: name, contact: contact, message: text, website: f.elements['website'].value }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) {
        if (!x.ok) throw new Error((x.j && x.j.error) || 'Envoi impossible.');
        msg.className = 'kform-msg ok'; msg.textContent = 'Merci ' + name + ' ! Votre message est bien arrivé chez l\'équipe Kopé.';
        send.textContent = 'Envoyé'; f.reset();
      })
      .catch(function (e) {
        msg.className = 'kform-msg err'; msg.textContent = (e && e.message && e.message !== 'Failed to fetch' ? e.message : 'Pas de connexion.') + ' Réessayez, ou écrivez-nous sur WhatsApp.';
        send.disabled = false; send.textContent = 'Envoyer';
      });
  });
})();

// Compteur de visites (sans cookie) : la page vue, la provenance et la taille d'écran ; rien qui identifie la personne.
(function () {
  try {
    var first = false;
    try { first = !sessionStorage.getItem('kv'); sessionStorage.setItem('kv', '1'); } catch (_) { first = true; }
    var q = new URLSearchParams(location.search);
    var body = JSON.stringify({ p: location.pathname, r: first ? document.referrer : '', src: first ? (q.get('utm_source') || q.get('src') || '') : '',
      w: window.screen ? screen.width : 0, n: first });
    fetch('https://nkohlcactttqoljejpsv.supabase.co/functions/v1/kope/api/public/sitevisit',
      { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: body, keepalive: true }).catch(function () {});
  } catch (_) {}
})();
