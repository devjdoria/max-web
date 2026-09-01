create extension if not exists "pgcrypto";

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null check (category in ('viaje', 'momento')),
  memory_date date not null,
  location text,
  media_path text,
  media_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memories_date_idx on public.memories (memory_date desc);
create index if not exists memories_category_date_idx on public.memories (category, memory_date desc);

alter table public.memories enable row level security;

insert into storage.buckets (id, name, public)
values ('memories', 'memories', true)
on conflict (id) do update set public = true;

update storage.buckets
set file_size_limit = 209715200,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
where id = 'memories';
