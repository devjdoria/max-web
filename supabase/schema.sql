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

create table if not exists public.site_content (
  id text primary key default 'main' check (id = 'main'),
  hero_eyebrow text not null default '21 vueltas al sol',
  hero_pretitle text not null default 'Para la persona que hace mi mundo más bonito',
  hero_title text not null default 'Feliz cumpleaños,',
  hero_name text not null default 'Maxime',
  hero_description text not null default 'Hoy celebramos tus 21 años, pero yo celebro cada día la suerte de compartir la vida contigo.',
  hero_media_path text,
  hero_left_media_path text,
  hero_right_media_path text,
  hero_polaroids jsonb,
  story_kicker text not null default 'Nuestro pequeño universo',
  story_title text not null default 'Una historia que seguimos escribiendo',
  story_description text not null default 'Aquí viven los viajes, las risas inesperadas y esos días normales que contigo se convierten en recuerdos para siempre.',
  love_note text not null default 'Maxime, eres la persona que más quiero en este mundo. Esta página no es solo un regalo: es un lugar para todo lo que aún nos queda por vivir.',
  footer_text text not null default 'Que este sea solo el capítulo 21 de una historia infinita.',
  updated_at timestamptz not null default now()
);

alter table public.site_content add column if not exists hero_left_media_path text;
alter table public.site_content add column if not exists hero_right_media_path text;
alter table public.site_content add column if not exists hero_polaroids jsonb;

insert into public.site_content (id) values ('main') on conflict (id) do nothing;

create table if not exists public.surprises (
  id uuid primary key default gen_random_uuid(),
  position integer not null,
  label text not null,
  title text not null,
  description text not null,
  cover_path text,
  locked boolean not null default false,
  unlock_at timestamptz,
  updated_at timestamptz not null default now()
);

create unique index if not exists surprises_position_idx on public.surprises (position);

insert into public.surprises (position,label,title,description,locked) values
  (1,'Sorpresa nº 1','Una carta para ti','Gracias por ser mi calma, mi aventura y mi persona favorita. Si pudiera elegir otra vez, te elegiría en cada vida. Feliz 21, mi amor.',false),
  (2,'Sorpresa nº 2','Nuestra próxima cita','Un día pensado solo para ti: sin prisas, sin planes que tengas que organizar y con un final que no te voy a contar todavía.',false),
  (3,'Sorpresa nº 3','Próximamente…','Se abrirá en el momento perfecto.',true)
on conflict (position) do nothing;

create index if not exists memories_date_idx on public.memories (memory_date desc);
create index if not exists memories_category_date_idx on public.memories (category, memory_date desc);

alter table public.memories enable row level security;
alter table public.site_content enable row level security;
alter table public.surprises enable row level security;

insert into storage.buckets (id, name, public)
values ('memories', 'memories', true)
on conflict (id) do update set public = true;

update storage.buckets
set file_size_limit = 209715200,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
where id = 'memories';
