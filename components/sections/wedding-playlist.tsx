"use client"

import { useEffect, useRef } from "react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { useAudio } from "@/contexts/audio-context"
import { Cinzel } from "next/font/google"
import localFont from "next/font/local"
import { Music2, Disc3 } from "lucide-react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { PlainBubbles } from "@/components/loader/PlainBubbles"

interface SpotifyPlaybackUpdate {
  playingURI: string
  isPaused: boolean
  isBuffering: boolean
  duration: number
  position: number
}

interface SpotifyEmbedController {
  addListener: (
    event: "playback_update" | "playback_started" | "ready",
    callback: (event: { data: SpotifyPlaybackUpdate }) => void
  ) => void
  removeListener: (
    event: "playback_update" | "playback_started" | "ready",
    callback: (event: { data: SpotifyPlaybackUpdate }) => void
  ) => void
  destroy: () => void
}

interface SpotifyIframeApi {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: string; height?: string },
    callback: (controller: SpotifyEmbedController) => void
  ) => void
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (IFrameAPI: SpotifyIframeApi) => void
  }
}

let cachedSpotifyIframeApi: SpotifyIframeApi | null = null
const spotifyApiReadyQueue: Array<(api: SpotifyIframeApi) => void> = []

function getSpotifyUri(spotifyUrl: string): string {
  const match = spotifyUrl.match(
    /open\.spotify\.com\/(playlist|album|track|episode)\/([^/?]+)/
  )
  if (!match) return spotifyUrl
  return `spotify:${match[1]}:${match[2]}`
}

function loadSpotifyIframeApi(onReady: (api: SpotifyIframeApi) => void) {
  if (cachedSpotifyIframeApi) {
    onReady(cachedSpotifyIframeApi)
    return
  }

  spotifyApiReadyQueue.push(onReady)

  if (spotifyApiReadyQueue.length > 1) return

  const previousReady = window.onSpotifyIframeApiReady
  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    cachedSpotifyIframeApi = IFrameAPI
    previousReady?.(IFrameAPI)
    spotifyApiReadyQueue.splice(0).forEach((callback) => callback(IFrameAPI))
  }

  const existingScript = document.querySelector(
    'script[src="https://open.spotify.com/embed/iframe-api/v1"]'
  )
  if (!existingScript) {
    const script = document.createElement("script")
    script.src = "https://open.spotify.com/embed/iframe-api/v1"
    script.async = true
    document.body.appendChild(script)
  }
}

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

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

// Palette lives in globals.css → motif / welcome tokens.
// Card is plain light with teal text; buttons are coral (#D96F70).
const TEAL = "#16828F"
const BUTTON = "#D96F70"
const IVORY = "var(--color-motif-soft)"
const PAPER = "var(--color-motif-soft)"
const NAVY = TEAL
const BODY = TEAL
const ACCENT = TEAL
const HAIRLINE = "color-mix(in srgb, #16828F 22%, transparent)"

// Section background = the hero's circle pattern (PlainBubbles paints its own aqua base)
const sectionBg = "var(--color-bg-pattern-base)"

// Text sitting directly on the circle pattern (colors: globals.css → --color-on-pattern*)
const onBg = {
  color: "var(--color-on-pattern)",
  textShadow: "0 1px 0 var(--color-on-pattern-glow), 0 2px 12px var(--color-on-pattern-glow)",
} as const

const cardStyle = {
  background: PAPER,
  boxShadow:
    "0 28px 60px -32px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)",
} as const

const CORNER_DECO_CLASS =
  "block h-auto w-auto max-w-[130px] sm:max-w-[200px] md:max-w-[260px] lg:max-w-[320px] select-none opacity-90"

const ct = {
  body: "text-sm sm:text-[0.95rem] md:text-base",
  bodyLg: "text-sm sm:text-base md:text-lg",
  btn: "text-[0.65rem] sm:text-[0.7rem] md:text-xs",
} as const

const ease = [0.22, 1, 0.36, 1] as const

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}

function DecoImg({ src, className }: { src: string; className: string }) {
  if (!src) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} loading="lazy" decoding="async" alt="" aria-hidden="true" className={className} />
  )
}

// Sits directly on the circle pattern, so drawn in ivory
function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      <span className="h-px w-10 sm:w-16" style={{ background: "var(--color-on-pattern-line)" }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: "var(--color-on-pattern-line)" }} />
      <span className="h-px w-10 sm:w-16" style={{ background: "var(--color-on-pattern-line)" }} />
    </div>
  )
}

