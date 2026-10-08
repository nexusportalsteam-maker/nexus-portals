-- Nexus setup. Paste into Supabase > SQL Editor and run once.
-- 1) Replace YOUR_EMAIL_HERE below with the email of your single admin account.
-- 2) Create that user in Authentication > Users, then turn OFF "Allow new users to sign up".

create or replace function public.is_admin() returns boolean
language sql stable as $$ select lower(coalesce(auth.jwt()->>'email',''))=lower('nexusportals.team@gmail.com') $$;

create table if not exists projects(id uuid primary key default gen_random_uuid(),title text not null,tag text,description text,link text,image_url text,visible boolean default true,created_at timestamptz default now());
create table if not exists settings(key text primary key,value text);
create table if not exists leads(id uuid primary key default gen_random_uuid(),name text not null check(length(name)<=80),email text not null check(length(email)<=120),message text not null check(length(message)<=2000),created_at timestamptz default now());

alter table projects enable row level security;
alter table settings enable row level security;
alter table leads enable row level security;

create policy "public reads visible projects" on projects for select using (visible or public.is_admin());
create policy "admin writes projects" on projects for all using (public.is_admin()) with check (public.is_admin());
create policy "public reads settings" on settings for select using (true);
create policy "admin writes settings" on settings for all using (public.is_admin()) with check (public.is_admin());
create policy "anyone sends a lead" on leads for insert with check (true);
create policy "admin reads leads" on leads for select using (public.is_admin());
create policy "admin deletes leads" on leads for delete using (public.is_admin());

insert into storage.buckets(id,name,public) values('projects','projects',true) on conflict do nothing;
create policy "public reads project images" on storage.objects for select using (bucket_id='projects');
create policy "admin uploads project images" on storage.objects for insert with check (bucket_id='projects' and public.is_admin());
create policy "admin deletes project images" on storage.objects for delete using (bucket_id='projects' and public.is_admin());
