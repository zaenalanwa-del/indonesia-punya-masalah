(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reportsKey = 'ipm_reports';
  const savedReports = () => JSON.parse(localStorage.getItem(reportsKey) || '[]');

  const refreshReportCount = () => {
    const count = savedReports().length;
    const box = $$('.admin-grid.stats > div')[1];
    if (box && count) {
      const b = $('b', box); if (b) b.textContent = String(386 + count);
      const small = $('small', box); if (small) small.textContent = `${count} laporan baru dari browser ini`;
    }
  };

  $$('.review-list button').forEach(btn => btn.addEventListener('click', () => {
    const row = btn.parentElement;
    btn.textContent = 'Reviewed';
    btn.disabled = true;
    row.classList.add('reviewed');
  }));

  $$('.admin-head .primary.small').forEach(btn => btn.addEventListener('click', () => {
    alert('Problem intake dibuka. Hubungkan ke Supabase/API produksi pada tahap backend.');
  }));

  $$('.admin-card .primary.small').forEach(btn => {
    if (btn.textContent.includes('Run Sync')) btn.addEventListener('click', () => {
      btn.disabled = true; btn.textContent = 'Syncing…';
      setTimeout(() => { btn.textContent = 'Sync Complete ✓'; btn.disabled = false; }, 900);
    });
  });

  $$('.outline').forEach(btn => btn.addEventListener('click', () => {
    $('#reports')?.scrollIntoView({ behavior: 'smooth' });
  }));

  const nav = $$('.admin-side nav a');
  nav.forEach(a => a.addEventListener('click', () => {
    nav.forEach(x => x.classList.remove('active'));
    a.classList.add('active');
  }));

  refreshReportCount();
})();
