"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDownIcon, ExternalLinkIcon, LoaderCircleIcon, Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"
import { type FieldErrors, FormProvider, type Resolver, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { deleteItem, saveItem } from "@/actions/items"
import { ButtonLink } from "@/components/button-link"
import { FieldRenderer } from "@/components/fields/field-renderer"
import { PublishDateField } from "@/components/fields/publish-date-field"
import { CountrySuggestions } from "@/components/fields/simple-fields"
import { DeleteDialog } from "@/components/items/delete-dialog"
import { ItemProvider, useItem } from "@/components/items/item-context"
import { websiteHref } from "@/components/items/item-text"
import { StatusBadge } from "@/components/items/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { type ContentStatus, getCollection } from "@/config/collections"
import type { FormValues } from "@/lib/mapping"
import { buildSchema, type SaveMode } from "@/lib/schemas"

export type ItemFormProps = {
  collection: string
  item: {
    id: string | null
    status: ContentStatus
    updatedAt: string | null
    publishedAt: string | null
    values: FormValues
  }
  websiteUrl: string
}

export function ItemForm({ collection: slug, item, websiteUrl }: ItemFormProps) {
  const collection = getCollection(slug)
  if (!collection) throw new Error(`Unknown content type: ${slug}`)

  const router = useRouter()
  const [saved, setSaved] = useState({
    id: item.id,
    status: item.status,
    updatedAt: item.updatedAt,
    publishedAt: item.publishedAt,
    slug: typeof item.values.slug === "string" ? item.values.slug : "",
  })
  const [pending, startTransition] = useTransition()
  const [uploads, setUploads] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, startDelete] = useTransition()

  // Drafts are validated with the lenient schema, Publish / Save changes with the strict one
  const mode = useRef<SaveMode>("draft")
  const schemas = useMemo(
    () => ({ draft: buildSchema(collection, "draft"), publish: buildSchema(collection, "publish") }),
    [collection],
  )
  const resolver = useCallback<Resolver<FormValues>>(
    (values, context, options) =>
      zodResolver(schemas[mode.current], undefined, { raw: true })(values, context, options),
    [schemas],
  )
  const form = useForm<FormValues>({
    defaultValues: item.values,
    resolver,
    mode: "onSubmit",
    reValidateMode: "onChange",
  })
  const { isDirty } = form.formState

  const beginUpload = useCallback(() => {
    setUploads((n) => n + 1)
    let ended = false
    return () => {
      if (!ended) setUploads((n) => n - 1)
      ended = true
    }
  }, [])

  const busy = pending || deleting || uploads > 0

  const save = useCallback(
    (target: ContentStatus) => {
      if (uploads > 0) {
        toast.info("Please wait until the image upload has finished.")
        return
      }
      mode.current = target === "published" ? "publish" : "draft"
      void form.handleSubmit(
        (values) =>
          startTransition(async () => {
            const result = await saveItem({
              collection: slug,
              id: saved.id,
              values,
              status: target,
              expectedUpdatedAt: saved.updatedAt,
            })
            if (!result.ok) {
              for (const [name, messages] of Object.entries(result.fieldErrors ?? {})) {
                form.setError(name, { type: "server", message: messages[0] })
              }
              toast.error(
                result.error,
                result.code === "conflict"
                  ? {
                      duration: Number.POSITIVE_INFINITY,
                      action: { label: "Reload", onClick: () => window.location.reload() },
                    }
                  : undefined,
              )
              return
            }
            const data = result.data
            form.reset(data.values)
            setSaved({
              id: data.id,
              status: data.status,
              updatedAt: data.updatedAt,
              publishedAt: data.publishedAt,
              slug: typeof data.values.slug === "string" ? data.values.slug : "",
            })
            toast.success(successMessage(saved.status, data.status))
            if (!saved.id) router.replace(`/${slug}/${data.id}`)
          }),
        (errors: FieldErrors<FormValues>) => {
          const count = Object.keys(errors).length
          toast.error(
            target === "published"
              ? `Fill in the highlighted field${count === 1 ? "" : "s"} before publishing.`
              : "Please fix the highlighted fields.",
          )
        },
      )()
    },
    [form, router, saved, slug, uploads],
  )

  // Ctrl/⌘ + S saves without changing the status
  const saveRef = useRef(save)
  saveRef.current = save
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        saveRef.current(saved.status)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [saved.status])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [isDirty])

  function remove() {
    if (!saved.id) return
    const id = saved.id
    startDelete(async () => {
      const result = await deleteItem({ collection: slug, id })
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      form.reset(form.getValues()) // nothing left to warn about
      setConfirmDelete(false)
      toast.success("Deleted")
      router.replace(`/${slug}`)
    })
  }

  const main = collection.fields.filter((f) => (f.placement ?? "main") === "main")
  const side = collection.fields.filter((f) => f.placement === "side")
  const seo = collection.fields.filter((f) => f.placement === "seo")
  const liveUrl =
    saved.status === "published" ? websiteHref(collection, { ...item.values, slug: saved.slug }, websiteUrl) : null

  return (
    <ItemProvider value={{ collection, isNew: !saved.id, status: saved.status, savedSlug: saved.slug, beginUpload }}>
      <FormProvider {...form}>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            save(saved.status)
          }}
        >
          <div className="sticky top-14 z-20 flex flex-wrap items-center gap-x-4 gap-y-2 border-b bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
            <div className="min-w-0 flex-1">
              <Heading isNew={!saved.id} />
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <StatusBadge status={saved.status} publishedAt={saved.publishedAt} />
                {uploads > 0 ? (
                  <span>Uploading image…</span>
                ) : isDirty ? (
                  <span className="font-medium text-amber-700">Unsaved changes</span>
                ) : saved.id ? (
                  <span>All changes saved</span>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pending && <LoaderCircleIcon className="size-4 animate-spin text-muted-foreground" />}
              {saved.status === "published" ? (
                <>
                  <Button type="button" variant="outline" onClick={() => save("draft")} disabled={busy}>
                    Unpublish
                  </Button>
                  <Button type="button" onClick={() => save("published")} disabled={busy}>
                    Save changes
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={() => save("draft")} disabled={busy}>
                    Save draft
                  </Button>
                  <Button type="button" onClick={() => save("published")} disabled={busy}>
                    Publish
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="min-w-0 space-y-6">
              {main.map((field) => (
                <FieldRenderer key={field.name} field={field} />
              ))}

              {seo.length > 0 && (
                <Collapsible className="rounded-xl border">
                  <CollapsibleTrigger className="group flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium">
                    <span>
                      Search engines (SEO) <span className="font-normal text-muted-foreground">· optional</span>
                    </span>
                    <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-6 border-t px-4 py-4">
                    {seo.map((field) => (
                      <FieldRenderer key={field.name} field={field} />
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>

            <aside className="space-y-6">
              <Card size="sm">
                <CardHeader>
                  <CardTitle>Publishing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PublishDateField />
                  {liveUrl && (
                    <ButtonLink href={liveUrl} external variant="outline" size="sm" className="w-full">
                      <ExternalLinkIcon />
                      View on website
                    </ButtonLink>
                  )}
                </CardContent>
              </Card>

              {side.length > 0 && (
                <Card size="sm">
                  <CardContent className="space-y-6">
                    {side.map((field) => (
                      <FieldRenderer key={field.name} field={field} />
                    ))}
                  </CardContent>
                </Card>
              )}

              {saved.id && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                  disabled={busy}
                >
                  <Trash2Icon />
                  Delete {collection.singular.toLowerCase()}
                </Button>
              )}
            </aside>
          </div>
          <CountrySuggestions />
        </form>
      </FormProvider>
      <DeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={collection.displayTitle(form.getValues())}
        pending={deleting}
        onConfirm={remove}
      />
    </ItemProvider>
  )
}

/** Live title of the item being edited. */
function Heading({ isNew }: { isNew: boolean }) {
  const values = useWatch() as FormValues
  const { collection } = useItem()
  const title = collection.displayTitle(values)
  const blank = title === collection.displayTitle({}) // e.g. "Untitled", or "Visa stamp" before a country is set
  return (
    <h1 className="truncate text-lg font-semibold tracking-tight">
      {blank && isNew ? `New ${collection.singular.toLowerCase()}` : title}
    </h1>
  )
}

function successMessage(before: ContentStatus, after: ContentStatus) {
  if (after === "published") return before === "published" ? "Changes saved — they're live" : "Published"
  return before === "published" ? "Unpublished — it's now a draft" : "Draft saved"
}
