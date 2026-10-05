"use client"

import { useEffect } from "react"
import { useAudio } from "@/contexts/audio-context"
import { useSiteConfig } from "@/hooks/use-site-config"

const BackgroundMusic = () => {
  const siteConfig = useSiteConfig()
  const { audioRef } = useAudio()

  useEffect(() => {
    const audioEl = audioRef.current
    if (!audioEl) return

    // Try to play immediately on page load
    const tryAutoplay = () => {
      audioEl.play().catch((error) => {
        console.log("Autoplay blocked, waiting for user interaction:", error)
        // If autoplay fails, set up user interaction listeners
        setupUserInteraction()
      })
    }

    const handleUserInteraction = () => {
      audioEl.play().then(() => {
        document.removeEventListener("click", handleUserInteraction)
        document.removeEventListener("touchstart", handleUserInteraction)
      }).catch((error) => {
        console.log("Playback blocked:", error)
      })
    }

    const setupUserInteraction = () => {
      document.addEventListener("click", handleUserInteraction)
      document.addEventListener("touchstart", handleUserInteraction)
    }

    // Attempt autoplay immediately
    tryAutoplay()

    return () => {
      // Do NOT pause here — the audio element lives in the root layout and
      // must keep playing across client-side navigations.
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
    }
  }, [audioRef])

  return (
    <audio
      ref={audioRef}
      // Use an encoded URI to avoid issues with spaces/parentheses on some mobile browsers
      src={encodeURI(siteConfig.couple.backgroundMusic)}
      loop
      preload="none"
      // playsInline helps iOS treat this as inline media rather than requiring fullscreen behavior
      playsInline
      // Keep element non-visible; playback is initiated on first user interaction
      style={{ display: "none" }}
    />
  )
}

export default BackgroundMusic