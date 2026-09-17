# MASTER INTEGRATION STATUS

Updated 2026-09-17.

## Current public visual authority
- Latest user-supplied website screenshot is the visual reference for the public homepage.
- Public layout uses the screenshot's left navigation/sidebar pattern, compact top header, hero, problem cards, category row, map, right-side citizen/statistics rail, and responsive mobile behavior.
- Latest user-supplied NUANSA KITA logo is the identity reference.
- Repository contains `assets/nuansa-kita-logo.svg` and `assets/nuansa-kita-mark.svg` as production-safe vector identity assets.

## Integrated
- Supabase production core tables and RLS access layer.
- Authoritative active geography: 1 country, 38 provinces, 514 regencies/cities, 7,282 districts, 83,529 villages/kelurahan.
- Citizen report POST persistence to `citizen_reports` with `unverified` moderation state.
- Intelligence Fabric additive metadata/lineage layer: dataset versions/fields, lineage, sync jobs/runs, quality checks, canonical entities/aliases, claims/evidence, model registry/evaluations, unknowns.
- Public production aggregation endpoint: `/api/portal-data`.
- Public homepage live binding through `public-functions.js`: geography statistics, published problems, verified citizen reports, early signals, solutions, category cards, citizen rail, and production-status messaging.
- Static/demo problem cards are suppressed when no production records exist; they are not presented as facts.
- `/admin/` redirects to the canonical authenticated `/admin.html` control center.
- Official source registry now includes BNPB and BIG alongside BMKG, BPS, and Satu Data Indonesia.
- Dataset/sync-job registry now has controlled connector definitions for BNPB catalog, BMKG weather, BIG boundaries, and credentialed BPS statistics.
- `/api/data-sources` exposes active source metadata for public provenance views.
- `/api/bmkg` provides a constrained BMKG weather proxy with required attribution.
- `/api/big-boundary` provides a constrained BIG administrative-boundary proxy with attribution and input validation.
- Custom SECURITY DEFINER geometry ingestion/update functions have had anonymous/authenticated EXECUTE privileges revoked.
- Latest GitHub commit has a successful Vercel status check.

## Public product contract
Beranda -> Jelajahi Indonesia -> Masalah -> Data & Statistik -> Suara Warga -> Intelligence -> Solusi -> Lainnya.

Public data must distinguish official/source data, citizen reports, signals, analysis and forecasts. Forecasts are not certainties; unknowns and uncertainty should remain visible.

## Production source notes
- BMKG open weather data provides village/kelurahan forecasts and requires BMKG attribution.
- BPS Web API requires registration/credentialing before production ingestion.
- BNPB disaster datasets are discoverable through Satu Data Indonesia/data.go.id.
- BIG geospatial services expose official administrative layers and GeoJSON-capable services.

## Remaining production work
1. Wire scheduled/admin-triggered connector execution into `sync_runs` with validation, checksums, rejection counts, and provenance evidence.
2. Replace remaining remote placeholder imagery with approved binary reference assets where asset tooling permits.
3. Finish security review of remaining public database warnings and non-custom PostGIS SECURITY DEFINER functions.
4. Add evidence/claims/provenance detail views to public problem and intelligence pages.
5. Run endpoint smoke tests against the deployed Vercel URL and verify production environment variables before declaring full production readiness.
