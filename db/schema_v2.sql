CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  display_name TEXT,
  role_code TEXT NOT NULL DEFAULT 'free',
  locale TEXT NOT NULL DEFAULT 'id-ID',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS roles (
  code TEXT PRIMARY KEY,
  description TEXT NOT NULL
);
INSERT INTO roles(code, description) VALUES
 ('guest','Unauthenticated/public visitor'),
 ('free','Registered free user'),
 ('premium','Premium individual'),
 ('pro','Professional analyst'),
 ('business','Business user'),
 ('institution','Institution workspace member'),
 ('developer','API developer'),
 ('moderator','Human review/moderation'),
 ('admin','Platform administrator')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES regions(id),
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('country','province','city','district','village','hamlet','micro')),
  aliases JSONB NOT NULL DEFAULT '[]'::jsonb,
  geom GEOMETRY(MULTIPOLYGON,4326),
  centroid GEOMETRY(POINT,4326),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS regions_geom_gix ON regions USING GIST(geom);

CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  publisher TEXT,
  source_type TEXT NOT NULL,
  access_level TEXT NOT NULL CHECK (access_level IN ('public','licensed','restricted','private')),
  license_note TEXT,
  base_url TEXT,
  reliability_score NUMERIC(5,2),
  active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit TEXT,
  schema_version TEXT,
  data_version TEXT,
  observed_from TIMESTAMPTZ,
  observed_to TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ,
  freshness_score NUMERIC(5,2),
  completeness_score NUMERIC(5,2),
  consistency_score NUMERIC(5,2),
  quality_score NUMERIC(5,2),
  provenance_uri TEXT,
  license_status TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dataset_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  version_label TEXT NOT NULL,
  checksum TEXT,
  row_count BIGINT,
  schema_hash TEXT,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  storage_uri TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(dataset_id, version_label)
);

CREATE TABLE IF NOT EXISTS observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id),
  dataset_version_id UUID REFERENCES dataset_versions(id),
  region_id UUID REFERENCES regions(id),
  observed_at TIMESTAMPTZ,
  metric TEXT NOT NULL,
  value_numeric NUMERIC,
  value_text TEXT,
  unit TEXT,
  source_confidence NUMERIC(5,2),
  quality_score NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'active',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS observations_lookup_idx ON observations(metric, region_id, observed_at DESC);

CREATE TABLE IF NOT EXISTS human_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  region_id UUID REFERENCES regions(id),
  category TEXT,
  title TEXT,
  narrative TEXT,
  occurred_at TIMESTAMPTZ,
  classification TEXT,
  verification_status TEXT NOT NULL DEFAULT 'received',
  evidence_strength NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id),
  region_id UUID REFERENCES regions(id),
  platform TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  topic TEXT,
  published_at TIMESTAMPTZ,
  volume NUMERIC,
  velocity NUMERIC,
  sentiment_hint NUMERIC,
  content_fingerprint TEXT,
  access_uri TEXT,
  trust_score NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'signal',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS social_signals_region_time_idx ON social_signals(region_id, published_at DESC);

CREATE TABLE IF NOT EXISTS evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id),
  report_id UUID REFERENCES human_reports(id),
  observation_id UUID REFERENCES observations(id),
  social_signal_id UUID REFERENCES social_signals(id),
  evidence_type TEXT NOT NULL,
  captured_at TIMESTAMPTZ,
  content_hash TEXT,
  trust_score NUMERIC(5,2),
  notes TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES regions(id),
  title TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'detected',
  first_detected_at TIMESTAMPTZ,
  last_observed_at TIMESTAMPTZ,
  confidence NUMERIC(5,2),
  impact_score NUMERIC(5,2),
  dna JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS problem_evidence (
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  evidence_id UUID NOT NULL REFERENCES evidence_items(id) ON DELETE CASCADE,
  relation TEXT NOT NULL DEFAULT 'supports',
  PRIMARY KEY(problem_id, evidence_id)
);

CREATE TABLE IF NOT EXISTS knowledge_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  canonical_name TEXT NOT NULL,
  canonical_key TEXT UNIQUE NOT NULL,
  region_id UUID REFERENCES regions(id),
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES knowledge_entities(id),
  predicate TEXT NOT NULL,
  object_id UUID NOT NULL REFERENCES knowledge_entities(id),
  confidence NUMERIC(5,2),
  evidence_id UUID REFERENCES evidence_items(id),
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS early_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES regions(id),
  title TEXT NOT NULL,
  category TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  magnitude NUMERIC,
  confidence NUMERIC(5,2),
  status TEXT NOT NULL DEFAULT 'monitoring',
  evidence_summary JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS model_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  version TEXT NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  performance JSONB NOT NULL DEFAULT '{}'::jsonb,
  limitations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(model_name, version)
);

CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL,
  target_id UUID,
  horizon_days INT NOT NULL,
  predicted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  scenario JSONB NOT NULL DEFAULT '{}'::jsonb,
  probability NUMERIC(6,4),
  confidence NUMERIC(5,2),
  model_id UUID REFERENCES model_registry(id),
  outcome_status TEXT NOT NULL DEFAULT 'pending',
  outcome_value NUMERIC,
  evaluated_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS prediction_evidence (
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  evidence_id UUID NOT NULL REFERENCES evidence_items(id) ON DELETE CASCADE,
  PRIMARY KEY(prediction_id, evidence_id)
);

CREATE TABLE IF NOT EXISTS answer_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  question TEXT NOT NULL,
  intent JSONB NOT NULL DEFAULT '{}'::jsonb,
  retrieval_plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  answer JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC(5,2),
  model_version TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS answer_evidence (
  answer_run_id UUID NOT NULL REFERENCES answer_runs(id) ON DELETE CASCADE,
  evidence_id UUID NOT NULL REFERENCES evidence_items(id),
  relation TEXT NOT NULL DEFAULT 'supports',
  PRIMARY KEY(answer_run_id, evidence_id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  plan_code TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT,
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  purpose TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_tx_id TEXT UNIQUE,
  gross_amount NUMERIC(18,2) NOT NULL,
  fee_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  refund_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(18,2),
  status TEXT NOT NULL,
  paid_at TIMESTAMPTZ,
  raw_event JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  placement TEXT,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  budget NUMERIC(18,2),
  creative JSONB NOT NULL DEFAULT '{}'::jsonb,
  targeting JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  report_type TEXT NOT NULL,
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'queued',
  output_uri TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  before_json JSONB,
  after_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  aggregate_type TEXT,
  aggregate_id UUID,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