// The Seasons has no clean glyphs for symbols / digits — render only those
// characters (e.g. "&", "'", "-", numbers) in Cinzel, keep letters in The Seasons.
function SpecialCharFont({ text }: { text: string }) {
  return (
    <>
      {text.split(/([^\p{L}\s]+)/u).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={`${cinzel.className} tracking-normal`}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

function PlaylistTitle({ title, script }: { title: string; script: string }) {
  return (
    <h2
      className="relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": "clamp(1.6rem, 8.5vw, 4.2rem)",
          "--script-size": "clamp(1rem, 4.2vw, 2.25rem)",
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.85] tracking-[0.06em] min-[400px]:tracking-[0.1em] sm:tracking-[0.14em] md:tracking-[0.16em]`}
        style={{ fontSize: "var(--title-size)", ...onBg }}
      >
        <SpecialCharFont text={title} />
      </span>
      {script ? (
        <>
          <span
            aria-hidden
            className={`${aboveTheBeyond.className} mx-auto mt-2 block w-fit max-w-full px-1 leading-[0.9] sm:mt-3`}
            style={{ fontSize: "var(--script-size)", ...onBg }}
          >
            {script}
          </span>
          <span className="sr-only">{script}</span>
        </>
      ) : null}
    </h2>
  )
}

export function WeddingPlaylist() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.playlist
  const { title, subtitle, spotifyUrl, decos } = content
  const { groomNickname, brideNickname } = siteConfig.couple
  const fillCouple = (text: string) => text.split("{couple}").join(`${groomNickname} & ${brideNickname}`)
  const playlistName = fillCouple(content.playlistName)
  const reduceMotion = useReducedMotion()
  const initial = reduceMotion ? false : "hidden"
  const spotifyUri = getSpotifyUri(spotifyUrl)
  const embedContainerRef = useRef<HTMLDivElement>(null)
  const controllerRef = useRef<SpotifyEmbedController | null>(null)
  const playbackStateRef = useRef<"playing" | "paused">("paused")
  const { pauseMusic, resumeMusic } = useAudio()

  useEffect(() => {
    const container = embedContainerRef.current
    if (!container) return

    let mounted = true

    const handlePlaybackStateChange = (isPlaying: boolean) => {
      if (isPlaying && playbackStateRef.current !== "playing") {
        playbackStateRef.current = "playing"
        pauseMusic()
      } else if (!isPlaying && playbackStateRef.current === "playing") {
        playbackStateRef.current = "paused"
        resumeMusic()
      }
    }

    const initController = (IFrameAPI: SpotifyIframeApi) => {
      if (!mounted || !embedContainerRef.current) return

      IFrameAPI.createController(
        embedContainerRef.current,
        {
          uri: spotifyUri,
          width: "100%",
          // Compact player on phones, full list on larger screens
          height: window.matchMedia("(max-width: 639px)").matches ? "232" : "352",
        },
        (EmbedController) => {
          if (!mounted) return

          controllerRef.current = EmbedController

          const handlePlaybackUpdate = (event: { data: SpotifyPlaybackUpdate }) => {
            handlePlaybackStateChange(!event.data.isPaused)
          }

          const handlePlaybackStarted = () => {
            handlePlaybackStateChange(true)
          }

          EmbedController.addListener("playback_update", handlePlaybackUpdate)
          EmbedController.addListener("playback_started", handlePlaybackStarted)
        }
      )
    }

    loadSpotifyIframeApi(initController)

    return () => {
      mounted = false
      if (playbackStateRef.current === "playing") {
        resumeMusic()
      }
      playbackStateRef.current = "paused"
      controllerRef.current?.destroy()
      controllerRef.current = null
    }
  }, [pauseMusic, resumeMusic, spotifyUri])

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-hidden`}
      style={{ background: sectionBg }}
    >
      {/* Same circle pattern as the hero */}
      <PlainBubbles />
      <section
        id="playlist"
        className="relative z-10 overflow-hidden pt-10 pb-9 sm:pt-16 sm:pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20"
      >
        {/* Corner decorations (from site.ts) */}
        <div className="pointer-events-none absolute left-0 top-0 z-10">
          <DecoImg src={decos.topLeft} className={CORNER_DECO_CLASS} />
        </div>
        <div className="pointer-events-none absolute right-0 top-0 z-10">
          <DecoImg src={decos.topRight} className={CORNER_DECO_CLASS} />
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 z-10">
          <DecoImg src={decos.bottomLeft} className={CORNER_DECO_CLASS} />
        </div>
        <div className="pointer-events-none absolute bottom-0 right-0 z-10">
          <DecoImg src={decos.bottomRight} className={CORNER_DECO_CLASS} />
        </div>

        <div className="relative z-20 mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
          {/* Header */}
          <motion.div
            className="relative px-4 text-center sm:px-10"
            variants={revealVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <DecoImg
              src={decos.headerOrnament}
              className="mx-auto mb-2 block h-auto w-20 select-none sm:mb-4 sm:w-36 md:w-44"
            />
            <DiamondDivider />
            {content.eyebrow ? (
              <p
                className={`${cinzel.className} mt-3 text-[0.625rem] font-semibold uppercase tracking-[0.2em] sm:mt-5 sm:text-[0.8rem] sm:tracking-[0.24em]`}
                style={onBg}
              >
                {content.eyebrow}
              </p>
            ) : null}
            <div className="mx-auto mt-2 sm:mt-4">
              <PlaylistTitle title={title} script={content.script} />
            </div>
            <p
              className={`font-goudy-italic ${ct.bodyLg} mx-auto mt-3 max-w-lg px-2 leading-relaxed sm:mt-5`}
              style={{ ...onBg, fontWeight: 600 }}
            >
              {subtitle}
            </p>
          </motion.div>

          {/* Playlist card — stacked on mobile, side by side on desktop */}
          <motion.div
            className="relative mt-6 overflow-hidden rounded-[1.5rem] sm:mt-10 sm:rounded-[2.25rem] md:mt-12"
            style={cardStyle}
            variants={revealVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            <div className="relative z-20 grid grid-cols-1 items-center gap-4 px-3 py-4 sm:gap-6 sm:px-7 sm:py-9 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-10 md:px-10 md:py-10">
              {/* Info */}
              <div className="flex flex-row items-center gap-3 px-1 text-left sm:flex-col sm:gap-0 sm:px-0 sm:text-center md:items-start md:text-left">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-16 sm:w-16"
                  style={{
                    background: TEAL,
                    boxShadow: `0 0 0 4px ${PAPER}, 0 0 0 5px ${HAIRLINE}, 0 14px 28px -12px color-mix(in srgb, var(--color-welcome-navy) 60%, transparent)`,
                  }}
                  aria-hidden
                >
                  <Disc3
                    className={`h-6 w-6 sm:h-8 sm:w-8 ${reduceMotion ? "" : "animate-[spin_6s_linear_infinite]"}`}
                    style={{ color: IVORY }}
                  />
                </span>
                <div className="min-w-0 sm:contents">
                  <p
                    className={`${cinzel.className} text-[0.55rem] font-semibold uppercase tracking-[0.22em] sm:mt-4 sm:text-[0.65rem]`}
                    style={{ color: ACCENT }}
                  >
                    {content.cardEyebrow}
                  </p>
                  <h3
                    className={`${theSeasons.className} mt-0.5 truncate text-base uppercase leading-tight tracking-[0.06em] sm:mt-1.5 sm:whitespace-normal sm:text-2xl sm:tracking-[0.08em]`}
                    style={{ color: NAVY }}
                    title={playlistName}
                  >
                    <SpecialCharFont text={playlistName} />
                  </h3>
                </div>
                {content.cardNote ? (
                  <p className={`font-goudy-italic ${ct.body} mt-3 hidden max-w-sm leading-relaxed sm:block`} style={{ color: BODY }}>
                    {content.cardNote}
                  </p>
                ) : null}
                <span
                  aria-hidden
                  className="my-5 hidden h-px w-24 md:block"
                  style={{ background: "linear-gradient(to right, color-mix(in srgb, #16828F 45%, transparent), transparent)" }}
                />
                <a
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${cinzel.className} mt-5 hidden items-center sm:inline-flex justify-center gap-2 rounded-full border px-7 py-2.5 font-semibold uppercase tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16828F] sm:py-3 md:mt-0 ${ct.btn}`}
                  style={{
                    background: BUTTON,
                    borderColor: BUTTON,
                    color: IVORY,
                    boxShadow: "0 12px 24px -12px color-mix(in srgb, #D96F70 60%, transparent)",
                  }}
                >
                  <Music2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {content.buttonText}
                </a>
              </div>

              {/* Spotify player */}
              <div
                className="w-full overflow-hidden rounded-2xl p-1.5 sm:p-2"
                style={{ background: IVORY, boxShadow: `0 0 0 1px ${HAIRLINE}, 0 18px 36px -24px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)` }}
              >
                <div
                  ref={embedContainerRef}
                  title={`${playlistName} — Spotify playlist`}
                  aria-label={`${playlistName} — Spotify playlist`}
                  className="h-[232px] w-full overflow-hidden rounded-xl sm:h-[352px] [&_iframe]:block [&_iframe]:border-0"
                  style={{ background: "color-mix(in srgb, #16828F 8%, transparent)" }}
                />
              </div>

              {/* Phone: compact full-width button under the player */}
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${cinzel.className} inline-flex w-full items-center justify-center gap-2 rounded-full py-2.5 font-semibold uppercase tracking-[0.18em] transition-all active:scale-[0.98] sm:hidden ${ct.btn}`}
                style={{
                  background: BUTTON,
                  color: IVORY,
                  boxShadow: "0 10px 20px -12px color-mix(in srgb, #D96F70 60%, transparent)",
                }}
              >
                <Music2 className="h-3.5 w-3.5" />
                {content.buttonText}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
