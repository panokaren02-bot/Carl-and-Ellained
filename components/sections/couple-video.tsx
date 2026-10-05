"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "motion/react"
import { Play } from "lucide-react"
import { useAudio } from "@/contexts/audio-context"
import { useSiteConfig } from "@/hooks/use-site-config"
import { siteConfig as defaultSiteConfig } from "@/content/site"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"
import localFont from "next/font/local"
import Image from "next/image"
import React from "react"
import "@/components/loader/loading-screen.css"

const theSeasons = localFont({
  src: "../../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const aboveTheBeyond = localFont({
  src: "../../Font/above-the-beyond-script.otf",
  display: "swap",
  variable: "--font-above-beyond",
})

const videoFrameStyle = {
  borderColor: "color-mix(in srgb, var(--color-motif-accent) 22%, transparent)",
  background:
    "color-mix(in srgb, var(--color-welcome-bg-soft) 72%, var(--color-motif-blush))",
  boxShadow:
    "0 8px 24px color-mix(in srgb, var(--color-motif-deep) 8%, transparent), inset 0 1px 0 color-mix(in srgb, var(--color-motif-soft) 80%, transparent)",
} as const

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span
        className="h-px w-6 sm:w-10"
        style={{
          background:
            "linear-gradient(to right, transparent, color-mix(in srgb, var(--color-motif-deep) 38%, transparent))",
        }}
      />
      <span className="h-0.5 w-0.5 rounded-full bg-motif-deep/45 sm:h-1 sm:w-1" aria-hidden />
      <span
        className="h-px w-6 sm:w-10"
        style={{
          background:
            "linear-gradient(to left, transparent, color-mix(in srgb, var(--color-motif-deep) 38%, transparent))",
        }}
      />
    </div>
  )
}

function CoupleVideoTitle() {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em]`}
        style={{
          fontSize: "var(--title-size)",
          color: "var(--color-welcome-navy)",
        }}
      >
        A Glimpse of Our Love
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto mt-1.5 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2 sm:leading-[0.9] md:mt-2.5`}
        style={{
          fontSize: "var(--script-size)",
          color: "var(--color-welcome-script)",
        }}
      >
        Our Journey Together
      </span>
      <span className="sr-only">Our Journey Together</span>
    </h2>
  )
}

function SectionCornerDecos({
  cornerDecos,
}: {
  cornerDecos: (typeof defaultSiteConfig.loadingScreen)["cornerDecos"]
}) {
  const corners = [
    { src: cornerDecos.topLeft, className: "left-0 top-0" },
    { src: cornerDecos.topRight, className: "right-0 top-0" },
    { src: cornerDecos.bottomLeft, className: "left-0 bottom-0" },
    { src: cornerDecos.bottomRight, className: "right-0 bottom-0" },
  ] as const

  return (
    <div className="invite-section-corners" aria-hidden="true">
      {corners.map(({ src, className }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          className={`invite-section-corner-img absolute ${className}`}
        />
      ))}
    </div>
  )
}

