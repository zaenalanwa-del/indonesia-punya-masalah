# Indonesia Punya Masalah — Build v2 Vertical Slice

This package turns the Master Architecture into a runnable development starter for the first vertical slice:

User question → intent/location/time → source registry → evidence → confidence → answer → sources → next actions.

## Contents
- `db/schema_v2.sql` — expanded PostgreSQL/PostGIS schema
- `backend/orchestrator.py` — dependency-free demo orchestrator with deterministic sample data
- `backend/server.py` — dependency-free local HTTP API server
- `api/openapi_v2.yaml` — OpenAPI 3.1 API contract
- `sample_data/demo_sources.json` — demo source registry
- `sample_data/demo_observations.json` — demo observations/signals
- `prototype/` — responsive browser prototype connected to the local demo API
- `docs/` — architecture and vertical-slice specification
- `ops/` — runbook and validation checklist

## Run the demo
```bash
python3 backend/server.py
```
Then open `http://127.0.0.1:8787/`.

The demo deliberately uses synthetic data. Replace it with legally accessible production sources through the ingestion layer.
