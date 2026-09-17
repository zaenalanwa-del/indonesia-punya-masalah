# INDONESIA PUNYA MASALAH — MASTER INTEGRATION FINAL

Tanggal: 17 September 2026
Status: canonical integration blueprint

## 1. Satu proyek, bukan kumpulan prototype
Seluruh gagasan dan build yang pernah dibuat untuk proyek Indonesia Punya Masalah diperlakukan sebagai sumber desain/arsitektur yang harus dikonsolidasikan, bukan diganti-ganti secara acak. Arsip build lama dipertahankan untuk traceability dan regression.

Sumber utama yang sudah ditemukan di arsip:
- `IPM_production_v2_source`
- `IPM_reference_final_source`
- `IPM_master_build_integrated`
- `IPM_working_source`
- `reference_extract`
- intelligence fabric SQL
- geography real-sync work
- final/near-100 reference builds
- WASKITA public builds

## 2. FINAL VISUAL AUTHORITY
File: `a3ddef09-c54f-4bac-8296-c84498e8af41.png`.

Public UI wajib mengikuti visual image terakhir: horizontal header, hero landscape, search, category pills, geography statistics, report callout, Jelajahi Indonesia, Peta Indonesia, Masalah Terbaru, problem/category analytics, Tren & Peringatan, data banner, feature panel, and navy footer.

Tidak ada permanent left sidebar pada PUBLIC UI. Sidebar/denser operational layout hanya untuk ADMIN.

## 3. PRODUCT LAYERS
### Public
- Beranda
- Peta Indonesia
- Masalah
- Data & Statistik
- Suara Warga
- Intelligence / Wawasan
- Solusi
- Lainnya

### Service
- Auth
- user profile/workspace
- reporting
- search/retrieval
- notifications
- API
- storage
- permissions
- subscriptions/billing when activated

### Intelligence internal
source → version → normalization → quality → entity/geo/time alignment → evidence → claims/knowledge → problem/pattern analysis → monitoring/signals → forecast/scenario → solution → outcome → learning.

The intelligence fabric already defines dataset versions/fields, lineage, sync jobs/runs, data-quality checks, canonical entities and aliases, claims/evidence links, query runs/evidence, model registry/evaluations, and unknowns.

## 4. DATA OBJECT MODEL
Core objects:
- regions
- data_sources
- datasets
- dataset_versions
- dataset_fields
- observations
- problems
- citizen_reports
- evidence
- claims
- canonical_entities / entity_aliases
- early_signals
- forecasts
- solutions
- query_runs / query_evidence
- profiles / user_roles / roles
- notifications
- audit/governance objects

## 5. GEOGRAPHY
Canonical hierarchy:
Indonesia → Provinsi → Kabupaten/Kota → Kecamatan → Desa/Kelurahan → Dusun/micro area where authoritative data exists.

Existing geography work includes official-code alignment and geometry synchronization. Geometry, source version, geometry hash, sync status, and source timestamps must remain traceable.

## 6. PUBLIC EXPERIENCE
Formula:
**Lihat → Dengarkan → Buktikan → Pahami → Antisipasi → Bertindak → Ukur → Belajar**

Problem detail should be able to connect location, time, citizen reports, official sources, evidence, patterns, change, forecast, solutions, actions, and outcomes.

Important distinction:
- official data ≠ citizen report
- signal ≠ verified fact
- analysis ≠ source observation
- forecast ≠ certainty

## 7. SUARA WARGA
Public reporting enters `citizen_reports` as an unverified citizen signal. It must pass moderation/verification before being treated as verified public evidence. Comments, polling, notifications, and follow-up tracking belong in the same civic participation layer.

## 8. INTELLIGENCE / WASKITA
`WASKITA — Indonesia Punya Masalah` remains the intelligence/future-layer concept from the earlier project work. Public pages should translate its capabilities into human language such as Wawasan, Kemungkinan, Perubahan, Bukti, and Solusi rather than exposing internal engine names.

Potential intelligence capabilities already specified across the project:
- structured question answering;
- evidence/provenance;
- confidence and conflict handling;
- trend/change monitoring;
- early signals;
- future radar and scenarios;
- prediction ledger and historical evaluation;
- unknowns tracking;
- entity resolution and knowledge graph;
- source/dataset quality and lineage.

## 9. ADMIN
`/admin.html` and `/admin/` are separate operational surfaces. Admin includes:
- dashboard/KPI;
- citizen-report review;
- problem queue;
- data health;
- geography sync;
- source/dataset management;
- intelligence operations;
- RBAC;
- governance/audit;
- business/finance when enabled.

Admin may use a dense sidebar/control-center visual; this must never leak into the public visual shell.

## 10. CONNECTORS
The archived production builds contain integration points for:
- BNPB / Satu Data Bencana / DIBI;
- BMKG weather;
- BPS Web API;
- data.go.id discovery/catalog;
- BIG geography.

Connector activation must respect credentials, terms, attribution, licensing, rate limits, and provenance. A connector error must be visible in Data Health rather than silently generating replacement facts.

## 11. PRODUCTION RULES
- No invented national statistics.
- Demo/sample data stays test/archive only.
- Never expose secret/service-role keys in browser or repository.
- Preserve source, timestamp, version, quality, confidence, and uncertainty.
- Restricted/personal data stays restricted.
- Public publication requires explicit verification/publishing rules.
- Forecasts show assumptions, horizon, uncertainty, and evaluation where available.

## 12. BUILD PRIORITY
1. Lock final public visual.
2. Consolidate archived production source without losing current functionality.
3. Wire public modules to live Supabase views/endpoints.
4. Complete report → moderation → verified evidence path.
5. Wire real region geometry and map layers.
6. Activate source connectors with credentials/licensing.
7. Activate evidence/knowledge/intelligence pipeline.
8. Activate Wawasan/Kemungkinan/Solusi public views.
9. Complete admin governance, data health, RBAC and audit.
10. Run smoke tests and verify Vercel production deployment.

This document is the consolidation contract for future edits: extend the system without changing the final public visual reference or discarding prior project capabilities.
