# Production Sync Engine

## What is live in the codebase

`/api/sync` is a protected production connector runner. It records each execution in `sync_runs`, retrieves official-source payloads, computes SHA-256 checksums, records validation results in `data_quality_checks`, registers dataset versions in `dataset_versions`, and creates source-backed `evidence` records. A failed or invalid retrieval is not published into the public problem/intelligence tables.

Supported connectors:

- `bnpb_catalog` — official BNPB CKAN catalog metadata from `data.bnpb.go.id`.
- `bmkg_weather` — BMKG village/kelurahan forecast retrieval for explicitly configured `adm4` codes.
- `big_boundaries` — BIG administrative boundary retrieval through the official geoservice.
- `bps_statistics` — BPS Web API retrieval when `BPS_API_KEY` is configured; otherwise the run is recorded as `blocked`, not as successful ingestion.

## Required Vercel environment variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only; never expose to the browser.
- `CRON_SECRET` — protects scheduled execution.
- `SYNC_ADMIN_KEY` — protects manual connector execution.
- `BPS_API_KEY` — optional until BPS access is configured.

The Vercel production cron calls `/api/sync-cron` once daily at 03:30 UTC. That fixed entrypoint runs the BNPB catalog and BIG boundary retrievals. BMKG and BPS remain manually triggerable until their required configuration is complete.

Vercel Cron invokes the production function using an HTTP GET request, and `CRON_SECRET` can be used to secure the invocation. See the official Vercel Cron documentation for current configuration and security behavior.

## Manual trigger

With `SYNC_ADMIN_KEY` configured, call:

`GET /api/sync?connector=bnpb_catalog`

or:

`GET /api/sync?connector=bnpb_catalog,big_boundaries`

Send the key as `x-sync-key`. Do not put secrets in query strings.

## Data honesty contract

The sync engine distinguishes retrieval from publication. A successful source fetch creates a provenance/version record, but does not automatically manufacture or publish public problem statistics. Domain-table publication requires a connector-specific normalization step and validation against the target schema.