export function CoupleVideo() {
  const siteConfig = useSiteConfig()
  const loading = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen
  const cornerDecos =
    loading.cornerDecos ?? defaultSiteConfig.loadingScreen.cornerDecos

  const [hasClicked, setHasClicked] = useState(false)
  const playerRef = useRef<any>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { pauseMusic, resumeMusic } = useAudio()
  const videoId = "nhzVs-HhId4"

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }
  }, [])

  useEffect(() => {
    if (!hasClicked || !iframeRef.current) return

    const initPlayer = () => {
      if (window.YT && window.YT.Player && iframeRef.current) {
        playerRef.current = new window.YT.Player(iframeRef.current, {
          events: {
            onReady: (_event: any) => {
              pauseMusic()
            },
            onStateChange: (event: any) => {
              if (event.data === 1) {
                pauseMusic()
              } else if (event.data === 2 || event.data === 0) {
                resumeMusic()
              }
            },
          },
        })
      }
    }

    const timer = setTimeout(() => {
      if (window.YT && window.YT.Player) {
        initPlayer()
      } else {
        window.onYouTubeIframeAPIReady = initPlayer
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy()
        } catch {
          // Ignore errors during cleanup
        }
      }
    }
  }, [hasClicked, pauseMusic, resumeMusic, videoId])

  const handleThumbnailClick = () => {
    setHasClicked(true)
    pauseMusic()
  }

  return (
    <>
      <style jsx global>{`
        .youtube-embed-wrapper iframe {
          pointer-events: auto;
        }

        .youtube-mask-container {
          position: relative;
        }

        .youtube-mask-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: transparent;
          z-index: 1;
          pointer-events: none;
        }

        .youtube-mask-container::after {
          content: "";
          position: absolute;
          top: 8px;
          right: 8px;
          width: 100px;
          height: 50px;
          background: transparent;
          z-index: 1;
          pointer-events: none;
        }
      `}</style>

      <section
        id="couple-video"
        className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-hidden px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10 md:pb-16 md:pt-12`}
        style={{ background: "var(--color-welcome-bg)" }}
      >
        <SectionCornerDecos cornerDecos={cornerDecos} />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative z-20 mx-auto w-full max-w-5xl @container/couple-video"
        >
          <header className="text-center">
            <OrnamentalDivider />
            <div className="mx-auto mt-4 sm:mt-5 md:mt-6">
              <CoupleVideoTitle />
            </div>
            <p
              className={`font-goudy-italic mx-auto mt-4 max-w-xl sm:mt-5 md:mt-6 ${sectionType.textSnug}`}
              style={{ color: "var(--color-welcome-text-soft)" }}
            >
              Watch the journey that brought our hearts together
            </p>
          </header>

          <div className="mt-6 sm:mt-8 md:mt-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative group"
            >
              <div
                className="relative overflow-hidden rounded-lg border transition-shadow duration-500 sm:rounded-xl md:rounded-2xl group-hover:shadow-[0_12px_36px_color-mix(in_srgb,var(--color-motif-deep)_12%,transparent)]"
                style={videoFrameStyle}
              >
                <div className="wedding-frame-inner hidden min-[400px]:block" aria-hidden />

                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-5 top-0 z-10 h-px sm:inset-x-8"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, var(--color-motif-yellow), transparent)",
                  }}
                />

                <div
                  className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-[color-mix(in_srgb,var(--color-motif-soft)_40%,transparent)] via-transparent to-[color-mix(in_srgb,var(--color-motif-silver)_25%,transparent)]"
                  aria-hidden
                />

                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                    {!hasClicked && (
                      <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 cursor-pointer overflow-hidden rounded-[inherit]"
                        onClick={handleThumbnailClick}
                      >
                        <Image
                          src="/desktop-background/couples (32).webp"
                          alt="Video thumbnail"
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          priority
                        />

                        <div
                          className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-85"
                          style={{
                            background:
                              "linear-gradient(to top, color-mix(in srgb, var(--color-welcome-navy) 42%, transparent), color-mix(in srgb, var(--color-motif-deep) 8%, transparent) 55%, transparent)",
                          }}
                        />

                        <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                          >
                            <div
                              className="absolute inset-0 scale-150 rounded-full blur-2xl transition-all duration-300 group-hover:scale-[1.7]"
                              style={{
                                backgroundColor:
                                  "color-mix(in srgb, var(--color-welcome-gold) 40%, transparent)",
                              }}
                            />

                            <div
                              className="relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 sm:h-20 sm:w-20 md:h-24 md:w-24"
                              style={{
                                backgroundColor: "var(--color-welcome-green)",
                                border:
                                  "1px solid color-mix(in srgb, var(--color-welcome-botanical) 50%, transparent)",
                                boxShadow:
                                  "0 8px 24px color-mix(in srgb, var(--color-motif-deep) 18%, transparent), inset 0 1px 0 color-mix(in srgb, var(--color-motif-soft) 55%, transparent)",
                              }}
                            >
                              <Play
                                className="ml-1 h-8 w-8 fill-current sm:h-10 sm:w-10 md:h-12 md:w-12"
                                style={{ color: "var(--color-motif-soft)" }}
                              />
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                    {hasClicked && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="youtube-embed-wrapper absolute inset-0"
                      >
                        <div className="youtube-mask-container relative h-full w-full overflow-hidden">
                          <iframe
                            ref={iframeRef}
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&cc_load_policy=0&fs=1&playsinline=1&enablejsapi=1&origin=${typeof window !== "undefined" ? window.location.origin : ""}`}
                            className="absolute inset-0 h-full w-full"
                            style={{ border: 0 }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            title="Wedding Video"
                          />

                          <div
                            className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-16"
                            style={{
                              background:
                                "linear-gradient(to bottom, color-mix(in srgb, var(--color-welcome-navy) 35%, transparent) 0%, transparent 100%)",
                            }}
                          />

                          <div
                            className="pointer-events-none absolute right-2 top-2 z-10 h-12 w-24 blur-xl"
                            style={{
                              backgroundColor:
                                "color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)",
                              mixBlendMode: "multiply",
                            }}
                          />

                          <div
                            className="pointer-events-none absolute inset-0 z-[5]"
                            style={{
                              background:
                                "radial-gradient(circle at center, transparent 30%, color-mix(in srgb, var(--color-welcome-navy) 4%, transparent) 100%)",
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
            </motion.div>
          </div>

          <footer
            className="mt-8 space-y-4 border-t pt-6 text-center sm:mt-10 sm:space-y-5 sm:pt-8 md:mt-12"
            style={{
              borderColor: "color-mix(in srgb, var(--color-motif-deep) 12%, transparent)",
            }}
          >
            <OrnamentalDivider />
            <p
              className={`font-goudy-italic mx-auto max-w-lg ${sectionType.textSnug}`}
              style={{ color: "var(--color-welcome-text)" }}
            >
              A glimpse into the moments that made our hearts one
            </p>
          </footer>
        </motion.div>
      </section>
    </>
  )
}
