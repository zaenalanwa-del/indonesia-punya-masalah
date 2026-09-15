# Indonesia Punya Masalah — Master Blueprint Publik

## Prinsip utama
Platform publik hanya menampilkan manfaat, informasi, bukti, perubahan, dan pilihan tindakan yang dipahami masyarakat. Seluruh mesin analitik, AI, pipeline, scoring, orkestrasi, konfigurasi, observability, moderasi internal, dan control center bekerja di belakang layar dan hanya menjadi wilayah admin/operator yang berwenang.

## Formula produk publik
**Lihat → Dengarkan → Buktikan → Pahami → Antisipasi → Bertindak → Ukur → Belajar**

## Objek utama
**MASALAH** adalah objek utama platform. Setiap masalah harus dapat dihubungkan dengan wilayah, waktu, laporan warga, sumber resmi, evidence, pola, penyebab, perubahan, prediksi, solusi, tindakan, dan hasil.

## Siklus hidup masalah
1. Ditemukan
2. Diverifikasi
3. Didukung bukti
4. Dipantau
5. Dipahami
6. Diprediksi bila memenuhi quality gate
7. Ditangani
8. Dievaluasi
9. Selesai / masih berlanjut

Status teknis seperti pipeline, model, job, queue, prompt, scoring internal, dan konfigurasi tidak menjadi bahasa halaman publik.

## Struktur pengalaman publik
### Beranda
Peta ringkas Indonesia, kategori masalah, statistik wilayah, masalah terbaru, tren perubahan, akses cepat untuk laporan warga, dan pengantar solusi.

### Peta Indonesia
Indonesia → Provinsi → Kabupaten/Kota → Kecamatan → Desa/Kelurahan → Dusun.

### Masalah
Terkini, berdasarkan wilayah, nasional, mendesak, dan belum terselesaikan. Setiap detail masalah menampilkan lokasi, waktu, ringkasan, bukti, sumber, tingkat kepastian, perubahan, dan langkah berikutnya.

### Data & Statistik
Angka dan indikator yang dapat ditelusuri ke sumber, periode, wilayah, unit, freshness, dan catatan keterbatasan.

### Suara Warga
Lapor masalah, cerita warga, keluhan, usulan, polling, dan diskusi. Laporan warga adalah bahan bukti/sinyal yang melewati verifikasi; tidak otomatis dianggap fakta.

### Monitoring publik
Masalah baru, meningkat, menurun, ramai dibicarakan, dan peringatan dini yang telah memenuhi kriteria publikasi.

### Wawasan & Analisis
Bahasa publik untuk hasil intelligence: pola, hubungan faktor, tren, kemungkinan ke depan, dan perbandingan. Nama mesin internal tidak ditampilkan.

### Solusi
Solusi warga, praktik baik, pilihan tindakan, rekomendasi berbasis bukti, dan hasil pelaksanaan.

## Kontrak hasil publik
Setiap hasil analisis/data penting, bila relevan, harus menyertakan:
- ringkasan
- sumber dan provenance
- waktu/periode data
- wilayah
- tingkat kepastian
- keterbatasan/ketidakpastian
- perubahan dari waktu ke waktu
- langkah berikutnya

## Aturan bahasa publik
Gunakan istilah seperti **Masalah, Data, Bukti, Suara Warga, Perubahan, Wawasan, Kemungkinan, Solusi, Hasil**.

Jangan menampilkan istilah internal seperti **Data Ocean, Acquisition, Validation Engine, Geo Engine, Problem Engine, Pattern Engine, Causal Engine, Forecast Engine, Scenario Simulator, Solution AI, Accuracy Engine, AI Brain, Control Center, pipeline, job, model registry, orchestrator, prompt, queue, configuration** pada halaman publik.

## Batas fakta
Data resmi, laporan warga, sinyal sosial, opini, analisis, dan prediksi harus dibedakan secara jelas. Sinyal masyarakat atau tren pencarian tidak boleh diperlakukan sebagai fakta tanpa corroboration.

## Arsitektur lapisan
**Publik:** pengalaman dan hasil.

**Layanan:** autentikasi, API, retrieval, reporting, notifikasi, billing, dan permission.

**Intelligence internal:** ingestion, validation, evidence graph, problem/pattern/causal analysis, signal detection, forecast, simulation, solution ranking, accuracy evaluation, dan AI orchestration.

**Admin:** governance, konfigurasi, monitoring sistem, kualitas data, model, moderasi, audit, dan kontrol operasional.

## Prinsip UI
Halaman publik harus bersih, lapang, mudah dipindai, typography besar dan jelas, fokus pada satu manfaat per bagian, serta menghindari kartu teknis berlebihan. Teknologi boleh canggih di belakang layar tanpa harus terlihat canggih di permukaan.
