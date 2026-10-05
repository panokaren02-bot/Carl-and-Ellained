"use client"

import { useEffect } from "react"

/** Keeps the page behind an open modal from scrolling, so only the modal scrolls. */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [locked])
}
