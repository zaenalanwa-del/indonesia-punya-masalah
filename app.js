(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const path = location.pathname;
  const api = (p) => {
    const base = path.includes('/indonesia-punya-masalah/') ? '/indonesia-punya-masalah' : '';
    return `${base}${p}`;
  };

  const menu = $('#menuBtn'), side = $('#sidebar');
  if (menu && side) menu.addEventListener('click', () => side.classList.toggle('open'));

  $$('.nav-group > a').forEach(a => a.addEventListener('click', e => {
    const group = a.parentElement;
    if (group.querySelector(':scope > div')) {
      e.preventDefault();
      group.classList.toggle('expanded');
    }
  }));

  $$('[data-scroll]').forEach(b => b.addEventListener('click', () => {
    document.querySelector(b.dataset.scroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));

  const categoryButtons = $$('.cat-grid button');
  const cards = $$('.problem-grid .problem');
  categoryButtons.forEach(btn => btn.addEventListener('click', () => {
    const category = btn.textContent.trim().replace(/^[^A-Za-z&]+/, '').toLowerCase();
    let shown = 0;
    cards.forEach(card => {
      const tag = $('.tag', card)?.textContent.trim().toLowerCase() || '';
      const match = category === 'lainnya' || tag.includes(category) || category.includes(tag);
      card.hidden = !match;
      if (match) shown++;
    });
    $('#masalah')?.scrollIntoView({ behavior: 'smooth' });
    categoryButtons.forEach(x => x.classList.remove('selected'));
    btn.classList.add('selected');
    if (!shown) cards.forEach(card => card.hidden = false);
  }));

  const search = $('#searchInput');
  if (search) search.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const q = e.currentTarget.value.trim().toLowerCase();
    if (!q) { cards.forEach(c => c.hidden = false); return; }
    cards.forEach(card => card.hidden = !card.textContent.toLowerCase().includes(q));
    $('#masalah')?.scrollIntoView({ behavior: 'smooth' });
  });

  const modal = $('#reportModal');
  $$('[data-report]').forEach(b => b.addEventListener('click', () => modal?.classList.add('open')));
  $('.close', modal)?.addEventListener('click', () => modal.classList.remove('open'));
  modal?.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });

  const form = $('#reportForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    data.created_at = new Date().toISOString();
    data.verification_status = 'received';
    const local = JSON.parse(localStorage.getItem('ipm_reports') || '[]');
    local.push(data);
    localStorage.setItem('ipm_reports', JSON.stringify(local));
    try {
      const r = await fetch(api('/api/report'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error('API unavailable');
    } catch (_) {}
    alert('Laporan diterima. Status awal: menunggu review.');
    e.currentTarget.reset();
    modal?.classList.remove('open');
  });

  window.addEventListener('load', async () => {
    try {
      const r = await fetch(api('/api/health'), { cache: 'no-store' });
      document.documentElement.dataset.api = r.ok ? 'online' : 'offline';
    } catch (_) {
      document.documentElement.dataset.api = 'static';
    }
  });
})();
