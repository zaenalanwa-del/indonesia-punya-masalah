# INDONESIA PUNYA MASALAH — FINAL PORTAL

## Master visual reference
Gambar referensi terakhir yang diberikan pengguna menjadi acuan visual final UI publik: header horizontal, tanpa sidebar kiri, hero portal, pencarian utama, statistik, laporan warga, jelajah wilayah, peta Indonesia, masalah terbaru, analitik, monitoring, fitur unggulan, dan footer navy.

## Arsitektur permukaan
- `/` — UI Publik utama: Beranda, Peta Indonesia, Masalah, Data & Statistik, Suara Warga, Intelligence, Solusi, dan Lainnya melalui pengalaman publik yang sederhana.
- `/portal.html?section=...` — modul publik dengan shell visual yang konsisten dengan referensi final.
- `/admin.html` — UI Admin terpisah untuk moderasi laporan, data operasional, RBAC, dan pengelolaan internal.

## Prinsip publik
Mesin internal tidak ditampilkan sebagai control center publik. Publik berinteraksi melalui Peta, Wilayah, Masalah, Data, Suara Warga, Pantau Perubahan, Wawasan, Kemungkinan, dan Solusi. Navigasi publik dapat berkembang menjadi menu → submenu → sub-submenu tanpa mengekspos API, engine, pipeline, registry, configuration, atau model registry.

## Data & fondasi
Supabase/PostGIS menjadi fondasi data. Skema inti mencakup regions, citizen_reports, problems, early_signals, forecasts, solutions, evidence, claims, query_runs, knowledge entities/relations, model registry/evaluations, audit logs, RBAC, reports, subscriptions, payments, dan modul operasional lain yang telah tersedia di database.

Laporan warga dari UI publik disimpan ke `citizen_reports` dengan status awal `unverified`. Admin/moderator melakukan verifikasi atau penolakan. Data terverifikasi dapat menjadi bagian dari pengalaman publik sesuai kebijakan publikasi.

## Keamanan
RLS aktif pada tabel inti. Akses admin laporan dibatasi melalui role `admin`, `super_admin`, atau `moderator`. Jangan pernah menaruh service-role secret di repository atau browser. Anti-spam, rate limiting, validasi konten, storage media, dan kebijakan publikasi tetap merupakan lapisan produksi yang harus dijaga.

## Jalankan lokal
```bash
python3 server/server.py
```
Buka `http://127.0.0.1:8787/` atau `http://127.0.0.1:8787/admin.html`.
