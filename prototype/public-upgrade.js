(()=> {
'use strict';
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const publicNav={
  intelligence:'Wawasan',
  monitoring:'Pantau',
  future:'Kemungkinan',
  solutions:'Solusi'
};
function cleanNav(){
  document.querySelectorAll('.nav-link[data-view]').forEach(a=>{
    const key=a.getAttribute('data-view');
    if(publicNav[key]) a.textContent=publicNav[key];
  });
}
function feature(icon,title,text,view,meta=''){return `<article class="pub-feature"><div class="pub-feature-icon">${icon}</div><div class="pub-feature-body"><span>${esc(meta)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p><button class="btn-outline" data-view="${esc(view)}">Buka Fitur →</button></div></article>`}
function add(){
  cleanNav();
  const host=document.querySelector('main')||document.body;
  if(document.getElementById('public-features')) return;
  const wrap=document.createElement('section');
  wrap.id='public-features';
  wrap.innerHTML=`
    <div class="pub-section pub-intro">
      <div class="pub-head"><span class="pub-kicker">PLATFORM PUBLIK</span><h2>Semua yang Anda perlukan untuk melihat Indonesia lebih jelas</h2><p>Lihat kondisi wilayah, temukan masalah, dengarkan warga, pahami data, dan ikuti perubahan dari tingkat nasional sampai desa.</p></div>
      <div class="pub-feature-grid pub-grid-4">
        ${feature('🗺️','Peta Indonesia','Jelajahi Indonesia dari provinsi hingga desa/kelurahan melalui peta dan wilayah.','map','01 · Peta')}
        ${feature('📍','Jelajahi Wilayah','Buka informasi wilayah secara bertahap dan lihat masalah serta data yang terkait.','regions','02 · Wilayah')}
        ${feature('⚠️','Masalah Indonesia','Temukan masalah terkini, masalah daerah, masalah mendesak, dan yang belum terselesaikan.','problems','03 · Masalah')}
        ${feature('📊','Data & Statistik','Baca indikator dan statistik dengan konteks wilayah, periode, dan sumber yang jelas.','data','04 · Data')}
      </div>
    </div>

    <div class="pub-section">
      <div class="pub-head"><span class="pub-kicker">SUARA MASYARAKAT</span><h2>Suara masyarakat menjadi bagian penting</h2><p>Laporan, cerita, keluhan, usulan, dan percakapan warga menjadi bahan untuk memahami kondisi nyata di lapangan.</p></div>
      <div class="pub-feature-grid pub-grid-3">
        ${feature('💬','Suara Warga','Sampaikan masalah, cerita, keluhan, dan usulan dari wilayah Anda.','report','05 · Warga')}
        ${feature('👀','Monitoring','Ikuti masalah yang baru muncul, meningkat, menurun, ramai dibicarakan, atau perlu perhatian.','monitoring','06 · Perubahan')}
        ${feature('💡','Wawasan & Analisis','Lihat pola, hubungan, tren, kemungkinan ke depan, dan perbandingan dalam bahasa yang mudah dipahami.','intelligence','07 · Wawasan')}
      </div>
    </div>

    <div class="pub-section pub-feature-band">
      <div class="pub-split-card">
        <div class="pub-split-image pub-split-map-image"><div class="pub-map-glow"></div><div class="pub-map-label">INDONESIA</div></div>
        <div class="pub-split-copy"><span class="pub-kicker">SATU PETA, SEMUA TINGKAT</span><h2>Lihat masalah berdasarkan tempat</h2><p>Mulai dari Indonesia, turun ke provinsi, kabupaten/kota, kecamatan, desa/kelurahan hingga wilayah paling dekat dengan masyarakat.</p><div class="pub-points"><div><strong>38</strong><span>Provinsi</span></div><div><strong>514</strong><span>Kabupaten/Kota</span></div><div><strong>7.282</strong><span>Kecamatan</span></div><div><strong>83.529</strong><span>Desa/Kelurahan</span></div></div><button class="btn-outline" data-view="map">Jelajahi Peta →</button></div>
      </div>
    </div>

    <div class="pub-section">
      <div class="pub-split-card pub-split-reverse">
        <div class="pub-split-copy"><span class="pub-kicker">DATA YANG TERLACAK</span><h2>Data yang lebih mudah dipahami</h2><p>Angka tidak berdiri sendiri. Informasi publik perlu dilengkapi sumber, waktu, wilayah, perubahan, dan tingkat kepastian agar tidak menyesatkan.</p><div class="pub-checks"><div><b>✓</b><span>Sumber dan asal data</span></div><div><b>✓</b><span>Periode dan wilayah</span></div><div><b>✓</b><span>Perubahan dari waktu ke waktu</span></div><div><b>✓</b><span>Keterbatasan dan tingkat kepastian</span></div></div><button class="btn-outline" data-view="data">Lihat Data & Statistik →</button></div>
        <div class="pub-split-image pub-data-image"><div class="pub-bars"><i style="height:34%"></i><i style="height:55%"></i><i style="height:42%"></i><i style="height:72%"></i><i style="height:64%"></i><i style="height:88%"></i></div><div class="pub-chart-caption">PERUBAHAN DATA</div></div>
      </div>
    </div>

    <div class="pub-section">
      <div class="pub-head"><span class="pub-kicker">DARI PEMAHAMAN KE TINDAKAN</span><h2>Lihat perubahan dan kemungkinan ke depan</h2><p>Setelah masalah dipahami, masyarakat dapat mengikuti perubahan, melihat kemungkinan, membandingkan pilihan, dan menemukan jalan menuju solusi.</p></div>
      <div class="pub-feature-grid pub-grid-3">
        ${feature('📡','Pantau Perubahan','Ikuti perkembangan masalah dan tanda-tanda perubahan yang sudah layak ditampilkan kepada publik.','monitoring','08 · Pantau')}
        ${feature('🔮','Kemungkinan & Perbandingan','Bandingkan perkembangan dan skenario secara hati-hati dengan konteks, bukti, dan batasan yang jelas.','future','09 · Kemungkinan')}
        ${feature('🤝','Solusi & Aksi','Temukan solusi warga, praktik baik, rekomendasi, dan hasil tindakan yang sudah dilakukan.','solutions','10 · Solusi')}
      </div>
    </div>

    <div class="pub-section pub-closing">
      <div class="pub-closing-card"><span class="pub-kicker">INDONESIA PUNYA MASALAH</span><h2>Lihat. Dengarkan. Pahami. Cari solusi.</h2><p>Satu ruang publik untuk memahami masalah Indonesia berdasarkan wilayah, data, suara masyarakat, perubahan, dan tindakan.</p><div class="pub-closing-actions"><button class="btn-primary" data-view="map">Jelajahi Indonesia</button><button class="btn-outline" data-view="report">Sampaikan Masalah</button></div></div>
    </div>`;
  host.appendChild(wrap);
  wrap.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>window.render?.(b.dataset.view)));
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',add); else add();
})();
