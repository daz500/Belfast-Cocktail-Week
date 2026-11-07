-- Run once in your Supabase SQL editor. All tables are server-only: no anon RLS policies.
create table if not exists public.members (
 id uuid primary key default gen_random_uuid(),
 group_id text not null check (group_id = 'belfast-cocktail-week-2026'),
 name text not null check (char_length(name) between 1 and 32),
 token_hash text not null unique,
 style text not null default 'mixed' check (style in ('mixed','lively','relaxed')),
 wants_food boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists members_group_idx on public.members(group_id);
create table if not exists public.votes (
 member_id uuid not null references public.members(id) on delete cascade,
 venue_id text not null,
 liked boolean not null,
 updated_at timestamptz not null default now(),
 primary key (member_id,venue_id)
);
create table if not exists public.trails (
 id uuid primary key default gen_random_uuid(),
 group_id text not null,
 venue_ids text[] not null,
 explanation text not null,
 generated_by_ai boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists trail_group_idx on public.trails(group_id,created_at desc);
alter table public.members enable row level security;
alter table public.votes enable row level security;
alter table public.trails enable row level security;
-- Expose only the permissions the server needs through the Data API.
grant select, insert on public.members, public.trails to service_role;
grant select, insert, update, delete on public.votes to service_role;
