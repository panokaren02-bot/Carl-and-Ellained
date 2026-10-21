"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, useReducedMotion, type Easing, type MotionProps, type TargetAndTransition } from "motion/react"
import { Cinzel } from "next/font/google"
import localFont from "next/font/local"
import { useSiteConfig } from "@/hooks/use-site-config"
import { parseWeddingDate } from "@/lib/wedding-date"
import { InvitePhotoBackdrop } from "@/components/loader/invite-photo-backdrop"
import { SunsetSeaBackdrop } from "@/components/loader/SunsetSeaBackdrop"
import { siteConfig as defaultSiteConfig } from "@/content/site"
import "@/components/loader/loading-screen.css"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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

const entryEase: Easing = [0.22, 1, 0.36, 1]
const heroTitleSize = {
  main: "clamp(3.35rem, min(16vw, 18cqi), 8.25rem)",
  script: "clamp(2.55rem, min(12vw, 14cqi), 5.6rem)",
  overlap: "clamp(-0.95rem, min(-3.8vw, -3.2cqi), -1.85rem)",
} as const

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function formatCeremonyTimePhrase(raw: string) {
  const match = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i)
  if (!match) return raw.toUpperCase()

  let hour24 = Number(match[1])
  const minutes = match[2] ?? "00"
  const meridiem = (match[3] || "").toUpperCase()

  if (meridiem === "PM" && hour24 !== 12) hour24 += 12
  if (meridiem === "AM" && hour24 === 12) hour24 = 0

  const period =
    hour24 >= 17 ? "IN THE EVENING" : hour24 >= 12 ? "IN THE AFTERNOON" : "IN THE MORNING"

  let displayHour = hour24 % 12
  if (displayHour === 0) displayHour = 12

  return `${displayHour}:${minutes} ${period}`
}

function useCeremonyCountdown() {
  const siteConfig = useSiteConfig()

  const targetTimestamp = useMemo(() => {
    const parsedDate = parseWeddingDate(siteConfig.ceremony.date ?? siteConfig.wedding.date)
    const monthMap: Record<string, string> = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    }
    const monthKey =
      parsedDate.month.charAt(0) + parsedDate.month.slice(1).toLowerCase()
    const monthNum = monthMap[monthKey] ?? "11"
    const timeRaw = siteConfig.ceremony.time ?? siteConfig.wedding.time
    const timeMatch = timeRaw.match(/(\d+):(\d+)\s*(AM|PM)/i)

    let hour = 9
    let minutes = 0
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10)
      minutes = parseInt(timeMatch[2], 10)
      const ampm = timeMatch[3].toUpperCase()
      if (ampm === "PM" && hour !== 12) hour += 12
      if (ampm === "AM" && hour === 12) hour = 0
    }

    return new Date(
      Date.UTC(
        parseInt(parsedDate.year, 10),
        parseInt(monthNum, 10) - 1,
        parseInt(parsedDate.day, 10),
        hour - 8,
        minutes,
        0,
      ),
    ).getTime()
  }, [
    siteConfig.ceremony.date,
    siteConfig.ceremony.time,
    siteConfig.wedding.date,
    siteConfig.wedding.time,
  ])

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const tick = () => {
      const difference = targetTimestamp - Date.now()
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      })
    }

    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [targetTimestamp])

  return timeLeft
}

function CountdownUnit({
  value,
  label,
  pad = false,
}: {
  value: number
  label: string
  pad?: boolean
}) {
  const display = pad ? pad2(value) : String(value)

  return (
    <div className="flex min-w-[3rem] flex-1 flex-col items-center sm:min-w-[3.5rem]">
      <span
        className={`${cinzel.className} home-hero-countdown-value text-[clamp(1.2rem,5.4vw,1.75rem)] font-semibold leading-none tabular-nums tracking-[0.04em]`}
      >
        {display}
      </span>
      <span
        className={`${cinzel.className} home-hero-countdown-label mt-1.5 text-[0.48rem] font-medium uppercase tracking-[0.16em] sm:mt-2 sm:text-[0.54rem]`}
      >
        {label}
      </span>
    </div>
  )
}

