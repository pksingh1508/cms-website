import { MAX_UPLOAD_BYTES, UPLOAD_TYPES, type UploadType } from "@/lib/uploads"
import { prepareImage } from "./prepare"

// Browser only: prepare → POST /api/uploads (XHR, for progress events) → public URL.

export type UploadedImage = { url: string; width: number; height: number }

type Options = { maxSide?: number; onProgress?: (ratio: number) => void; signal?: AbortSignal }

export async function uploadImage(file: File, collection: string, options: Options = {}): Promise<UploadedImage> {
  const image = await prepareImage(file, options.maxSide)
  if (image.blob.size > MAX_UPLOAD_BYTES) {
    throw new Error("This image is too large, even after resizing (4 MB maximum). Try a smaller file.")
  }
  const url = await post(image.blob, image.type as UploadType, collection, options)
  return { url, width: image.width, height: image.height }
}

function post(blob: Blob, type: UploadType, collection: string, { onProgress, signal }: Options) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", "/api/uploads")
    xhr.responseType = "json"
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total)
    }
    xhr.onload = () => {
      const body = xhr.response as { url?: string; error?: string } | null
      if (xhr.status >= 200 && xhr.status < 300 && body?.url) resolve(body.url)
      else reject(new Error(body?.error ?? `Upload failed (${xhr.status}).`))
    }
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection and try again."))
    xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"))
    signal?.addEventListener("abort", () => xhr.abort(), { once: true })

    const form = new FormData()
    form.append("collection", collection)
    form.append("file", new File([blob], `image.${UPLOAD_TYPES[type] ?? "jpg"}`, { type }))
    xhr.send(form)
  })
}
