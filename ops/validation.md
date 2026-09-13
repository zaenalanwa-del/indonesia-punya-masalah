# Validation checklist

## Local demo
- `python3 backend/server.py` starts on 127.0.0.1:8787
- `/api/health` returns status ok
- `/api/ask?q=...` returns structured JSON
- browser prototype renders and submits a question

## Database
- PostgreSQL with PostGIS enabled
- Run `db/schema_v2.sql`
- Confirm spatial index exists on `regions.geom`

PostGIS supports storing and querying spatial data inside PostgreSQL, including spatial indexes; the schema uses a GiST spatial index for regions. See the official documentation. 

## Production hardening
- replace demo data with licensed/public connectors
- add authentication/authorization
- use a managed secret store
- add ingestion retries and dead-letter queue
- persist answer/evidence trace
- add model registry and evaluation jobs
- add rate limits and abuse detection
