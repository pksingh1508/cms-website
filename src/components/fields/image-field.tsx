"use client"

import { ImagePlusIcon, RefreshCwIcon, ShieldAlertIcon, Trash2Icon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useRef, useState } from "react"
import { Controller } from "react-hook-form"
import { errorMessage, FieldShell } from "@/components/fields/field-shell"
import { useItem } from "@/components/items/item-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import type { FieldConfig } from "@/config/collections"
import { uploadImage } from "@/lib/images/upload"
import type { ImageValue } from "@/lib/mapping"
import { cn } from "@/lib/utils"

export function ImageField({ field }: { field: FieldConfig }) {
  const { collection } = useItem()
  return (
    <Controller
      name={field.name}
      render={({ field: f, fieldState }) => (
        <FieldShell field={field} error={errorMessage(fieldState.error)}>
          {collection.privacyNotice && (
            <p className="flex gap-2 rounded-xl border border-amber-500/20 bg-amber-500/8 p-3 text-xs leading-relaxed text-amber-900 dark:text-amber-100/90">
              <ShieldAlertIcon className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                Before uploading, blur passport numbers, the machine-readable lines, dates of birth and signatures. Only
                publish people who agreed to it.
              </span>
            </p>
          )}
          <ImageInput
            name={field.name}
            value={(f.value as ImageValue | null) ?? null}
            onChange={f.onChange}
            inputRef={f.ref}
            invalid={fieldState.invalid}
          />
        </FieldShell>
      )}
    />
  )
}

function ImageInput({
  name,
  value,
  onChange,
  inputRef,
  invalid,
}: {
  name: string
  value: ImageValue | null
  onChange: (value: ImageValue | null) => void
  inputRef: (element: HTMLElement | null) => void
  invalid: boolean
}) {
  const { collection, beginUpload } = useItem()
  const fileInput = useRef<HTMLInputElement>(null)
  const [upload, setUpload] = useState<{ preview: string; progress: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError(null)
    const preview = URL.createObjectURL(file)
    setUpload({ preview, progress: 0 })
    const end = beginUpload()
    try {
      const uploaded = await uploadImage(file, collection.slug, {
        onProgress: (progress) => setUpload({ preview, progress }),
      })
      onChange({ url: uploaded.url, alt: value?.alt ?? "", width: uploaded.width, height: uploaded.height })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.")
    } finally {
      URL.revokeObjectURL(preview)
      setUpload(null)
      end()
    }
  }

  const choose = () => fileInput.current?.click()
  const src = upload?.preview ?? value?.url

  return (
    <div className="space-y-3">
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          void handleFile(e.target.files?.[0])
          e.target.value = ""
        }}
      />

      {src ? (
        <div className="group/preview relative overflow-hidden rounded-xl border bg-muted/50 animate-in fade-in-0 zoom-in-[0.98] duration-300">
          {/* biome-ignore lint/performance/noImgElement: previews of local files and of images already resized for the web */}
          <img
            src={src}
            alt={value?.alt ?? ""}
            className={cn(
              "max-h-80 w-full object-contain transition-[opacity,filter] duration-300",
              upload && "opacity-70 blur-[1px]",
            )}
          />
          <AnimatePresence>
            {upload && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="glass absolute inset-x-3 bottom-3 rounded-xl border p-3 shadow-md"
              >
                <p className="mb-2 flex items-center justify-between text-xs font-medium">
                  Uploading…
                  <span className="text-muted-foreground tabular-nums">{Math.round(upload.progress * 100)}%</span>
                </p>
                <Progress value={Math.round(upload.progress * 100)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <button
          ref={inputRef}
          type="button"
          onClick={choose}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            void handleFile(e.dataTransfer.files?.[0])
          }}
          className={cn(
            "group/drop flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-muted/30 px-4 py-9 text-center transition-all duration-200 ease-out hover:border-foreground/20 hover:bg-muted/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 focus-visible:outline-none",
            dragging && "scale-[1.01] border-brand bg-brand-soft",
            invalid && "border-destructive/60",
          )}
        >
          <span
            className={cn(
              "flex size-11 items-center justify-center rounded-xl border bg-card text-muted-foreground shadow-sm transition-transform duration-300 ease-spring group-hover/drop:-translate-y-0.5 group-hover/drop:scale-105",
              dragging && "-translate-y-1 scale-110 text-brand-ink",
            )}
          >
            <ImagePlusIcon className="size-5" />
          </span>
          <span className="text-sm font-medium text-foreground">
            {dragging ? (
              "Drop to upload"
            ) : (
              <>
                Drop an image here or <span className="text-brand-ink group-hover/drop:underline">browse</span>
              </>
            )}
          </span>
          <span className="text-xs text-muted-foreground">JPG, PNG, WebP or HEIC · resized to 2000 px</span>
        </button>
      )}

      {value && !upload && (
        <>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={choose}>
              <RefreshCwIcon />
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onChange(null)}
            >
              <Trash2Icon />
              Remove
            </Button>
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`${name}-alt`} className="text-[13px] font-medium">
              Alt text{" "}
              <span className="font-normal text-muted-foreground">· describes the image for screen readers</span>
            </label>
            <Input
              id={`${name}-alt`}
              value={value.alt}
              maxLength={200}
              onChange={(e) => onChange({ ...value, alt: e.target.value })}
              placeholder="e.g. Work permit issued in Poland"
            />
          </div>
        </>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  )
}
