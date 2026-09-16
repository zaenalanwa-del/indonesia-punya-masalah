# Supabase migration order

Use the existing canonical schema first:

1. `db/schema_v2.sql`
2. `supabase/migrations/004_intelligence_fabric_reconciled.sql`
3. `supabase/migrations/003_geography_ingest_reconciled.sql`

The reconciled migrations intentionally match the current `regions`, `sources`, `evidence_items`, and `dataset_versions` tables. Do not apply older incompatible copies that redefine those tables with different column names.
