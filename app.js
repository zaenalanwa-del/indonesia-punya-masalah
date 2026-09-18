(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],modal=$('#modal'),mb=$('#mb');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function openModal(title,html){mb.innerHTML='<h2>'+esc(title)+'</h2>'+html;modal.classList.add('open')}
function closeModal(){modal.classList.remove('open')}
$('#close')?.addEventListener('click',closeModal);modal?.addEventListener('click',e=>{if(e.target===modal)closeModal()});
const content={
map:['Peta Indonesia','<p>Jelajahi sebaran masalah berdasarkan wilayah. Layer dapat dikembangkan menjadi peta interaktif dengan filter provinsi, kategori, tingkat masalah, waktu, dan sumber data.</p><div class="map-area" style="height:260px;background-image:url("/assets/map-reference.svg")"></div>'],
data:['Data & Statistik','<p>Modul statistik menampilkan indikator, periode, sumber, status kualitas data, pembaruan, serta metadata. Data publik harus tetap mencantumkan provenance dan waktu pengambilan.</p><div class="trendItem"><i>▥</i><span>Sumber data resmi dan data warga dipisahkan secara jelas.</span></div><div class="trendItem"><i>✓</i><span>Setiap angka dapat ditelusuri ke dataset dan periode.</span></div>'],
monitor:['Pantau Perubahan','<p>Pantau masalah baru, meningkat, menurun, ramai dibicarakan, dan peringatan berdasarkan data yang tersedia.</p><div class="trendItem"><i>↗</i><span>Perubahan ditampilkan bersama periode dan sumber.</span></div>'],
insights:['Wawasan & Intelligence','<p>Analisis pola, tren, hubungan, penyebab, dan ringkasan wilayah. Hasil analisis tidak menggantikan sumber data dan diberi konteks ketidakpastian.</p>'],
forecast:['Kemungkinan / Future Radar','<p>Perkiraan dan skenario dapat menampilkan horizon, asumsi, model, indikator, evaluasi historis, serta rentang ketidakpastian.</p>'],
solutions:['Solusi','<p>Ruang untuk solusi warga, solusi pemerintah, praktik baik, rekomendasi tindakan, dan evaluasi hasil.</p>'],
about:['Tentang Nuansa Kita','<p>Portal publik untuk melihat masalah, mendengar suara warga, memahami data, memantau perubahan, mengantisipasi kemungkinan, dan mengukur hasil.</p>']
};
function show(k){const v=content[k]||content.about;openModal(v[0],v[1])}
function report(){openModal('Laporkan Masalah','<p>Laporan masuk ke antrean verifikasi sebelum menjadi informasi terverifikasi.</p><form id="rf"><input name="title" required placeholder="Judul masalah"><input name="region_name" placeholder="Kabupaten/Kota, Provinsi"><select name="category"><option>Infrastruktur</option><option>Pendidikan</option><option>Kesehatan</option><option>Lingkungan</option><option>Ekonomi</option><option>Sosial</option></select><textarea name="narrative" required placeholder="Jelaskan apa yang terjadi, sejak kapan, lokasi, dan siapa yang terdampak."></textarea><button class="primary">Kirim Laporan →</button></form>');
$('#rf').onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target).entries());try{const r=await fetch('/api/report',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)}),j=await r.json();if(!r.ok)throw Error();openModal('Laporan Diterima','<p>Laporan telah diteruskan ke antrean verifikasi.</p><p>Nomor laporan: <b>'+esc(j.report_id||'diterima')+'</b></p>')}catch{openModal('Laporan Belum Terkirim','<p>Sistem belum dapat menerima laporan saat ini. Coba kembali beberapa saat lagi.</p>')}}}
const actions={map:()=>show('map'),data:()=>show('data'),report,monitor:()=>show('monitor'),insights:()=>show('insights'),forecast:()=>show('forecast'),solutions:()=>show('solutions'),about:()=>show('about')};
$$('[data-act]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();actions[el.dataset.act]?.()}));
$$('.side-group>button').forEach(btn=>btn.addEventListener('click',()=>btn.parentElement.classList.toggle('open')));
$$('.region').forEach(btn=>btn.addEventListener('click',()=>{$$('.region').forEach(x=>x.classList.remove('active'));btn.classList.add('active');openModal('Jelajahi '+btn.innerText.replace('›','').trim(),'<p>Pilih wilayah lebih lanjut untuk melihat masalah, data, perubahan, dan solusi yang tersedia.</p>')}));
$('#sat')?.addEventListener('click',()=>{$$('.map-switch button').forEach(x=>x.classList.remove('active'));$('#sat').classList.add('active');$('.map-area').style.filter='saturate(.65) brightness(.9)';});
$$('.map-switch button').forEach(b=>b.addEventListener('click',()=>{if(b.id==='sat')return;$$('.map-switch button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('.map-area').style.filter='none'}));
$('#searchForm')?.addEventListener('submit',e=>{e.preventDefault();const q=$('#q').value.trim();if(!q)return;openModal('Pencarian','<p>Permintaan pencarian:</p><p><b>'+esc(q)+'</b></p><p>Hasil akan ditautkan ke masalah, wilayah, data, laporan warga, dan wawasan yang tersedia.</p>')});
$$('.all-link,.latest-head a,.section-head a').forEach(a=>a.addEventListener('click',e=>{const href=a.getAttribute('href');if(href&&href.startsWith('#'))return}));
})();