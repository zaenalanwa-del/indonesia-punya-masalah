(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
function feature(icon,title,text,view,meta=''){return `<article class="pub-feature"><div class="pub-feature-icon">${icon}</div><div class="pub-feature-body"><span>${esc(meta)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p><button class="btn-outline" data-view="${esc(view)}">Buka Fitur →</button></div></article>`}
function add(){
 const home=document.getElementById('home');if(!home||document.getElementById('public-features'))return;
 const wrap=document.createElement('div');wrap.id='public-features';wrap.innerHTML=`
<section class="pub-section pub-overview"><div class="pub-head"><div><span class="eyebrow">FITUR PUBLIK</span><h2>Semua yang Anda perlukan untuk melihat Indonesia lebih jelas</h2><p>Jelajahi wilayah, lihat masalah, baca data, dengarkan suara warga, pahami perkembangan, dan temukan pilihan solusi dalam satu halaman.</p></div></div><div class="pub-feature-grid pub-feature-grid-4">
${feature('⌂','Peta Indonesia','Lihat Indonesia dari tingkat nasional sampai wilayah dan buka peta yang dapat dizoom serta dijelajahi.','map','PETA')}
${feature('◫','Jelajahi Wilayah','Cari provinsi, kabupaten/kota, kecamatan, hingga desa/kelurahan menggunakan registry wilayah.','regions','WILAYAH')}
${feature('⚠','Masalah Indonesia','Temukan masalah berdasarkan kategori, tingkat dampak, status, dan tingkat keyakinan data.','problems','MASALAH')}
${feature('▤','Data & Statistik','Lihat sumber data, dataset, observasi, kualitas, dan informasi yang dapat ditelusuri.','data','DATA')}
</div></section>
<section class="pub-section"><div class="pub-head"><div><span class="eyebrow">PARTISIPASI</span><h2>Suara masyarakat menjadi bagian penting</h2><p>Warga dapat menyampaikan masalah di sekitar mereka. Laporan dapat dilacak dan dipantau sesuai proses verifikasi yang berlaku.</p></div></div><div class="pub-feature-grid pub-feature-grid-3">
${feature('✎','Suara Warga','Kirim cerita, lokasi, kategori, dan uraian masalah dari lingkungan Anda.','report','LAPORAN WARGA')}
${feature('◌','Monitoring','Pantau perubahan, peringatan, dan masalah yang sedang mendapat perhatian.','monitoring','PEMANTAUAN')}
${feature('◎','Intelligence','Baca ringkasan evidence, pola, tren, dan prediksi yang tersedia untuk publik.','intelligence','ANALISIS')}
</div></section>
<section class="pub-section"><div class="pub-split-card"><div class="pub-split-image pub-image-map"><div class="pub-image-label">INDONESIA</div></div><div class="pub-split-copy"><span class="eyebrow">PETA & KONTEKS</span><h2>Lihat masalah berdasarkan tempat</h2><p>Dari Indonesia, provinsi, kabupaten/kota, kecamatan, sampai desa/kelurahan. Pilih wilayah untuk memahami konteks masalah secara lebih dekat.</p><div class="pub-points"><div><b>38</b><span>Provinsi</span></div><div><b>514</b><span>Kabupaten/Kota</span></div><div><b>7.282</b><span>Kecamatan</span></div><div><b>83.529</b><span>Desa/Kelurahan</span></div></div><button class="btn-primary" data-view="regions">Jelajahi Wilayah →</button></div></div></section>
<section class="pub-section"><div class="pub-split-card pub-split-reverse"><div class="pub-split-copy"><span class="eyebrow">DATA TERHUBUNG</span><h2>Data yang lebih mudah dipahami</h2><p>Informasi publik disusun dari sumber, dataset, observasi, masalah, dan laporan sehingga pengguna dapat melihat hubungan antar informasi tanpa harus memahami sistem di belakangnya.</p><div class="pub-checks"><div>✓ Sumber data</div><div>✓ Statistik & indikator</div><div>✓ Status masalah</div><div>✓ Tren & perubahan</div></div><button class="btn-primary" data-view="data">Lihat Data & Statistik →</button></div><div class="pub-split-image pub-image-data"><div class="pub-image-label">DATA</div></div></div></section>
<section class="pub-section"><div class="pub-head"><div><span class="eyebrow">MASA DEPAN</span><h2>Melihat perubahan dan kemungkinan ke depan</h2><p>Fitur publik berikut membantu pembaca memahami apa yang sedang terjadi, kemungkinan perubahan, dan pilihan tindakan yang dapat dipertimbangkan.</p></div></div><div class="pub-feature-grid pub-feature-grid-3">
${feature('⌁','Future Radar','Lihat kemungkinan perubahan berdasarkan horizon, probabilitas, dan confidence yang tersedia.','future','MASA DEPAN')}
${feature('◇','Skenario & Perbandingan','Bandingkan beberapa pilihan tindakan berdasarkan dampak, risiko, biaya, dan hasil yang diharapkan.','solutions','SKENARIO')}
${feature('✓','Solusi & Aksi','Masuk ke ruang solusi untuk melihat pilihan tindakan dan tindak lanjut yang dapat diukur.','solutions','SOLUSI')}
</div></section>
<section class="pub-section pub-closing"><div class="pub-closing-card"><div><span class="eyebrow">INDONESIA PUNYA MASALAH</span><h2>Lihat. Dengarkan. Pahami. Cari solusi.</h2><p>Satu halaman publik untuk menemukan informasi Indonesia dengan cara yang lebih terstruktur dan mudah dipahami.</p></div><div class="pub-closing-actions"><button class="btn-primary" data-view="problems">Lihat Masalah</button><button class="btn-outline" data-view="report">Sampaikan Masalah</button></div></div></section>`;
 home.appendChild(wrap);
 wrap.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>window.render?.(b.dataset.view)));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
})();
