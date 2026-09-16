(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const modal = $('#reportModal');
  const openReport = () => { if (modal) { modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); } };
  const closeReport = () => { if (modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); } };

  $('#menuBtn')?.addEventListener('click', () => $('#mainNav')?.classList.toggle('open'));
  $$('.main-nav a').forEach(a => a.addEventListener('click', () => $('#mainNav')?.classList.remove('open')));
  $$('[data-report]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openReport(); }));
  $('.close', modal)?.addEventListener('click', closeReport);
  modal?.addEventListener('click', e => { if (e.target === modal) closeReport(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeReport(); });

  const cards = $$('.problem-grid .problem, .problem');
  const filter = q => {
    const term = q.trim().toLowerCase();
    cards.forEach(card => { card.hidden = !!term && !card.textContent.toLowerCase().includes(term); });
    if (term) $('#masalah')?.scrollIntoView({behavior:'smooth', block:'start'});
  };
  $('#searchForm')?.addEventListener('submit', e => { e.preventDefault(); filter($('#searchInput')?.value || ''); });
  $('#headerSearch')?.addEventListener('click', () => { $('#searchInput')?.focus(); document.querySelector('.hero')?.scrollIntoView({behavior:'smooth'}); });
  $$('[data-category]').forEach(b => b.addEventListener('click', () => filter(b.dataset.category || b.textContent)));

  $('#reportForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    data.created_at = new Date().toISOString();
    data.verification_status = 'received';
    try {
      const r = await fetch('/api/report', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
      if (!r.ok) throw new Error('API error');
    } catch (_) {
      const saved = JSON.parse(localStorage.getItem('ipm_reports') || '[]');
      saved.push(data); localStorage.setItem('ipm_reports', JSON.stringify(saved));
    }
    alert('Laporan diterima. Status awal: menunggu review.');
    e.currentTarget.reset(); closeReport();
  });
})();
