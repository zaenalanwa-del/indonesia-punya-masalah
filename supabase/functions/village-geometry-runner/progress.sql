create table if not exists public.region_geometry_progress_village (
    job_name text primary key,
    last_code text,
    processed bigint not null default 0,
    success_count bigint not null default 0,
    failed_count bigint not null default 0,
    status text not null default 'running',
    last_error text,
    updated_at timestamptz not null default now()
);

grant all on table public.region_geometry_progress_village to service_role;

insert into public.region_geometry_progress_village (
    job_name,
    last_code,
    processed,
    success_count,
    failed_count,
    status,
    updated_at
)
values (
    'village-geometry',
    '',
    0,
    0,
    0,
    'running',
    now()
)
on conflict (job_name) do nothing;
