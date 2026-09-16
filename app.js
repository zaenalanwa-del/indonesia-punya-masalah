(() => {
  'use strict';
  const $ = (s, r = document) => r?.querySelector(s);
  const $$ = (s, r = document) => [...(r?.querySelectorAll(s) || [])];
  const body = document.body;
  const toast = (message) => {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(window.__ipmToast);
    window.__ipmToast = setTimeout(() => el.classList.remove('show'), 3200);
  };

  // Mobile navigation
  $('#menuBtn')?.addEventListener('click', () => {
    const nav = $('#mainNav');
    const open = nav?.classList.toggle('open');
    $('#menuBtn')?.setAttribute('aria-expanded', String(!!open));
  });
  $$('.main-nav a').forEach(a => a.addEventListener('click', () => {
    $('#mainNav')?.classList.remove('open');
    $('#menuBtn')?.setAttribute('aria-expanded', 'false');
  }));

  // Report modal
  const reportModal = $('#reportModal');
  const openReport = () => { if (reportModal) { reportModal.classList.add('open'); reportModal.setAttribute('aria-hidden', 'false'); body.classList.add('lock'); $('#reportTitle, #title')?.focus(); } };
  const closeReport = () => { if (reportModal) { reportModal.classList.remove('open'); reportModal.setAttribute('aria-hidden', 'true'); body.classList.remove('lock'); } };
  $$('[data-report]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openReport(); }));
  $('.close', reportModal)?.addEventListener('click', closeReport);
  reportModal?.addEventListener('click', e => { if (e.target === reportModal) closeReport(); });

  // Auth modal is intentionally lightweight until production auth is connected.
  const authModal = $('#authModal');
  const openAuth = mode => {
    if (!authModal) { toast(mode === 'register' ? 'Pendaftaran akan tersedia setelah autentikasi produksi aktif.' : 'Masuk akan tersedia setelah autentikasi produksi aktif.'); return; }
    authModal.classList.add('open'); authModal.setAttribute('aria-hidden','false'); body.classList.add('lock');
    $$('[data-auth-mode]', authModal).forEach(x => x.hidden = x.dataset.authMode !== mode);
  };
  const closeAuth = () => { authModal?.classList.remove('open'); authModal?.setAttribute('aria-hidden','true'); body.classList.remove('lock'); };
  $$('[data-auth]').forEach(b => b.addEventListener('click', () => openAuth(b.dataset.auth)));
  $('.close', authModal)?.addEventListener('click', closeAuth);
  authModal?.addEventListener('click', e => { if (e.target === authModal) closeAuth(); });

  // Search + category filters
  const cards = $$('.problem');
  const filter = query => {
    const term = String(query || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const haystack = `${card.textContent} ${card.dataset.category || ''} ${card.dataset.location || ''}`.toLowerCase();
      const match = !term || haystack.includes(term);
      card.hidden = !match;
      if (match) visible++;
    });
    toast(term ? `${visible} masalah cocok dengan “${query}”.` : 'Menampilkan semua masalah.');
    $('#masalah')?.scrollIntoView({behavior:'smooth', block:'start'});
  };
  $('#searchForm')?.addEventListener('submit', e => { e.preventDefault(); filter($('#searchInput')?.value); });
  $('#headerSearch')?.addEventListener('click', () => { $('#searchInput')?.focus(); $('.hero')?.scrollIntoView({behavior:'smooth'}); });
  $$('[data-category]').forEach(b => b.addEventListener('click', () => filter(b.dataset.category || b.textContent)));
  $('#showAll')?.addEventListener('click', () => { filter(''); $('#searchInput').value = ''; });
  $('#latestAll')?.addEventListener('click', () => { filter(''); $('#masalah')?.scrollIntoView({behavior:'smooth'}); });

  // Region explorer updates the map context without pretending to fetch production data.
  $$('.region').forEach(button => button.addEventListener('click', () => {
    $$('.region').forEach(x => x.classList.remove('active'));
    button.classList.add('active');
    const region = button.dataset.region || button.textContent.trim();
    const sub = $('#mapSubtitle');
    if (sub) sub.textContent = `Distribusi masalah — ${region}`;
    toast(`Wilayah dipilih: ${region}.`);
  }));

  // Map mode + zoom affordance
  $$('.map-switch button').forEach(button => button.addEventListener('click', () => {
    $$('.map-switch button').forEach(x => x.classList.remove('active'));
    button.classList.add('active');
    const mode = button.dataset.mapMode || button.textContent.trim();
    toast(`Mode peta: ${mode}.`);
  }));
  let zoom = 1;
  $$('.map-controls button').forEach(button => button.addEventListener('click', () => {
    zoom = Math.max(.8, Math.min(1.45, zoom + (button.dataset.zoom === 'in' ? .1 : -.1)));
    const map = $('.indonesia-map');
    if (map) map.style.transform = `scale(${zoom})`;
  }));
  $$('.map-pin').forEach(pin => pin.addEventListener('click', () => toast(`${pin.title}: detail wilayah akan terhubung ke data produksi.`)));

  // Intelligence cards and other progressive modules.
  $$('[data-intel]').forEach(card => card.addEventListener('click', () => {
    const labels = {evidence:'Provenance & evidence', monitoring:'Monitoring perubahan', signal:'Future Radar & sinyal dini', answer:'Jawaban terstruktur'};
    toast(`${labels[card.dataset.intel] || 'Intelligence'}: modul siap disambungkan ke pipeline produksi.`);
  }));
  $('#intelligenceBtn')?.addEventListener('click', () => $('#intelligence')?.scrollIntoView({behavior:'smooth'}));
  $$('[data-toast]').forEach(b => b.addEventListener('click', () => toast(b.dataset.toast)));

  // Small animated counters when the statistics enter the viewport.
  const counters = $$('[data-count]');
  const formatNumber = n => n.toLocaleString('id-ID');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting || entry.target.dataset.counted) return;
      entry.target.dataset.counted = '1';
      const target = Number(entry.target.dataset.count || 0);
      const start = performance.now();
      const duration = 900;
      const tick = now => {
        const p = Math.min(1, (now - start) / duration);
        entry.target.textContent = formatNumber(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), {threshold:.4});
    counters.forEach(x => io.observe(x));
  }

  // Citizen report submission: API acknowledgement + local fallback, clearly marked as pending review.
  $('#reportForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    data.created_at = new Date().toISOString();
    data.verification_status = 'received';
    let stored = false;
    try {
      const r = await fetch('/api/report', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
      if (!r.ok) throw new Error('API error');
      stored = true;
    } catch (_) {
      const saved = JSON.parse(localStorage.getItem('ipm_reports') || '[]');
      saved.push(data); localStorage.setItem('ipm_reports', JSON.stringify(saved));
    }
    toast(stored ? 'Laporan diterima dan masuk antrean review.' : 'Laporan tersimpan di perangkat ini; sinkronisasi server belum tersedia.');
    form.reset(); closeReport();
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeReport(); closeAuth(); } });
})();
