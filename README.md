# EU Career Serwis · Content Admin

A private CMS for the content of [eucareerserwis.pl](https://www.eucareerserwis.pl): blog posts, news, success stories,
testimonials, visa stamps and work permits.

- **Login only.** Email + password through Supabase Auth; only people on the admin list get in.
- **Data** lives in Supabase, in tables prefixed with `eu_`. **Images** live in Cloudflare R2.
- **The public website reads Supabase directly.** Visitors can only ever see published items.

Built with Next.js 16 (App Router), React 19, shadcn/ui (Base UI), Tiptap 3 and Supabase. The design notes are in
[`plan.md`](plan.md).

## Getting started

Requirements: Node.js 24 (22.12 or newer) and pnpm.

```bash
pnpm install
cp .env.example .env.local   # then fill in the values (see the comments in the file)
pnpm dev                     # http://localhost:3000
```

### Give someone access

```bash
pnpm admin add you@example.com          # creates the login (password printed once) and adds it to the admin list
pnpm admin list
pnpm admin password you@example.com     # set a new password (printed once)
pnpm admin remove you@example.com       # take away CMS access, keep the login
pnpm admin delete you@example.com       # delete the login
```

Add `--password '…'` to choose the password yourself (at least 12 characters). These commands use the secret key from
`.env.local`; never put that key on Vercel.

## Content types

| CMS section     | Table                | Website page                  |
| --------------- | -------------------- | ----------------------------- |
| Blog            | `eu_blog`            | `/blog/<slug>`                |
| News            | `eu_news`            | `/immigration-news/<slug>`    |
| Success stories | `eu_success_stories` | `/success-stories`            |
| Testimonials    | `eu_testimonials`    | `/testimonials`               |
| Visa stamps     | `eu_visa_stamps`     | `/visa-stamp`                 |
| Work permits    | `eu_work_permits`    | `/work-permit`                |

Every table has `status` (`draft` / `published`), `published_at`, `created_at`, `updated_at`, and a main image stored as
`image_url`, `image_alt`, `image_width`, `image_height`. The fields of each type are defined in
[`src/config/collections.ts`](src/config/collections.ts); the list pages, the editor and the validation are generated from it.

### Reading content on the website

Use the **publishable** key; Row Level Security only lets it read published items whose publish date has passed.

```ts
import { createClient } from "@supabase/supabase-js"

const cms = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
  auth: { persistSession: false },
})

const { data: posts } = await cms
  .from("eu_blog")
  .select("title, slug, excerpt, image_url, image_alt, image_width, image_height, tags, likes_count, published_at")
  .eq("status", "published")
  .order("published_at", { ascending: false })
  .range(0, 8)
```

Rich text (`content`) is HTML that the CMS has already sanitized, so it can be rendered with `dangerouslySetInnerHTML`.
More examples, caching and the optional "refresh the website after a save" hook: [`plan.md` §12](plan.md#12-using-the-content-on-your-website).

## Database

Migrations are plain SQL in [`supabase/migrations`](supabase/migrations) and are applied with the Supabase CLI.

```bash
pnpm supabase login                         # once
pnpm supabase link --project-ref <ref>      # once; asks for the database password
pnpm db:new add_something                   # creates a new migration file
pnpm db:push                                # applies pending migrations
pnpm db:types                               # regenerates src/lib/supabase/database.types.ts
```

To add a field: add the column in a new migration, run `pnpm db:push && pnpm db:types`, then add one line to
`src/config/collections.ts`.

### Importing the old Strapi content

`pnpm import:strapi` copies the content of the old Strapi tables (in the same Supabase project) into the `eu_` tables.
It only reads the Strapi tables and keeps images where they are in R2. Use `--dry-run` to preview.

The import already ran on 2026-10-02 (results and follow-ups: [`plan.md` §13](plan.md#13-importing-the-old-strapi-content)).
Running it again stops, because it would replace the imported items (matched on `legacy_id`) with the Strapi version,
including any changes made to them in the CMS. Add `--overwrite` if that is really what you want.

## Images

Images are resized in the browser (2000 px for main images, 1600 px inside rich text), converted to WebP (JPEG in
Safari), stripped of EXIF/GPS data and uploaded through `POST /api/uploads` to R2 under
`<type>/<yyyy>/<mm>/<uuid>.<ext>`. Images that no item uses any more are deleted automatically; files from the old
Strapi CMS (`uploads/…`) are never deleted by the CMS.

## Scripts

| Command             | What it does                                    |
| ------------------- | ----------------------------------------------- |
| `pnpm dev`          | development server                              |
| `pnpm build`        | production build                                |
| `pnpm lint`         | Biome lint + format check (`pnpm format` fixes) |
| `pnpm typecheck`    | TypeScript                                      |
| `pnpm test`         | unit tests (Vitest)                             |
| `pnpm admin …`      | manage CMS admins                               |
| `pnpm import:strapi`| import the old Strapi content                   |

## Deploying (Vercel)

1. Import the repository in Vercel; use Node.js 24 and the `dub1` (Dublin) region, close to the Supabase project.
2. Add these environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `NEXT_PUBLIC_MEDIA_URL`, `NEXT_PUBLIC_WEBSITE_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
   `R2_BUCKET`, `R2_JURISDICTION`, `APP_TIME_ZONE` (and optionally `WEBSITE_REVALIDATE_URL` / `WEBSITE_REVALIDATE_SECRET`).
   **Do not** add `SUPABASE_SECRET_KEY`, `SUPABASE_DB_*` or `SUPABASE_ACCESS_TOKEN`.
3. In Supabase → Authentication → URL Configuration, set the Site URL to the CMS address.

> **Before the CMS is reachable on the internet, delete the old Strapi tables** (or turn on RLS for them). The
> publishable key is visible to anyone who opens the login page, and the old Strapi tables are currently readable and
> writable with it.
