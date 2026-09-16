-- 004_intelligence_fabric_reconciled.sql
-- Additive intelligence/provenance layer aligned with db/schema_v2.sql.

create table if not exists data_lineage (
  id uuid primary key default gen_random_uuid(),
  upstream_type text not null,
  upstream_id uuid,
  downstream_type text not null,
  downstream_id uuid,
  transformation_name text,
  transformation_version text,
  executed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists sync_jobs (
  id uuid primary key default gen_random_uuid(),
  connector_id text not null unique,
  dataset_id uuid references datasets(id) on delete set null,
  schedule text,
  enabled boolean not null default true,
  last_started_at timestamptz,
  last_success_at timestamptz,
  last_status text,
  last_error text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sync_runs (
  id uuid primary key default gen_random_uuid(),
  sync_job_id uuid not null references sync_jobs(id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running',
  records_seen bigint not null default 0,
  records_inserted bigint not null default 0,
  records_updated bigint not null default 0,
  records_rejected bigint not null default 0,
  quality_score numeric(5,2),
  error_summary text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists data_quality_checks (
  id uuid primary key default gen_random_uuid(),
  dataset_version_id uuid references dataset_versions(id) on delete cascade,
  check_name text not null,
  check_type text not null,
  passed boolean not null,
  score numeric(5,2),
  failure_count bigint not null default 0,
  details jsonb not null default '{}'::jsonb,
  checked_at timestamptz not null default now()
);

create table if not exists canonical_entities (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  canonical_name text not null,
  region_id uuid references regions(id) on delete set null,
  source_authority text,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists entity_aliases (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references canonical_entities(id) on delete cascade,
  source_id uuid references sources(id) on delete set null,
  source_code text,
  source_name text,
  normalized_name text,
  confidence_score numeric(5,2),
  resolution_method text,
  created_at timestamptz not null default now()
);

create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null,
  subject_id uuid,
  predicate text not null,
  object_type text,
  object_value jsonb not null,
  claim_status text not null default 'provisional',
  confidence_score numeric(5,2),
  valid_from timestamptz,
  valid_to timestamptz,
  created_by_model text,
  model_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists claim_evidence (
  claim_id uuid not null references claims(id) on delete cascade,
  evidence_id uuid not null references evidence_items(id) on delete cascade,
  support_type text not null default 'supports',
  weight numeric(8,4),
  primary key (claim_id,evidence_id)
);

create table if not exists query_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  query_text text not null,
  intent jsonb not null default '{}'::jsonb,
  plan jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running',
  confidence_score numeric(5,2),
  answer jsonb,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists query_evidence (
  query_run_id uuid not null references query_runs(id) on delete cascade,
  evidence_id uuid not null references evidence_items(id) on delete cascade,
  rank integer,
  relevance_score numeric(5,2),
  used_in_answer boolean not null default false,
  primary key (query_run_id,evidence_id)
);

create table if not exists model_evaluations (
  id uuid primary key default gen_random_uuid(),
  model_name text not null,
  model_version text not null,
  geography_level text,
  domain text,
  horizon_days integer,
  evaluation_window_start timestamptz,
  evaluation_window_end timestamptz,
  sample_count bigint,
  calibration_score numeric(8,4),
  accuracy_score numeric(8,4),
  error_score numeric(8,4),
  created_at timestamptz not null default now()
);

create table if not exists unknowns (
  id uuid primary key default gen_random_uuid(),
  query_run_id uuid references query_runs(id) on delete cascade,
  region_id uuid references regions(id) on delete set null,
  domain text,
  description text not null,
  reason text not null,
  severity text not null default 'info',
  created_at timestamptz not null default now()
);

create index if not exists idx_data_lineage_downstream on data_lineage(downstream_type,downstream_id);
create index if not exists idx_sync_runs_job on sync_runs(sync_job_id);
create index if not exists idx_quality_checks_version on data_quality_checks(dataset_version_id);
create index if not exists idx_aliases_entity on entity_aliases(entity_id);
create index if not exists idx_claims_subject on claims(subject_type,subject_id);
create index if not exists idx_query_runs_user on query_runs(user_id);
