(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const previousRender=window.render;
function home(){
 const host=document.getElementById('home'); if(!host)return;
 host.innerHTML=`
 <div class="clean-home">
  <section class="clean-hero">
   <div class="clean-hero-copy">
    <span class="clean-eyebrow">PORTAL DATA & ASPIRASI PUBLIK</span>
    <h1>WASKITA —<br>Indonesia Punya Masalah</h1>
    <p>Lihat masalah Indonesia dari tingkat desa hingga nasional, pahami datanya, dan ikuti perkembangannya.</p>
    <form class="clean-search" id="cleanSearch"><span>⌕</span><input id="cleanQuestion" placeholder="Cari masalah, daerah, desa, kecamatan, atau topik…" autocomplete="off"><button type="submit">Cari</button></form>
   </div>
   <div class="clean-garuda" role="img" aria-label="Garuda IKN"></div>
  </section>

  <section class="clean-stats" aria-label="Ringkasan wilayah Indonesia">
   <article><b>38</b><strong>Provinsi</strong><span>Seluruh Indonesia</span></article>
   <article><b>514</b><strong>Kabupaten/Kota</strong><span>Seluruh Indonesia</span></article>
   <article><b>7.282</b><strong>Kecamatan</strong><span>Seluruh Indonesia</span></article>
   <article><b>83.529</b><strong>Desa/Kelurahan</strong><span>Seluruh Indonesia</span></article>
  </section>

  <section class="clean-section">
   <div class="clean-section-head"><div><span>JELAJAHI INDONESIA</span><h2>Mulai dari wilayah Anda</h2><p>Pilih tingkat wilayah untuk melihat masalah, data, dan laporan warga.</p></div></div>
   <div class="clean-hierarchy">
    <button data-view="map"><i>🇮🇩</i><b>Indonesia</b><span>›</span></button>
    <button data-view="regions"><i>▦</i><b>Provinsi</b><span>›</span></button>
    <button data-view="regions"><i>▦</i><b>Kabupaten/Kota</b><span>›</span></button>
    <button data-view="regions"><i>▦</i><b>Kecamatan</b><span>›</span></button>
    <button data-view="regions"><i>⌂</i><b>Desa/Kelurahan</b><span>›</span></button>
   </div>
  </section>

  <section class="clean-two-col">
   <article class="clean-panel clean-map-card"><div class="clean-panel-head"><div><span>PETA INDONESIA</span><h2>Lihat kondisi wilayah</h2></div><button data-view="map" class="clean-link">Buka peta →</button></div><div class="clean-map-placeholder"><div class="clean-map-dots">Indonesia</div><p>Peta interaktif tersedia untuk menjelajahi wilayah dan masalah.</p></div></article>
   <article class="clean-panel clean-report-card"><span>SUARA WARGA</span><h2>Ada masalah di sekitar Anda?</h2><p>Kirim laporan warga. Laporan akan melalui proses verifikasi sebelum menjadi informasi publik.</p><button data-view="report" class="clean-primary">Laporkan Sekarang →</button></article>
  </section>

  <section class="clean-section">
   <div class="clean-section-head"><div><span>MASALAH TERBARU</span><h2>Yang sedang terjadi</h2></div><button data-view="problems" class="clean-link">Lihat semua →</button></div>
   <div class="clean-issues">
    <button data-view="problems"><i>🛣️</i><div><b>Jalan Rusak di Desa Sumberrejo</b><span>Kab. Wonogiri, Jawa Tengah</span></div><em>Infrastruktur</em></button>
    <button data-view="problems"><i>🛒</i><div><b>Harga Sembako Terus Naik</b><span>Kota Makassar, Sulawesi Selatan</span></div><em>Ekonomi</em></button>
    <button data-view="problems"><i>🏫</i><div><b>Akses Pendidikan Terbatas</b><span>Kab. Nias Barat, Sumatera Utara</span></div><em>Pendidikan</em></button>
    <button data-view="problems"><i>🌧️</i><div><b>Banjir di Permukiman Warga</b><span>Kota Semarang, Jawa Tengah</span></div><em>Lingkungan</em></button>
   </div>
  </section>

  <section class="clean-two-col clean-lower">
   <article class="clean-panel"><div class="clean-panel-head"><div><span>KATEGORI</span><h2>Masalah berdasarkan bidang</h2></div><button data-view="problems" class="clean-link">Semua kategori →</button></div><div class="clean-cats"><button data-view="problems">Ekonomi <b>28,4%</b></button><button data-view="problems">Sosial <b>22,7%</b></button><button data-view="problems">Kesehatan <b>16,3%</b></button><button data-view="problems">Pendidikan <b>12,6%</b></button><button data-view="problems">Infrastruktur</button><button data-view="problems">Lingkungan</button></div></article>
   <article class="clean-panel"><div class="clean-panel-head"><div><span>TREN & PERINGATAN</span><h2>Perubahan yang perlu diperhatikan</h2></div><button data-view="monitoring" class="clean-link">Buka pantauan →</button></div><ul class="clean-alerts"><li><b>●</b> Masalah kemiskinan meningkat di sejumlah provinsi</li><li><b>●</b> Daerah rawan banjir perlu dipantau</li><li><b>●</b> Tren harga pangan mengalami kenaikan</li><li><b>●</b> Pembangunan infrastruktur terus berubah</li></ul></article>
  </section>

  <section class="clean-info"><div><span>DATA YANG DAPAT DITELUSURI</span><h2>Lihat. Pahami. Antisipasi.</h2><p>WASKITA menghubungkan data wilayah, masalah, sumber informasi, dan suara warga dalam satu pengalaman publik yang sederhana.</p></div><button data-view="data" class="clean-primary">Jelajahi Data & Statistik →</button></section>
 </div>`;
 wire();
 const form=document.getElementById('cleanSearch');
 form?.addEventListener('submit',e=>{e.preventDefault();const q=document.getElementById('cleanQuestion')?.value.trim();if(q)window.render?.('result',q)});
}
function wire(){document.querySelectorAll('#home [data-view]').forEach(b=>{b.onclick=()=>window.render?.(b.dataset.view)});try{window.lucide?.createIcons()}catch{}}
window.render=async function(v,x=''){if(v==='home'){home();window.scrollTo({top:0,behavior:'smooth'});return}if(typeof previousRender==='function')return previousRender(v,x)};
document.addEventListener('DOMContentLoaded',home);
})();
