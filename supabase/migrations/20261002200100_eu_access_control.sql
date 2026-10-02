-- EU Career Serwis CMS: who may do what.
-- Visitors (and the public website) read published content only; allow-listed admins do everything.
-- Explicit grants: this project's defaults would otherwise give the API roles full access to new tables.

-- 1. Who may use the CMS
create table public.eu_admins (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);
alter table public.eu_admins enable row level security;
revoke all on public.eu_admins from anon, authenticated;
grant select on public.eu_admins to authenticated;
grant select, insert, delete on public.eu_admins to service_role;
create policy "Users can see their own admin row"
  on public.eu_admins for select to authenticated
  using (user_id = (select auth.uid()));

-- 2. Policy helper. SECURITY DEFINER lets it read eu_admins regardless of RLS;
--    the private schema keeps it out of the Data API.
create function private.eu_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.eu_admins where user_id = (select auth.uid()))
$$;
revoke execute on function private.eu_is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.eu_is_admin() to authenticated;

-- 3. Content tables: privileges + policies
do $$
declare t text;
begin
  foreach t in array array['eu_blog', 'eu_news', 'eu_success_stories', 'eu_testimonials', 'eu_visa_stamps', 'eu_work_permits'] loop
    execute format('alter table public.%I enable row level security', t);

    execute format('revoke all on public.%I from anon, authenticated, service_role', t);
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    -- Only for local scripts that use the secret key (import, maintenance); never the website or the CMS
    execute format('grant select, insert, update, delete on public.%I to service_role', t);

    -- Visitors (and the public website): published items whose date has arrived
    execute format($p$
      create policy "Public reads published" on public.%I
        for select to anon
        using (status = 'published' and published_at <= now())
    $p$, t);

    -- Logged-in users: the same, or everything for admins (one policy per role, no overlap)
    execute format($p$
      create policy "Admins read all, others read published" on public.%I
        for select to authenticated
        using ((status = 'published' and published_at <= now()) or (select private.eu_is_admin()))
    $p$, t);

    execute format($p$
      create policy "Admins insert" on public.%I
        for insert to authenticated
        with check ((select private.eu_is_admin()))
    $p$, t);

    execute format($p$
      create policy "Admins update" on public.%I
        for update to authenticated
        using ((select private.eu_is_admin()))
        with check ((select private.eu_is_admin()))
    $p$, t);

    execute format($p$
      create policy "Admins delete" on public.%I
        for delete to authenticated
        using ((select private.eu_is_admin()))
    $p$, t);
  end loop;
end $$;
