-- 003_geography_ingest_reconciled.sql
-- BIG geography ingest aligned with regions(code,parent_id,geom).
create table if not exists public.region_sync_runs (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_url text,
  level text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running',
  records_seen integer not null default 0,
  records_upserted integer not null default 0,
  records_skipped integer not null default 0,
  error_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb
);
create index if not exists idx_region_sync_runs_started on public.region_sync_runs(started_at desc);

create or replace function public.upsert_big_regions(p_level text,p_source_version text,p_features jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare f jsonb; p jsonb; g jsonb; v_code text; v_parent_code text; v_name text; v_type text; v_geom geometry; n integer:=0; s integer:=0; v_parent_id uuid;
begin
 if jsonb_typeof(p_features)<>'array' then raise exception 'p_features must be array'; end if;
 for f in select value from jsonb_array_elements(p_features) loop
  p:=coalesce(f->'properties','{}'::jsonb); g:=f->'geometry';
  if p_level='province' then v_code=coalesce(nullif(p->>'KDPBPS',''),nullif(p->>'KDPPUM','')); v_parent_code=null; v_name=coalesce(nullif(p->>'WADMPR',''),nullif(p->>'NAMOBJ','')); v_type='province';
  elsif p_level='regency' then v_code=coalesce(nullif(p->>'KDBBPS',''),nullif(p->>'KDPKAB','')); v_parent_code=coalesce(nullif(p->>'KDPBPS',''),nullif(p->>'KDPPR','')); v_name=coalesce(nullif(p->>'WADMKK',''),nullif(p->>'NAMOBJ','')); v_type='city';
  elsif p_level='district' then v_code=coalesce(nullif(p->>'KDCBPS',''),nullif(p->>'KDCPUM','')); v_parent_code=coalesce(nullif(p->>'KDBBPS',''),nullif(p->>'KDBKAB','')); v_name=coalesce(nullif(p->>'WADMKC',''),nullif(p->>'NAMOBJ','')); v_type='district';
  elsif p_level='village' then v_code=coalesce(nullif(p->>'KDEBPS',''),nullif(p->>'KDEPUM','')); v_parent_code=coalesce(nullif(p->>'KDCBPS',''),nullif(p->>'KDC','')); v_name=coalesce(nullif(p->>'WADMKD',''),nullif(p->>'NAMOBJ','')); v_type=case when p->>'TIPADM'='2' then 'city' else 'village' end;
  else raise exception 'Unsupported level %',p_level; end if;
  if v_code is null or v_name is null then s:=s+1; continue; end if;
  select id into v_parent_id from regions where code=v_parent_code limit 1;
  v_geom=case when g is not null then ST_SetSRID(ST_GeomFromGeoJSON(g::text),4326) else null end;
  insert into regions(code,parent_id,name,level,geom,metadata,updated_at)
  values(v_code,v_parent_id,v_name,v_type,v_geom,jsonb_build_object('source','BIG','source_version',p_source_version,'properties',p),now())
  on conflict(code) do update set parent_id=excluded.parent_id,name=excluded.name,level=excluded.level,geom=coalesce(excluded.geom,regions.geom),metadata=excluded.metadata,updated_at=now();
  n:=n+1;
 end loop;
 return jsonb_build_object('level',p_level,'upserted',n,'skipped',s);
end $$;
revoke all on function public.upsert_big_regions(text,text,jsonb) from public;
