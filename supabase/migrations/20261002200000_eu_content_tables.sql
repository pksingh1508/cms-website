-- EU Career Serwis CMS: content tables.
-- Every object is prefixed with eu_ so it never clashes with other tables in the project.

create type public.eu_content_status as enum ('draft', 'published');

-- Helpers live in a schema that the Data API does not expose
create schema if not exists private;

-- Keeps updated_at fresh, protects created_at, and stamps published_at on first publish
create function private.eu_content_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    new.created_at := old.created_at;
    new.updated_at := now();
  end if;
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create table public.eu_blog (
  id               uuid primary key default gen_random_uuid(),
  title            text not null check (char_length(title) between 1 and 200),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  excerpt          text check (char_length(excerpt) <= 300),
  content          text not null default '',
  image_url        text,
  image_alt        text check (char_length(image_alt) <= 200),
  image_width      integer check (image_width > 0),
  image_height     integer check (image_height > 0),
  author_name      text check (char_length(author_name) <= 100),
  tags             text[] not null default '{}' check (cardinality(tags) <= 15),
  likes_count      integer not null default 0 check (likes_count >= 0),
  comments_count   integer not null default 0 check (comments_count >= 0),
  seo_title        text check (char_length(seo_title) <= 200),
  seo_description  text check (char_length(seo_description) <= 320),
  seo_keywords     text check (char_length(seo_keywords) <= 500),
  status           public.eu_content_status not null default 'draft',
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  legacy_id        text unique  -- id of the item in the old Strapi CMS (import only)
);

create table public.eu_news (
  id               uuid primary key default gen_random_uuid(),
  title            text not null check (char_length(title) between 1 and 200),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  excerpt          text check (char_length(excerpt) <= 300),
  content          text not null default '',
  image_url        text,
  image_alt        text check (char_length(image_alt) <= 200),
  image_width      integer check (image_width > 0),
  image_height     integer check (image_height > 0),
  tags             text[] not null default '{}' check (cardinality(tags) <= 15),
  views_count      integer not null default 0 check (views_count >= 0),
  seo_title        text check (char_length(seo_title) <= 200),
  seo_description  text check (char_length(seo_description) <= 320),
  status           public.eu_content_status not null default 'draft',
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  legacy_id        text unique
);

create table public.eu_success_stories (
  id               uuid primary key default gen_random_uuid(),
  name             text not null check (char_length(name) between 1 and 100),
  story            text check (char_length(story) <= 3000),
  image_url        text,
  image_alt        text check (char_length(image_alt) <= 200),
  image_width      integer check (image_width > 0),
  image_height     integer check (image_height > 0),
  video_url        text check (video_url ~ '^https?://' and char_length(video_url) <= 500),
  status           public.eu_content_status not null default 'draft',
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  legacy_id        text unique
);

create table public.eu_testimonials (
  id               uuid primary key default gen_random_uuid(),
  name             text not null check (char_length(name) between 1 and 100),
  quote            text check (char_length(quote) <= 1000),
  image_url        text,
  image_alt        text check (char_length(image_alt) <= 200),
  image_width      integer check (image_width > 0),
  image_height     integer check (image_height > 0),
  views_count      integer not null default 0 check (views_count >= 0),
  status           public.eu_content_status not null default 'draft',
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  legacy_id        text unique
);

create table public.eu_visa_stamps (
  id               uuid primary key default gen_random_uuid(),
  image_url        text not null,
  image_alt        text check (char_length(image_alt) <= 200),
  image_width      integer check (image_width > 0),
  image_height     integer check (image_height > 0),
  country          text check (char_length(country) <= 60),
  caption          text check (char_length(caption) <= 200),
  status           public.eu_content_status not null default 'draft',
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  legacy_id        text unique
);

create table public.eu_work_permits (
  id               uuid primary key default gen_random_uuid(),
  image_url        text not null,
  image_alt        text check (char_length(image_alt) <= 200),
  image_width      integer check (image_width > 0),
  image_height     integer check (image_height > 0),
  country          text check (char_length(country) <= 60),
  caption          text check (char_length(caption) <= 200),
  status           public.eu_content_status not null default 'draft',
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  legacy_id        text unique
);

-- Same indexes and trigger on all six tables
do $$
declare t text;
begin
  foreach t in array array['eu_blog', 'eu_news', 'eu_success_stories', 'eu_testimonials', 'eu_visa_stamps', 'eu_work_permits'] loop
    -- website lists: newest published first
    execute format('create index %I on public.%I (published_at desc) where status = ''published''', t || '_published_idx', t);
    -- CMS lists: recently edited first
    execute format('create index %I on public.%I (updated_at desc)', t || '_updated_idx', t);
    execute format('create trigger eu_content_before_write before insert or update on public.%I
                    for each row execute function private.eu_content_before_write()', t);
  end loop;
end $$;
