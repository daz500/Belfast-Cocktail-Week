-- Optional self-service taste preferences for Belfast Cocktail Club members.
-- Private: the application reads and updates only its authenticated member.
-- No existing tables or vote records are modified.
create table if not exists public.member_taste_profiles (
 member_id uuid primary key references public.members(id) on delete cascade,
 liked_spirits text[] not null default '{}',
 avoided_spirits text[] not null default '{}',
 liked_flavours text[] not null default '{}',
 avoided_ingredients text[] not null default '{}',
 updated_at timestamptz not null default now(),
 constraint taste_profile_spirit_counts check (cardinality(liked_spirits)<=8 and cardinality(avoided_spirits)<=8),
 constraint taste_profile_flavour_counts check (cardinality(liked_flavours)<=10),
 constraint taste_profile_ingredient_counts check (cardinality(avoided_ingredients)<=12)
);
alter table public.member_taste_profiles enable row level security;
revoke all on public.member_taste_profiles from PUBLIC, anon, authenticated;
grant select,insert,update on public.member_taste_profiles to service_role;
-- No RLS policies: the server uses the service role and verifies each token.
