import {
  BookOpenIcon,
  BriefcaseBusinessIcon,
  type LucideIcon,
  MessageSquareQuoteIcon,
  NewspaperIcon,
  StampIcon,
  TrophyIcon,
} from "lucide-react"

// The single description of the six content types. The list pages, the editor,
// validation and the Server Actions all read from here. Safe to import in the browser.

export const CONTENT_TABLES = [
  "eu_blog",
  "eu_news",
  "eu_success_stories",
  "eu_testimonials",
  "eu_visa_stamps",
  "eu_work_permits",
] as const
export type ContentTable = (typeof CONTENT_TABLES)[number]

export type Row = Record<string, unknown>
export type ContentStatus = "draft" | "published"

export type FieldType = "text" | "textarea" | "slug" | "richtext" | "image" | "url" | "country" | "tags" | "number"

export type FieldConfig = {
  /** Column name. An "image" field named "image" maps to image_url, image_alt, image_width and image_height. */
  name: string
  label: string
  type: FieldType
  /** "always": needed even for a draft. "publish": needed before publishing. Omitted: optional. */
  required?: "always" | "publish"
  maxLength?: number
  help?: string
  placeholder?: string
  /** Where the editor shows the field. Default "main". */
  placement?: "main" | "side" | "seo"
  /** Slug fields: the field the slug is generated from. */
  from?: string
  /** Textarea fields: visible rows. */
  rows?: number
}

export type CollectionConfig = {
  /** URL segment in the CMS and folder name in R2, e.g. "success-stories". */
  slug: string
  table: ContentTable
  label: string
  singular: string
  description: string
  icon: LucideIcon
  fields: FieldConfig[]
  /** Column searched by the list's search box. */
  searchField: string
  searchPlaceholder: string
  view: "table" | "grid"
  /** Shown in front of the slug input, e.g. "/blog/". */
  slugPrefix?: string
  displayTitle: (row: Row) => string
  /** Path of the item on the public website (for "View on website"). */
  websitePath?: (row: Row) => string | null
  /** Shows the "blur personal data" reminder above the image field. */
  privacyNotice?: boolean
}

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "")

const seoFields: FieldConfig[] = [
  {
    name: "seo_title",
    label: "SEO title",
    type: "text",
    maxLength: 200,
    placement: "seo",
    help: "Search engines show about 60 characters. Leave empty to use the title.",
  },
  {
    name: "seo_description",
    label: "SEO description",
    type: "textarea",
    maxLength: 320,
    rows: 3,
    placement: "seo",
    help: "Search engines show about 160 characters. Leave empty to use the short description.",
  },
]

