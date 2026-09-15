# Indonesia Punya Masalah — Product UI v3

## Product shell
The platform is designed as a public portal + intelligence dashboard. The user-facing flow is:

`Lihat masalah → dengarkan manusia → kumpulkan data → pahami penyebab → kumpulkan pola → lihat perubahan → prediksi kemungkinan → cari solusi → ukur hasil → terus belajar.`

## Navigation hierarchy
- Beranda
- Peta Indonesia
  - Indonesia
  - Provinsi
  - Kabupaten/Kota
  - Kecamatan
  - Desa/Kelurahan
  - Dusun
- Masalah
  - Terkini
  - Daerah
  - Nasional
  - Mendesak
  - Belum Terselesaikan
- Data & Statistik
  - Dashboard Nasional
  - Provinsi
  - Kabupaten/Kota
  - Kecamatan
  - Desa/Kelurahan
- Suara Masyarakat
  - Laporkan Masalah
  - Cerita Warga
  - Keluhan
  - Usulan Solusi
  - Polling
  - Diskusi
- Monitoring
  - Masalah Baru
  - Membesar
  - Menurun
  - Viral
  - Early Warning
- Intelligence
  - Pattern AI
  - Causal Analysis
  - Trend & Signal
  - Future Radar
  - Forecast
  - Scenario Simulator
  - Solution AI
- Solusi
  - Solusi Warga
  - Solusi Pemerintah
  - Praktik Terbaik
  - Rekomendasi AI
  - Evaluasi Solusi
- Control Center
- Akun

## Intelligence result contract
Every production intelligence result should expose:
1. Summary
2. Evidence and source provenance
3. Freshness
4. Confidence
5. Uncertainty / limitations
6. Geographic scope
7. Time horizon
8. Recommended next actions
9. Outcome measurement

## Build sequence
1. UI shell and navigation.
2. Live PostGIS map + hierarchical drill-down.
3. Problem and citizen-report workflow.
4. Source registry + evidence layer.
5. Monitoring, signals, trends.
6. Pattern and causal analysis.
7. Forecast and scenario simulator with quality gates.
8. Solution ranking + outcome tracking.
9. Accuracy / evaluation feedback loop.
10. AI Brain continuous learning with provenance and governance.

## Trust rule
Current prototype values are interface examples. They must not be presented as real-world facts until backed by validated production sources.
