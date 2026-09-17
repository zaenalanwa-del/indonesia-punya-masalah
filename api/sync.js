import crypto from 'node:crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gfggmkeucgqkkyvummpu.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const SYNC_ADMIN_KEY = process.env.SYNC_ADMIN_KEY;

const SOURCES = {
  bnpb_catalog: {
    datasetCode: 'bnpb_disaster_events',
    fetch: async () => {
      const url = 'https://data.bnpb.go.id/api/3/action/package_search?q=bencana%20indonesia&rows=50';
      const r = await fetch(url, { headers: { Accept: 'application/json' } });
      const data = await r.json();
      if (!r.ok || data?.success !== true || !data?.result) throw new Error(`BNPB catalog HTTP ${r.status}`);
      return {
        sourceUrl: url,
        payload: data,
        recordsSeen: Number(data.result.count || 0),
        validation: {
          success: data.success === true,
          hasResult: Boolean(data.result),
          datasetsReturned: Array.isArray(data.result.results) ? data.result.results.length : 0
        }
      };
    }
  },
  bmkg_weather: {
    datasetCode: 'bmkg_weather_forecast',
    fetch: async ({ config }) => {
      const adm4 = Array.isArray(config?.adm4) ? config.adm4.filter(v => /^\d{2}\.\d{2}\.\d{2}\.\d{4}$/.test(String(v))) : [];
      if (!adm4.length) throw new Error('BMKG membutuhkan config.adm4 berisi kode desa/kelurahan level-IV');
      const results = [];
      for (const code of adm4.slice(0, 50)) {
        const url = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${encodeURIComponent(code)}`;
        const r = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!r.ok) throw new Error(`BMKG ${code} HTTP ${r.status}`);
        const data = await r.json();
        results.push({ adm4: code, data });
      }
      return {
        sourceUrl: 'https://data.bmkg.go.id/prakiraan-cuaca/',
        payload: results,
        recordsSeen: results.reduce((n, x) => n + (Array.isArray(x.data?.data) ? x.data.data.length : 1), 0),
        validation: {
          requestedAdm4: adm4.length,
          fetchedAdm4: results.length,
          allSuccessful: results.length === Math.min(adm4.length, 50)
        }
      };
    }
  },
  big_boundaries: {
    datasetCode: 'big_administrative_boundaries',
    fetch: async () => {
      const params = new URLSearchParams({
        where: '1=1',
        outFields: 'NAMOBJ,FCODE,REMARK',
        returnGeometry: 'true',
        outSR: '4326',
        f: 'geojson',
        resultRecordCount: '50'
      });
      const url = `https://geoservices.big.go.id/gis/rest/services/DISIGT/BatasWilayah/MapServer/0/query?${params}`;
      const r = await fetch(url, { headers: { Accept: 'application/geo+json,application/json' } });
      const data = await r.json();
      if (!r.ok || data?.type !== 'FeatureCollection' || !Array.isArray(data?.features)) throw new Error(`BIG geoservice HTTP ${r.status}`);
      const geometryCount = data.features.filter(f => f && f.geometry).length;
      return {
        sourceUrl: url,
        payload: data,
        recordsSeen: data.features.length,
        validation: { featureCollection: true, geometryCount, allHaveGeometry: geometryCount === data.features.length }
      };
    }
  },
  bps_statistics: {
    datasetCode: 'bps_official_statistics',
    fetch: async () => {
      const key = process.env.BPS_API_KEY;
      if (!key) return { blocked: true, reason: 'BPS_API_KEY belum dikonfigurasi', sourceUrl: 'https://webapi.bps.go.id/' };
      const url = `https://webapi.bps.go.id/v1/api/list/model/data/lang/ind/domain/0000/key/${encodeURIComponent(key)}`;
      const r = await fetch(url, { headers: { Accept: 'application/json' } });
      const data = await r.json();
      if (!r.ok || data?.status !== 'OK') throw new Error(`BPS API HTTP ${r.status}`);
      return {
        sourceUrl: url.replace(encodeURIComponent(key), '[redacted]'),
        payload: data,
        recordsSeen: Array.isArray(data?.data?.data) ? data.data.data.length : 0,
        validation: { status: data.status === 'OK' }
      };
    }
  }
};

const jsonHeaders = () => ({ apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' });

async function sb(path, options = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...options, headers: { ...jsonHeaders(), ...(options.headers || {}) } });
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${typeof data === 'string' ? data : data?.message || data?.hint || 'request failed'}`);
  return data;
}

function sha256(value) {
  return crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
}

function isAuthorized(req) {
  const auth = String(req.headers.authorization || '');
  const cron = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const adminKey = String(req.headers['x-sync-key'] || '');
  return Boolean((CRON_SECRET && cron === CRON_SECRET) || (SYNC_ADMIN_KEY && adminKey === SYNC_ADMIN_KEY));
}

async function getJob(connectorId) {
  const rows = await sb(`sync_jobs?select=id,connector_id,dataset_id,schedule,enabled,config&id=eq.${encodeURIComponent(connectorId)}&limit=1`);
  return Array.isArray(rows) ? rows[0] : null;
}

async function createRun(jobId) {
  const rows = await sb('sync_runs', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ sync_job_id: jobId, started_at: new Date().toISOString(), status: 'running', records_seen: 0, records_inserted: 0, records_updated: 0, records_rejected: 0, metadata: { engine: '2026.09', execution: 'vercel_function' } })
  });
  return rows?.[0] || rows;
}

async function finishRun(runId, patch) {
  return sb(`sync_runs?id=eq.${encodeURIComponent(runId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ ...patch, finished_at: new Date().toISOString() }) });
}