export const COLLECTIONS: CollectionConfig[] = [
  {
    slug: "blog",
    table: "eu_blog",
    label: "Blog",
    singular: "Blog post",
    description: "Articles and guides",
    icon: BookOpenIcon,
    view: "table",
    searchField: "title",
    searchPlaceholder: "Search titles…",
    slugPrefix: "/blog/",
    fields: [
      { name: "title", label: "Title", type: "text", required: "always", maxLength: 200 },
      { name: "slug", label: "URL slug", type: "slug", required: "always", from: "title" },
      {
        name: "excerpt",
        label: "Short description",
        type: "textarea",
        required: "publish",
        maxLength: 300,
        rows: 3,
        help: "Shown on the blog cards.",
      },
      { name: "content", label: "Content", type: "richtext", required: "publish" },
      { name: "image", label: "Cover image", type: "image", required: "publish", placement: "side" },
      {
        name: "author_name",
        label: "Author",
        type: "text",
        maxLength: 100,
        placement: "side",
        placeholder: "EU Career Serwis",
      },
      { name: "tags", label: "Tags", type: "tags", placement: "side" },
      { name: "likes_count", label: "Likes", type: "number", placement: "side" },
      { name: "comments_count", label: "Comments", type: "number", placement: "side" },
      ...seoFields,
      {
        name: "seo_keywords",
        label: "SEO keywords",
        type: "text",
        maxLength: 500,
        placement: "seo",
        help: "Comma-separated.",
      },
    ],
    displayTitle: (row) => text(row.title) || "Untitled",
    websitePath: (row) => (text(row.slug) ? `/blog/${text(row.slug)}` : null),
  },
  {
    slug: "news",
    table: "eu_news",
    label: "News",
    singular: "News article",
    description: "Immigration news",
    icon: NewspaperIcon,
    view: "table",
    searchField: "title",
    searchPlaceholder: "Search titles…",
    slugPrefix: "/immigration-news/",
    fields: [
      { name: "title", label: "Title", type: "text", required: "always", maxLength: 200 },
      { name: "slug", label: "URL slug", type: "slug", required: "always", from: "title" },
      {
        name: "excerpt",
        label: "Short description",
        type: "textarea",
        required: "publish",
        maxLength: 300,
        rows: 3,
        help: "Shown on the news cards.",
      },
      { name: "content", label: "Content", type: "richtext", required: "publish" },
      { name: "image", label: "Cover image", type: "image", required: "publish", placement: "side" },
      { name: "tags", label: "Tags", type: "tags", placement: "side" },
      { name: "views_count", label: "Views", type: "number", placement: "side" },
      ...seoFields,
    ],
    displayTitle: (row) => text(row.title) || "Untitled",
    websitePath: (row) => (text(row.slug) ? `/immigration-news/${text(row.slug)}` : null),
  },
  {
    slug: "success-stories",
    table: "eu_success_stories",
    label: "Success stories",
    singular: "Success story",
    description: "Stories of placed candidates",
    icon: TrophyIcon,
    view: "table",
    searchField: "name",
    searchPlaceholder: "Search names…",
    fields: [
      {
        name: "name",
        label: "Name",
        type: "text",
        required: "always",
        maxLength: 100,
        placeholder: "Rakesh - India",
      },
      { name: "story", label: "Story", type: "textarea", required: "publish", maxLength: 3000, rows: 6 },
      { name: "image", label: "Photo", type: "image", placement: "side" },
      {
        name: "video_url",
        label: "Video link",
        type: "url",
        placement: "side",
        placeholder: "https://www.youtube.com/watch?v=…",
      },
    ],
    displayTitle: (row) => text(row.name) || "Unnamed",
    websitePath: () => "/success-stories",
    privacyNotice: true,
  },
  {
    slug: "testimonials",
    table: "eu_testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    description: "What clients say",
    icon: MessageSquareQuoteIcon,
    view: "table",
    searchField: "name",
    searchPlaceholder: "Search names…",
    fields: [
      { name: "name", label: "Name", type: "text", required: "always", maxLength: 100 },
      { name: "quote", label: "What they say", type: "textarea", required: "publish", maxLength: 1000, rows: 5 },
      { name: "image", label: "Photo", type: "image", placement: "side" },
      { name: "views_count", label: "Views", type: "number", placement: "side" },
    ],
    displayTitle: (row) => text(row.name) || "Unnamed",
    websitePath: () => "/testimonials",
    privacyNotice: true,
  },
  {
    slug: "visa-stamps",
    table: "eu_visa_stamps",
    label: "Visa stamps",
    singular: "Visa stamp",
    description: "Gallery of approved visas",
    icon: StampIcon,
    view: "grid",
    searchField: "country",
    searchPlaceholder: "Search by country…",
    fields: [
      { name: "image", label: "Visa stamp image", type: "image", required: "always" },
      { name: "country", label: "Country", type: "country", maxLength: 60 },
      { name: "caption", label: "Caption", type: "text", maxLength: 200, help: "Optional text shown with the image." },
    ],
    displayTitle: (row) =>
      text(row.caption) || (text(row.country) ? `Visa stamp · ${text(row.country)}` : "Visa stamp"),
    websitePath: () => "/visa-stamp",
    privacyNotice: true,
  },
  {
    slug: "work-permits",
    table: "eu_work_permits",
    label: "Work permits",
    singular: "Work permit",
    description: "Gallery of issued work permits",
    icon: BriefcaseBusinessIcon,
    view: "grid",
    searchField: "country",
    searchPlaceholder: "Search by country…",
    fields: [
      { name: "image", label: "Work permit image", type: "image", required: "always" },
      { name: "country", label: "Country", type: "country", maxLength: 60 },
      { name: "caption", label: "Caption", type: "text", maxLength: 200, help: "Optional text shown with the image." },
    ],
    displayTitle: (row) =>
      text(row.caption) || (text(row.country) ? `Work permit · ${text(row.country)}` : "Work permit"),
    websitePath: () => "/work-permit",
    privacyNotice: true,
  },
]

export const COLLECTION_SLUGS = COLLECTIONS.map((c) => c.slug) as [string, ...string[]]

export function getCollection(slug: string): CollectionConfig | undefined {
  return COLLECTIONS.find((c) => c.slug === slug)
}

export function hasImage(collection: CollectionConfig) {
  return collection.fields.some((f) => f.type === "image")
}
