# INDONESIA PUNYA MASALAH — REAL UI BUILD

UI utama sekarang dipisahkan jelas menjadi dua permukaan:

- `/` — **UI Publik**: masalah, peta, data & statistik, suara warga, perubahan, wawasan, kemungkinan, dan solusi.
- `/admin.html` dan `/admin/` — **UI Admin / Control Center**: problem queue, human review, data health, intelligence pipeline, geography sync, RBAC, finance, dan governance.

## Prinsip arsitektur
UI publik tidak menampilkan mesin internal secara mentah. Klaim dan jawaban produksi harus memiliki provenance, evidence, confidence, status, dan penanganan unknown/conflict. Struktur data dan intelligence fabric sebelumnya tetap dipertahankan sebagai fondasi backend.

## Jalankan lokal
```bash
python3 server/server.py
```
Buka `http://127.0.0.1:8787/` atau `http://127.0.0.1:8787/admin.html`.

## Production wiring
1. Supabase/PostGIS dan schema inti.
2. Auth + RBAC.
3. Geography resmi dan sinkronisasi.
4. Connector data resmi sesuai akses/lisensi.
5. Storage foto/video laporan warga.
6. Human review queue.
7. Renderer peta real dengan geometry wilayah.
8. Observability, secrets, CI/CD, dan deployment.

**Catatan:** angka dan isi kartu pada UI adalah data demo/placeholder sampai source produksi diaktifkan.
