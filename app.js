(()=>{
  'use strict';
  const $ = (s, r = document) => r?.querySelector(s);
  const $$ = (s, r = document) => [...(r?.querySelectorAll(s) || [])];
  const body = document.body;
  const toast = (message) => {
    const el = $('#toast'); if (!el) return;
    el.textContent = message; el.classList.add('show');
    clearTimeout(window.__ipmToast); window.__ipmToast = setTimeout(() => el.classList.remove('show'), 3200);
  };

  const menuMap = {
    'Masalah': [['Semua Masalah','#masalah'],['Berdasarkan Kategori','#masalah','sub',[['Ekonomi','#masalah'],['Pendidikan','#masalah'],['Kesehatan','#masalah'],['Infrastruktur','#masalah'],['Lingkungan','#masalah'],['Sosial','#masalah']]],['Berdasarkan Wilayah','#peta','sub',[['Provinsi','#peta'],['Kabupaten / Kota','#peta'],['Kecamatan','#peta'],['Desa / Kelurahan','#peta']]],['Masalah Terbaru','#masalah'],['Masalah Paling Banyak','#masalah']],
    'Data & Statistik': [['Dashboard Data','#data'],['Statistik Nasional','#data','sub',[['Demografi','#data'],['Ekonomi','#data'],['Pendidikan','#data'],['Kesehatan','#data'],['Infrastruktur','#data'],['Lingkungan','#data']]],['Data Wilayah','#peta'],['Sumber Data','#lainnya'],['Metodologi Data','#lainnya']],
    'Suara Warga': [['Laporan Warga','#suara'],['Laporkan Masalah','#suara','report'],['Pantau Laporan','#masalah'],['Panduan Pelaporan','#lainnya'],['Verifikasi & Review','#intelligence']],
    'Intelligence': [['Pusat Intelligence','#intelligence'],['Evidence & Provenance','#intelligence','sub',[['Sumber & Bukti','#intelligence'],['Confidence','#intelligence'],['Konflik Data','#intelligence']]],['Monitoring Perubahan','#intelligence'],['Sinyal Dini','#intelligence'],['Future Radar','#intelligence'],['Jawaban Terstruktur','#intelligence']],
    'Solusi': [['Ruang Solusi','#solusi'],['Solusi Berdasarkan Masalah','#solusi','sub',[['Ekonomi','#solusi'],['Pendidikan','#solusi'],['Kesehatan','#solusi'],['Infrastruktur','#solusi'],['Lingkungan','#solusi']]],['Kolaborasi','#solusi'],['Pantau Dampak','#intelligence'],['Ajukan Solusi','#suara','report']],
    'Lainnya': [['Tentang Platform','#lainnya'],['Dokumentasi','#lainnya'],['API & Data','#lainnya'],['Metodologi','#lainnya'],['Transparansi & Trust','#lainnya'],['Kontak','#lainnya']]
  };
  const makeLink = (item) => {
    const [label, href, type, children] = item;
    const a = document.createElement('a'); a.href = href; a.textContent = label;
    if (type === 'report') a.dataset.report = '';
    if (type === 'sub') {
      a.className = 'has-sub'; a.setAttribute('aria-expanded','false');
      const arrow = document.createElement('span'); arrow.textContent = '›'; a.appendChild(arrow);
      const sub = document.createElement('div'); sub.className = 'nav-submenu';
      children.forEach(child => sub.appendChild(makeLink(child))); a.appendChild(sub);
      a.addEventListener('click', e => { if (window.innerWidth <= 850) { e.preventDefault(); a.parentElement.classList.toggle('open'); a.setAttribute('aria-expanded', String(a.parentElement.classList.contains('open'))); } });
    }
    a.addEventListener('click', () => { if (window.innerWidth <= 850) $('#mainNav')?.classList.remove('open'); });
    return a;
  };
  $$('.main-nav > a').forEach(original => {
    const label = original.textContent.replace('⌄','').trim(); if (!menuMap[label]) return;
    const item = document.createElement('div'); item.className = 'nav-item';
    const trigger = original.cloneNode(true); trigger.textContent = label + ' '; trigger.innerHTML = `${label} <span class="nav-chevron">⌄</span>`; trigger.href = original.getAttribute('href') || '#'; trigger.setAttribute('aria-haspopup','true'); trigger.setAttribute('aria-expanded','false'); item.appendChild(trigger);
    const drop = document.createElement('div'); drop.className = 'nav-dropdown'; menuMap[label].forEach(entry => drop.appendChild(makeLink(entry))); item.appendChild(drop); original.replaceWith(item);
    trigger.addEventListener('click', e => { if (window.innerWidth <= 850) { e.preventDefault(); item.classList.toggle('open'); trigger.setAttribute('aria-expanded', String(item.classList.contains('open'))); } });
  });
  $('#menuBtn')?.addEventListener('click', () => { const nav = $('#mainNav'); const open = nav?.classList.toggle('open'); $('#menuBtn')?.setAttribute('aria-expanded', String(!!open)); });
  document.addEventListener('click', e => { $$('.nav-item.open').forEach(item => { if (!item.contains(e.target)) item.classList.remove('open'); }); });
  $$('.main-nav a:not(.has-sub)').forEach(a => a.addEventListener('click', () => { if (window.innerWidth <= 850) { $('#mainNav')?.classList.remove('open'); $('#menuBtn')?.setAttribute('aria-expanded','false'); } }));

  const reportModal = $('#reportModal');
  const openReport = () => { if (reportModal) { reportModal.classList.add('open'); reportModal.setAttribute('aria-hidden','false'); body.classList.add('lock'); $('#reportTitle, #title')?.focus(); } };
  const closeReport = () => { if (reportModal) { reportModal.classList.remove('open'); reportModal.setAttribute('aria-hidden','true'); body.classList.remove('lock'); } };
  const bindReportButtons = () => $$('[data-report]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openReport(); })); bindReportButtons(); $('.close', reportModal)?.addEventListener('click', closeReport); reportModal?.addEventListener('click', e => { if (e.target === reportModal) closeReport(); });
  const authModal = $('#authModal');
  const openAuth = mode => { if (!authModal) { toast(mode === 'register' ? 'Pendaftaran akan tersedia setelah autentikasi produksi aktif.' : 'Masuk akan tersedia setelah autentikasi produksi aktif.'); return; } authModal.classList.add('open'); authModal.setAttribute('aria-hidden','false'); body.classList.add('lock'); $$('[data-auth-mode]', authModal).forEach(x => x.hidden = x.dataset.authMode !== mode); };
  const closeAuth = () => { authModal?.classList.remove('open'); authModal?.setAttribute('aria-hidden','true'); body.classList.remove('lock'); };
  $$('[data-auth]').forEach(b => b.addEventListener('click', () => openAuth(b.dataset.auth))); $('.close', authModal)?.addEventListener('click', closeAuth); authModal?.addEventListener('click', e => { if (e.target === authModal) closeAuth(); });

  const cards = $$('.problem');
  const filter = query => { const term = String(query || '').trim().toLowerCase(); let visible = 0; cards.forEach(card => { const haystack = `${card.textContent} ${card.dataset.category || ''} ${card.dataset.location || ''}`.toLowerCase(); const match = !term || haystack.includes(term); card.hidden = !match; if (match) visible++; }); toast(term ? `${visible} masalah cocok dengan “${query}”.` : 'Menampilkan semua masalah.'); $('#masalah')?.scrollIntoView({behavior:'smooth',block:'start'}); };
  $('#searchForm')?.addEventListener('submit', e => { e.preventDefault(); filter($('#searchInput')?.value); }); $('#headerSearch')?.addEventListener('click', () => { $('#searchInput')?.focus(); $('.hero')?.scrollIntoView({behavior:'smooth'}); }); $$('[data-category]').forEach(b => b.addEventListener('click', () => filter(b.dataset.category || b.textContent))); $('#showAll')?.addEventListener('click', () => { filter(''); if ($('#searchInput')) $('#searchInput').value = ''; }); $('#latestAll')?.addEventListener('click', () => { filter(''); $('#masalah')?.scrollIntoView({behavior:'smooth'}); });
  $$('.region').forEach(button => button.addEventListener('click', () => { $$('.region').forEach(x => x.classList.remove('active')); button.classList.add('active'); const region = button.dataset.region || button.textContent.trim(); const sub = $('#mapSubtitle'); if (sub) sub.textContent = `Distribusi masalah — ${region}`; toast(`Wilayah dipilih: ${region}.`); }));
  $$('.map-switch button').forEach(button => button.addEventListener('click', () => { $$('.map-switch button').forEach(x => x.classList.remove('active')); button.classList.add('active'); toast(`Mode peta: ${button.dataset.mapMode || button.textContent.trim()}.`); }));
  let zoom = 1; $$('.map-controls button').forEach(button => button.addEventListener('click', () => { zoom=Math.max(.8,Math.min(1.45,zoom+(button.dataset.zoom==='in'?.1:-.1))); const map=$('.indonesia-map'); if(map) map.style.transform=`scale(${zoom})`; })); $$('.map-pin').forEach(pin => pin.addEventListener('click', () => toast(`${pin.title}: detail wilayah akan terhubung ke data produksi.`)));
  $$('[data-intel]').forEach(card => card.addEventListener('click', () => { const labels={evidence:'Provenance & evidence',monitoring:'Monitoring perubahan',signal:'Future Radar & sinyal dini',answer:'Jawaban terstruktur'}; toast(`${labels[card.dataset.intel] || 'Intelligence'}: modul siap disambungkan ke pipeline produksi.`); })); $('#intelligenceBtn')?.addEventListener('click', () => $('#intelligence')?.scrollIntoView({behavior:'smooth'})); $$('[data-toast]').forEach(b => b.addEventListener('click', () => toast(b.dataset.toast)));
  const counters = $$('[data-count]'); const formatNumber = n => n.toLocaleString('id-ID'); if ('IntersectionObserver' in window) { const io=new IntersectionObserver(entries=>entries.forEach(entry=>{ if(!entry.isIntersecting||entry.target.dataset.counted)return; entry.target.dataset.counted='1'; const target=Number(entry.target.dataset.count||0),start=performance.now(),duration=900; const tick=now=>{const p=Math.min(1,(now-start)/duration);entry.target.textContent=formatNumber(Math.round(target*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick);}),{threshold:.4}); counters.forEach(x=>io.observe(x)); }
  $('#reportForm')?.addEventListener('submit', async e => { e.preventDefault(); const form=e.currentTarget; const data=Object.fromEntries(new FormData(form)); data.created_at=new Date().toISOString(); data.verification_status='received'; let stored=false; try { const r=await fetch('/api/report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); if(!r.ok)throw new Error('API error'); stored=true; } catch (_) { const saved=JSON.parse(localStorage.getItem('ipm_reports')||'[]');saved.push(data);localStorage.setItem('ipm_reports',JSON.stringify(saved)); } toast(stored?'Laporan diterima dan masuk antrean review.':'Laporan tersimpan di perangkat ini; sinkronisasi server belum tersedia.'); form.reset(); closeReport(); });

  // SUARA WARGA: klik menu -> popup melayang besar di kanan, pink, bisa ditutup dan klik lagi untuk buka/tutup.
  const swCss = document.createElement('style');
  swCss.textContent = `
    .ipm-sw-popup{position:fixed;inset:0;z-index:9999;pointer-events:none;background:transparent}
    .ipm-sw-popup.show{pointer-events:auto}
    .ipm-sw-panel{position:absolute;top:78px;right:18px;width:min(430px,calc(100vw - 28px));max-height:calc(100vh - 96px);overflow:auto;background:linear-gradient(180deg,#fff5fa,#fff);border:2px solid #f29bc0;border-radius:18px;box-shadow:0 20px 60px rgba(184,48,104,.26),0 8px 24px rgba(30,60,90,.12);transform:translateY(55px) scale(.97);opacity:0;transition:.32s cubic-bezier(.2,.8,.2,1)}
    .ipm-sw-popup.show .ipm-sw-panel{transform:translateY(0) scale(1);opacity:1}
    .ipm-sw-head{padding:17px 18px 14px;background:linear-gradient(180deg,#ffe4f0,#fff0f6);border-bottom:1px solid #f2c3d7;display:flex;gap:12px;align-items:flex-start}
    .ipm-sw-title{flex:1}.ipm-sw-title h2{margin:0;color:#5b1535;font-size:22px;font-weight:900}.ipm-sw-title p{margin:5px 0 10px;color:#875b70;font-size:12px;line-height:1.45}
    .ipm-sw-close{width:38px;height:38px;border:1px solid #e9a9c4;border-radius:10px;background:#fff0f6;color:#8d2450;font-size:24px;display:grid;place-items:center;cursor:pointer}
    .ipm-sw-send,.ipm-sw-comment{border:0;background:#ed3d82;color:#fff;border-radius:10px;padding:10px 16px;font-weight:900;cursor:pointer;box-shadow:0 6px 15px rgba(237,61,130,.2)}
    .ipm-sw-body{padding:0 18px 18px}.ipm-sw-voice{padding:15px 0;border-bottom:1px solid #f0dce5}.ipm-sw-person{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:900;color:#17385f}.ipm-sw-avatar{width:38px;height:38px;border-radius:50%;background:#ffe0ed;color:#c52d68;display:grid;place-items:center;font-size:12px;font-weight:900}.ipm-sw-text{font-size:13px;line-height:1.6;color:#405a74;margin:8px 0}.ipm-sw-meta{font-size:10px;color:#7b8b9d}.ipm-sw-comment{width:100%;margin-top:14px;font-size:13px}
    @media(max-width:760px){.ipm-sw-panel{top:64px;right:10px;width:calc(100vw - 20px);max-height:calc(100vh - 78px)}}`;
  document.head.appendChild(swCss);
  let swPopup=null;
  const closeSw=()=>{if(swPopup)swPopup.classList.remove('show');};
  const openSw=()=>{
    const source=$('.voices'); if(!source)return;
    if(!swPopup){
      swPopup=document.createElement('div'); swPopup.className='ipm-sw-popup';
      const voices=$$('.voice',source).map(v=>{const person=$('.person',v)?.textContent.trim()||'Warga';const text=$('p',v)?.textContent.trim()||'';const meta=$('.meta',v)?.textContent.trim()||'';const av=$('.vavatar',v)?.textContent.trim()||'W';return `<div class="ipm-sw-voice"><div class="ipm-sw-person"><span class="ipm-sw-avatar">${av}</span><span>${person}</span></div><div class="ipm-sw-text">“${text.replace(/^“|”$/g,'')}”</div><div class="ipm-sw-meta">${meta}</div></div>`;}).join('');
      swPopup.innerHTML=`<div class="ipm-sw-panel" role="dialog" aria-label="Suara Warga"><div class="ipm-sw-head"><div class="ipm-sw-title"><h2>Suara Warga</h2><p>Suara langsung dari masyarakat untuk perubahan yang lebih baik.</p><button class="ipm-sw-send" type="button">＋ Kirim</button></div><button class="ipm-sw-close" type="button" aria-label="Tutup">×</button></div><div class="ipm-sw-body">${voices}<button class="ipm-sw-comment" type="button">💬 Ayo Berkomentar!</button></div></div>`;
      document.body.appendChild(swPopup);
      $('.ipm-sw-close',swPopup).addEventListener('click',closeSw);
      swPopup.addEventListener('click',e=>{if(e.target===swPopup)closeSw();});
      $('.ipm-sw-send',swPopup).addEventListener('click',()=>{closeSw();openReport();});
      $('.ipm-sw-comment',swPopup).addEventListener('click',()=>{closeSw();openReport();});
    }
    if(swPopup.classList.contains('show')) closeSw(); else swPopup.classList.add('show');
  };
  document.addEventListener('click',e=>{const b=e.target.closest('.nav>button[data-sub="suara"],button[data-open-suara-warga]');if(!b)return;e.preventDefault();e.stopPropagation();openSw();},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeReport();closeAuth();closeSw();$$('.nav-item.open').forEach(x=>x.classList.remove('open'));}});
})();
