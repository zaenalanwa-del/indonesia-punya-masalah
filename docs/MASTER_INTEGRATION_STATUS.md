# MASTER INTEGRATION STATUS

Updated 2026-09-17.

## Current public visual authority
- Latest user-supplied website screenshot is the visual reference for the public homepage.
- Public layout now uses the screenshot's left navigation/sidebar pattern, compact top header, hero, problem cards, category row, map, right-side citizen/statistics rail, and responsive mobile behavior.
- Latest user-supplied NUANSA KITA logo is the identity reference.
- Repository now contains `assets/nuansa-kita-logo.svg` and `assets/nuansa-kita-mark.svg` as production-safe vector identity assets.

## Integrated
- Supabase production core tables and RLS access layer.
- Citizen report POST persistence to `citizen_reports` with `unverified` moderation state.
- Intelligence Fabric additive metadata/lineage layer: dataset versions/fields, lineage, sync jobs/runs, quality checks, canonical entities/aliases, claims/evidence, model registry/evaluations, unknowns.
- Public production aggregation endpoint: `/api/portal-data`.
- `/api/portal-data` now exposes authoritative active geography counts by country/province/regency/district/village.
- Public homepage live binding through `public-functions.js`: geography statistics, published problems, verified citizen reports, early signals, solutions, category cards, citizen rail, and production-status messaging.
- Static/demo problem cards are suppressed when no production records exist; they are not presented as facts.
- `/admin/` now redirects to the canonical authenticated `/admin.html` control center.

## Public product contract
Beranda -> Jelajahi Indonesia -> Masalah -> Data & Statistik -> Suara Warga -> Intelligence -> Solusi -> Lainnya.

Public data must distinguish official/source data, citizen reports, signals, analysis and forecasts. Forecasts are not certainties; unknowns and uncertainty should remain visible.

## Remaining production work
1. Merge remaining archived API/connectors and geography sync code after schema compatibility checks.
2. Replace remote placeholder imagery with the approved binary reference assets where asset tooling permits.
3. Harden remaining database security warnings and audit SECURITY DEFINER functions.
4. Run smoke tests and verify the Vercel deployment before declaring the site fully live.
5. Expand public live rendering to evidence/claims/provenance pages once publication rules are finalized.