function HeroCountdown() {
  const timeLeft = useCeremonyCountdown()
  const colonClass = `${cinzel.className} home-hero-countdown-value shrink-0 self-start px-0.5 text-[clamp(1.2rem,5.4vw,1.75rem)] font-semibold leading-none tabular-nums sm:px-1`

  return (
    <div className="relative z-10 w-full px-4 py-4 sm:px-6 sm:py-5">
      <p
        className={`${cinzel.className} home-hero-countdown-heading text-center text-[0.58rem] font-semibold uppercase tracking-[0.22em] sm:text-[0.64rem] sm:tracking-[0.26em]`}
      >
        Time left til we say I do
      </p>
      <div
        className="mx-auto mt-2 flex max-w-md items-start justify-center sm:mt-2.5 sm:max-w-lg"
        aria-live="polite"
        aria-label={`${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds`}
      >
        <CountdownUnit value={timeLeft.days} label="Days" />
        <span className={colonClass} aria-hidden="true">
          :
        </span>
        <CountdownUnit value={timeLeft.hours} label="Hours" pad />
        <span className={colonClass} aria-hidden="true">
          :
        </span>
        <CountdownUnit value={timeLeft.minutes} label="Minutes" pad />
        <span className={colonClass} aria-hidden="true">
          :
        </span>
        <CountdownUnit value={timeLeft.seconds} label="Seconds" pad />
      </div>
    </div>
  )
}

type HeroProps = {
  /** Start the entry choreography (false keeps everything hidden, e.g. under the envelope) */
  play?: boolean
  /** Seconds before the first piece moves — lets the envelope dissolve first */
  delay?: number
}

// Corner sprays bloom out from their own corner, one after another
const CORNERS = [
  { key: "topLeft", className: "left-0 top-0", origin: "top left", order: 0 },
  { key: "topRight", className: "right-0 top-0", origin: "top right", order: 1 },
  { key: "bottomLeft", className: "left-0 bottom-0", origin: "bottom left", order: 2 },
  { key: "bottomRight", className: "right-0 bottom-0", origin: "bottom right", order: 3 },
] as const

