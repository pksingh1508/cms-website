// Browser only. Resizes and re-encodes an image before it is uploaded:
// - the longest side is at most `maxSide` pixels;
// - WebP where the browser can encode it, JPEG otherwise (Safari can't encode WebP);
// - re-encoding drops EXIF metadata such as GPS location; phone rotation is applied first.

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/heic", "image/heif"]
const MAX_INPUT_BYTES = 25 * 1024 * 1024

export type PreparedImage = { blob: Blob; type: string; width: number; height: number }

export async function prepareImage(file: File, maxSide = 2000): Promise<PreparedImage> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Please choose a JPG, PNG, WebP, AVIF, HEIC or GIF image.")
  if (file.size > MAX_INPUT_BYTES) throw new Error("Images must be smaller than 25 MB.")

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
  } catch {
    // e.g. HEIC in Chrome, Edge or Firefox (only Safari can read HEIC)
    throw new Error("This browser can't read this image. Please convert it to JPG and try again.")
  }

  if (file.type === "image/gif") {
    const size = { width: bitmap.width, height: bitmap.height }
    bitmap.close()
    return { blob: file, type: file.type, ...size } // keep the animation: upload as it is
  }

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not process this image.")
  ctx.imageSmoothingQuality = "high"
  ctx.fillStyle = "#fff" // transparent areas become white (JPEG has no transparency)
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  let blob = await toBlob(canvas, "image/webp", 0.82)
  if (blob.type !== "image/webp") blob = await toBlob(canvas, "image/jpeg", 0.85) // Safari returns PNG for WebP
  return { blob, type: blob.type, width, height }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process this image."))), type, quality),
  )
}
