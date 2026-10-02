import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/** False during server rendering and hydration, true afterwards. */
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
}