export function Hero({ play = true, delay = 0.1 }: HeroProps = {}) {
  const siteConfig = useSiteConfig()
  const loading = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen
  const isPlain = loading.display === "plain"
  const cornerDecos =
    loading.cornerDecos ?? defaultSiteConfig.loadingScreen.cornerDecos
  const backgroundPhotos = loading.backgroundPhotos ?? []
  const reduceMotion = useReducedMotion()

  const parsedDate = useMemo(
    () => parseWeddingDate(siteConfig.ceremony.date ?? siteConfig.wedding.date),
    [siteConfig.ceremony.date, siteConfig.wedding.date],
  )

  const weddingDate = new Date(`${parsedDate.month} ${parsedDate.day}, ${parsedDate.year}`)
  const numericDate = Number.isNaN(weddingDate.getTime())
    ? `${parsedDate.month} ${parsedDate.day}, ${parsedDate.year}`
    : `${pad2(weddingDate.getMonth() + 1)}.${pad2(weddingDate.getDate())}.${parsedDate.year}`

  const ceremonyTimePhrase = formatCeremonyTimePhrase(
    siteConfig.ceremony.time ?? siteConfig.wedding.time,
  )
  const ceremonyName =
    siteConfig.ceremony.location || siteConfig.wedding.venue

  /** Hidden → shown motion props, timed from `delay` once `play` turns on */
  const enter = (
    hidden: TargetAndTransition,
    shown: TargetAndTransition,
    at: number,
    duration = 1,
    ease: Easing = entryEase,
  ): MotionProps => {
    if (reduceMotion) return { initial: false, animate: shown }
    return {
      initial: hidden,
      animate: play ? shown : hidden,
      transition: { duration, delay: play ? delay + at : 0, ease },
    }
  }

  // Opacity + transform only (no blur) so every step stays on the GPU on phones
  const fadeUp = (at: number) => enter({ opacity: 0, y: 12 }, { opacity: 1, y: 0 }, at, 0.65)

  return (
    <section
      id="home"
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} home-hero relative -mt-12 flex min-h-[100dvh] w-full flex-col overflow-hidden sm:-mt-14 md:-mt-16${isPlain ? " home-hero--plain" : " home-hero--photos"}`}
    >
      {isPlain ? (
        <>
          {/* Same watercolor sunset-over-the-sea as the envelope screen (components/loader/Hero.tsx).
              Mounted only once the hero plays: its SVG filters are heavy on phones, and until
              then the envelope's identical sea covers it anyway */}
          {play && <SunsetSeaBackdrop />}
          <div className="home-hero-plain-corners" aria-hidden="true">
            {CORNERS.map((corner) => (
              <motion.img
                key={corner.key}
                src={cornerDecos[corner.key]}
                alt=""
                className={`home-hero-plain-corner-img absolute ${corner.className}`}
                style={{ transformOrigin: corner.origin }}
                {...enter(
                  { opacity: 0, scale: 0.6, rotate: -4 },
                  { opacity: 1, scale: 1, rotate: 0 },
                  corner.order * 0.08,
                  0.9,
                  [0.16, 1, 0.3, 1],
                )}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div
            className="invite-photo-backdrop-wrap invite-photo-backdrop-wrap--section"
            aria-hidden="true"
          >
            <InvitePhotoBackdrop
              className="invite-photo-backdrop--section"
              photos={backgroundPhotos}
            />
          </div>
          <div className="home-hero-photo-scrim pointer-events-none absolute inset-0 z-[1]" aria-hidden="true" />
        </>
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-5 pb-6 pt-[clamp(4.25rem,12vw,7rem)] text-center sm:px-8">
        <motion.h1
          className="relative mx-auto w-full max-w-full @container text-center"
          style={
            {
              "--hero-title-size": heroTitleSize.main,
              "--hero-script-size": heroTitleSize.script,
              "--hero-script-overlap": heroTitleSize.overlap,
            } as React.CSSProperties
          }
        >
          <motion.span
            aria-hidden
            {...enter({ opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1 }, 0, 1)}
            style={{ x: "-50%", y: "-50%" }}
            className="home-hero-title-glow pointer-events-none absolute left-1/2 top-[42%] h-[min(18rem,58vw)] w-[min(36rem,96%)] rounded-full"
          />
          <span className="sr-only">You&apos;re Invited!</span>
          <motion.span
            aria-hidden
            {...enter(
              { opacity: 0, y: 20, scale: 0.96 },
              { opacity: 1, y: 0, scale: 1 },
              0.05,
              0.7,
            )}
            className={`${theSeasons.className} home-hero-title-main relative block uppercase leading-[0.78] tracking-[0.06em] min-[400px]:tracking-[0.09em] sm:tracking-[0.11em] md:tracking-[0.12em]`}
            style={{ fontSize: "var(--hero-title-size)" }}
          >
            You
            <span
              className={`${cinzel.className} relative -top-[0.04em] mx-[0.02em] inline-block font-normal tracking-normal`}
            >
              &rsquo;
            </span>
            re
          </motion.span>
          {/* Script line is written on left to right, like a pen stroke */}
          <motion.span
            aria-hidden
            {...enter(
              { clipPath: "inset(-30% 104% -30% -8%)", opacity: 0.2 },
              { clipPath: "inset(-30% -8% -30% -8%)", opacity: 1 },
              0.3,
              0.85,
              [0.45, 0.05, 0.25, 1],
            )}
            className={`${aboveTheBeyond.className} home-hero-title-script relative z-10 mx-auto block w-fit max-w-full px-1 leading-[0.82] sm:leading-[0.84]`}
            style={{
              marginTop: "var(--hero-script-overlap)",
              fontSize: "var(--hero-script-size)",
            }}
          >
            Invited
            <span
              className={`${cinzel.className} home-hero-title-script relative -top-[0.08em] ml-[0.05em] inline-block font-normal`}
            >
              !
            </span>
          </motion.span>
        </motion.h1>

        <motion.p
          className={`${cinzel.className} home-hero-eyebrow mt-4 max-w-[22rem] text-[clamp(0.68rem,2.8vw,0.86rem)] font-medium uppercase leading-[1.7] tracking-[0.18em] sm:mt-5 sm:max-w-none sm:tracking-[0.22em]`}
          {...fadeUp(0.6)}
        >
          Save the date — we are getting married
        </motion.p>

        <motion.p
          className={`${theSeasons.className} home-hero-date mt-4 text-[clamp(1.85rem,8.5vw,3.65rem)] font-normal leading-none tracking-[0.08em] sm:mt-5`}
          {...enter(
            { opacity: 0, y: 12, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1 },
            0.7,
            0.7,
          )}
        >
          {numericDate}
        </motion.p>

        <motion.p
          className={`${cinzel.className} home-hero-meta mt-4 text-[0.62rem] font-medium uppercase tracking-[0.18em] sm:text-[0.7rem] sm:tracking-[0.2em]`}
          {...fadeUp(0.8)}
        >
          {ceremonyName} · {ceremonyTimePhrase}
        </motion.p>
      </div>

      <motion.div
        className="home-hero-countdown-bar relative z-10 mt-auto w-full"
        {...enter({ opacity: 0, y: "100%" }, { opacity: 1, y: "0%" }, 0.85, 0.7, [0.16, 1, 0.3, 1])}
      >
        <HeroCountdown />
      </motion.div>
    </section>
  )
}