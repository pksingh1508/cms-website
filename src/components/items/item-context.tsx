"use client"

import { createContext, useContext } from "react"
import type { CollectionConfig, ContentStatus } from "@/config/collections"

export type ItemContextValue = {
  collection: CollectionConfig
  isNew: boolean
  status: ContentStatus
  /** The slug as last saved (to warn before changing a published page's address). */
  savedSlug: string
  /** Marks an image upload as running; call the returned function when it ends. Saving waits for uploads. */
  beginUpload: () => () => void
}

const ItemContext = createContext<ItemContextValue | null>(null)

export const ItemProvider = ItemContext.Provider

export function useItem() {
  const value = useContext(ItemContext)
  if (!value) throw new Error("useItem must be used inside the item editor")
  return value
}
