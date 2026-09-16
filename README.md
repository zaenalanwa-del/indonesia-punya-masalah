# INDONESIA PUNYA MASALAH — REAL UI BUILD v4

## MASTER VISUAL REFERENCE — AKTIF

Gambar dashboard yang diberikan pengguna dan dicatat pada `docs/REFERENCE_UI.md` adalah **master acuan tampilan website saat ini**.

Aturan utama: revisi UI publik harus mengikuti gambar tersebut sedekat mungkin pada komposisi, sidebar kiri, header bersih, hero, kartu, grid, tipografi, spacing, peta, feed masalah, suara warga, monitoring, intelligence, dan solusi.

## Permukaan aplikasi

- `/` — **UI Publik utama**: dashboard nasional, peta, masalah, data & statistik, suara warga, monitoring, intelligence, NOW/WHY/THEN/ACTION, future radar, dan solusi.
- `/portal.html?section=...` — ruang modul publik dengan shell visual yang sama.
- `/admin.html` dan `/admin/` — **UI Admin / Control Center**: problem queue, human review, data health, intelligence pipeline, geography sync, RBAC, finance, dan governance.

## Fitur publik yang sudah dikembangkan pada UI

- Navigasi sidebar bertingkat.
- Pencarian dan filter masalah.
- Jelajah wilayah dan kategori.
- Peta Indonesia dengan layer Masalah/Data, pin, legenda, dan zoom.
- Feed masalah terbaru.
- Kartu statistik nasional sebagai struktur portal.
- Form laporan warga dan status penerimaan/review.
- Modul Data & Statistik dengan tab nasional, wilayah, sumber, dan metodologi.
- Modul Intelligence dengan Evidence/Provenance, Monitoring, Sinyal Dini, Future Radar, Prediction Ledger, dan Ask Indonesia.
- Modul Solusi, kolaborasi, outcome, dan dampak.
- Modul Transparansi, Dokumentasi, API & Data, dan Metodologi.
- Responsive desktop, tablet, dan mobile.

## Prinsip data

UI boleh terisi agar struktur dan pengalaman pengguna dapat dikembangkan, tetapi **data contoh tidak boleh dipresentasikan sebagai fakta nasional produksi**. Status, provenance, evidence, confidence, unknown, conflict, dan waktu observasi harus tetap dibedakan.

## Fondasi produksi

1. Supabase/PostGIS dan schema inti.
2. Auth + RBAC.
3. Geography resmi dan sinkronisasi.
4. Connector data resmi sesuai akses/lisensi.
5. Storage foto/video laporan warga.
6. Human review queue.
7. Renderer peta real dengan geometry wilayah.
8. Observability, secrets, CI/CD, dan deployment.

## Jalankan lokal

```bash
python3 server/server.py
```

Buka `http://127.0.0.1:8787/` atau `http://127.0.0.1:8787/admin.html`.