async function updateJob(jobId, patch) {
  return sb(`sync_jobs?id=eq.${encodeURIComponent(jobId)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch) });
}

async function registerVersion(job, connectorId, fetched, status) {
  const versionLabel = new Date().toISOString().replace(/[:.]/g, '-');
  const checksum = sha256(fetched.payload || fetched.reason || 'blocked');
  const schemaChecksum = sha256(fetched.validation || { blocked: fetched.blocked });
  const rows = await sb('dataset_versions', {
    method: 'POST',
    headers: { Prefer: 'return=representation,resolution=merge-duplicates' },
    body: JSON.stringify({
      dataset_id: job.dataset_id,
      version_label: versionLabel,
      source_checksum: checksum,
      schema_checksum: schemaChecksum,
      retrieved_at: new Date().toISOString(),
      status,
      metadata: {
        connector_id: connectorId,
        source_url: fetched.sourceUrl || null,
        validation: fetched.validation || null,
        blocked: Boolean(fetched.blocked),
        note: 'Raw payload is not published from the sync engine; this record tracks retrieval, validation and provenance.'
      }
    })
  });
  return { version: rows?.[0] || rows, checksum, schemaChecksum };
}

async function registerEvidence(job, fetched, versionInfo) {
  if (!fetched.sourceUrl) return null;
  const rows = await sb('evidence', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      source_id: job.source_id || undefined,
      dataset_id: job.dataset_id,
      evidence_type: 'official_dataset_retrieval',
      title: `Sync ${job.connector_id}`,
      description: `Official-source retrieval recorded by the production sync engine. SHA-256 ${versionInfo.checksum}.`,
      url: fetched.sourceUrl,
      collected_at: new Date().toISOString(),
      reliability_score: 1,
      relevance_score: 1,
      freshness_score: 1,
      evidence_strength: 1,
      status: 'active',
      metadata: { dataset_version_id: versionInfo.version?.id || null, validation: fetched.validation || null }
    })
  });
  return rows?.[0] || rows;
}

async function runConnector(connectorId) {
  const source = SOURCES[connectorId];
  if (!source) throw new Error(`Connector tidak didukung: ${connectorId}`);
  const job = await getJob(connectorId);
  if (!job) throw new Error(`Sync job tidak ditemukan: ${connectorId}`);
  if (!job.enabled) return { connectorId, skipped: true, reason: 'job disabled' };

  const run = await createRun(job.id);
  try {
    const fetched = await source.fetch({ config: job.config || {} });
    if (fetched.blocked) {
      await finishRun(run.id, { status: 'blocked', error_summary: fetched.reason, metadata: { connector_id: connectorId, blocked: true, source_url: fetched.sourceUrl } });
      await updateJob(job.id, { last_started_at: run.started_at, last_status: 'blocked', last_error: fetched.reason });
      return { connectorId, status: 'blocked', reason: fetched.reason };
    }
    const qualityChecks = Object.values(fetched.validation || {}).filter(v => typeof v === 'boolean');
    const passed = qualityChecks.length ? qualityChecks.filter(Boolean).length : 1;
    const qualityScore = qualityChecks.length ? passed / qualityChecks.length : 1;
    const versionInfo = await registerVersion(job, connectorId, fetched, qualityScore === 1 ? 'retrieved_validated' : 'retrieved_with_warnings');
    await sb('data_quality_checks', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ dataset_version_id: versionInfo.version.id, check_name: 'connector_payload_validation', check_type: 'schema_and_transport', passed: qualityScore === 1, score: qualityScore, failure_count: qualityChecks.filter(v => !v).length, details: fetched.validation || {}, checked_at: new Date().toISOString() })
    });
    const evidence = await registerEvidence(job, fetched, versionInfo);
    const seen = Number(fetched.recordsSeen || 0);
    await finishRun(run.id, { status: qualityScore === 1 ? 'success' : 'warning', records_seen: seen, records_inserted: 0, records_updated: 0, records_rejected: qualityScore === 1 ? 0 : 1, quality_score: qualityScore, error_summary: qualityScore === 1 ? null : 'Payload retrieved but one or more validation checks failed.', metadata: { connector_id: connectorId, dataset_version_id: versionInfo.version.id, evidence_id: evidence?.id || null, source_url: fetched.sourceUrl } });
    await updateJob(job.id, { last_started_at: run.started_at, last_success_at: new Date().toISOString(), last_status: qualityScore === 1 ? 'success' : 'warning', last_error: qualityScore === 1 ? null : 'Validation warning' });
    return { connectorId, status: qualityScore === 1 ? 'success' : 'warning', recordsSeen: seen, datasetVersionId: versionInfo.version.id, evidenceId: evidence?.id || null };
  } catch (error) {
    await finishRun(run.id, { status: 'failed', error_summary: String(error?.message || error), metadata: { connector_id: connectorId } });
    await updateJob(job.id, { last_started_at: run.started_at, last_status: 'failed', last_error: String(error?.message || error).slice(0, 1000) });
    throw error;
  }
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });
  if (!SERVICE_KEY) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured' });
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' });

  const requested = String(req.query.connector || (req.method === 'POST' ? req.body?.connector : '') || 'all').trim();
  const connectors = requested === 'all' ? Object.keys(SOURCES) : requested.split(',').map(v => v.trim()).filter(Boolean);
  if (!connectors.length || connectors.some(c => !SOURCES[c])) return res.status(400).json({ error: 'Unknown connector', allowed: Object.keys(SOURCES) });

  const results = [];
  for (const connector of connectors) {
    try { results.push(await runConnector(connector)); }
    catch (error) { results.push({ connectorId: connector, status: 'failed', error: String(error?.message || error) }); }
  }
  const failed = results.filter(r => r.status === 'failed').length;
  return res.status(failed ? 207 : 200).json({ generated_at: new Date().toISOString(), engine: 'production-sync-2026.09', results });
}
