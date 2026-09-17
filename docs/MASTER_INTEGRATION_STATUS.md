# MASTER INTEGRATION STATUS

Updated 2026-09-17.

## Integrated
- Final public visual direction: horizontal header, no permanent public sidebar.
- Supabase production core tables and RLS access layer.
- Citizen report POST persistence to `citizen_reports` with `unverified` moderation state.
- Intelligence Fabric additive metadata/lineage layer: dataset versions/fields, lineage, sync jobs/runs, quality checks, canonical entities/aliases, claims/evidence, model registry/evaluations, unknowns.
- Public production aggregation endpoint: `/api/portal-data`.

## Public product contract
Beranda -> Peta Indonesia -> Masalah -> Data & Statistik -> Suara Warga -> Intelligence -> Solusi -> Lainnya.

Public data must distinguish official/source data, citizen reports, signals, analysis and forecasts. Forecasts are not certainties; unknowns and uncertainty should remain visible.

## Remaining integration work
1. Replace remaining static/demo homepage cards with `/api/portal-data` rendering where appropriate.
2. Consolidate `/admin.html` and `/admin/` into one canonical admin implementation.
3. Merge remaining archived API/connectors and geography sync code after schema compatibility checks.
4. Integrate reference image assets into the repository where binary asset tooling permits.
5. Harden remaining database security warnings and audit SECURITY DEFINER functions.
6. Run smoke tests and verify the Vercel deployment before declaring the site fully live.
