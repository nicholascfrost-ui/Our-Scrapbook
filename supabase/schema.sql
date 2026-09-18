-- Run in the Supabase SQL editor. Create/invite Nicholas and Mae in Authentication
-- first, then add their two auth.users UUIDs to public.members below.
-- Safe to rerun: existing scrapbook records and photos are not replaced.
begin;
create table if not exists public.members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (display_name in ('Nicholas','Mae')),
  unique(display_name)
);
alter table public.members enable row level security;
drop policy if exists "Members see own membership" on public.members;
create policy "Members see own membership" on public.members for select to authenticated using (user_id=auth.uid());
create table if not exists public.scrapbook (
  id text primary key check(id='ours'),
  data jsonb not null,
  revision bigint not null default 1
);
alter table public.scrapbook enable row level security;
drop policy if exists "Two members can read scrapbook" on public.scrapbook;
create policy "Two members can read scrapbook" on public.scrapbook for select to authenticated using (exists(select 1 from public.members where user_id=auth.uid()));
drop policy if exists "Two members can update scrapbook" on public.scrapbook;
create policy "Two members can update scrapbook" on public.scrapbook for update to authenticated using (exists(select 1 from public.members where user_id=auth.uid())) with check(exists(select 1 from public.members where user_id=auth.uid()));
-- Explicit grants supplement RLS; clients cannot create members or delete data.
revoke all on public.members, public.scrapbook from anon;
revoke all on public.members, public.scrapbook from authenticated;
grant select on public.members to authenticated;
grant select, update on public.scrapbook to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('photos','photos',false,12000000,array['image/jpeg']) on conflict(id) do nothing;
drop policy if exists "Two members can see photos" on storage.objects;
create policy "Two members can see photos" on storage.objects for select to authenticated using (bucket_id='photos' and exists(select 1 from public.members where user_id=auth.uid()));
drop policy if exists "Two members can add photos" on storage.objects;
create policy "Two members can add photos" on storage.objects for insert to authenticated with check (bucket_id='photos' and exists(select 1 from public.members where user_id=auth.uid()));
commit;

-- Substitute the actual UUIDs; do not run these examples unchanged.
-- insert into public.members(user_id,display_name) values ('NICHOLAS_AUTH_UUID','Nicholas'),('MAE_AUTH_UUID','Mae');
