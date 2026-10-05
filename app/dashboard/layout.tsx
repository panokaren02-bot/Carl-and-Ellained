"use client"

import { useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // Hide the navbar on dashboard
    const navbar = document.querySelector('nav')
    if (navbar) {
      navbar.style.display = 'none'
    }

    // Dashboard fields use compact (<16px) text on phones. iOS Safari would auto-zoom
    // into them on focus; maximum-scale=1 stops that (iOS still allows pinch-zoom).
    const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]')
    const originalViewport = viewport?.getAttribute('content') ?? null
    if (viewport && originalViewport && !/maximum-scale/.test(originalViewport)) {
      viewport.setAttribute('content', `${originalViewport}, maximum-scale=1`)
    }

    return () => {
      // Restore navbar when leaving dashboard
      if (navbar) {
        navbar.style.display = ''
      }
      if (viewport && originalViewport !== null) {
        viewport.setAttribute('content', originalViewport)
      }
    }
  }, [])

  return <>{children}</>
}
