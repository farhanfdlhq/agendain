"use client"

import { useSyncExternalStore } from "react"

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange)
  window.addEventListener("offline", onChange)
  return () => {
    window.removeEventListener("online", onChange)
    window.removeEventListener("offline", onChange)
  }
}

/** Browser sedang offline? Saat render di server dianggap online. */
export function useOffline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !navigator.onLine,
    () => false,
  )
}
