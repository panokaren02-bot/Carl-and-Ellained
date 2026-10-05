"use client"

import type React from "react"
import { useSiteConfig } from "@/hooks/use-site-config"
import type { TimelineIconName } from "@/content/site"
import { motion } from "motion/react"
import { Cinzel } from "next/font/google"
import localFont from "next/font/local"
import Image from "next/image"

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

const CORNER_DECO_CLASS =
  "block h-auto w-auto max-w-[80px] sm:max-w-[120px] md:max-w-[170px] lg:max-w-[205px] xl:max-w-[245px] select-none"

// Light palette — the section has no background and sits on the sage Silk backdrop.
const IVORY = "var(--color-motif-soft)"
const CREAM = "var(--color-motif-cream)"
const PALE = "var(--color-motif-silver)"
const LINE = "color-mix(in srgb, var(--color-motif-soft) 70%, transparent)"
const entryEase = [0.22, 1, 0.36, 1] as const

// Forest-green halo keeps light text readable over the moving backdrop
const titleShadow =
  "0 1px 0 rgb(48 74 52 / 40%), 0 2px 10px rgb(48 74 52 / 35%), 0 8px 28px rgb(48 74 52 / 22%)"
const textShadow = "0 1px 1px rgb(48 74 52 / 42%), 0 2px 10px rgb(48 74 52 / 28%)"

const lineRight = { background: `linear-gradient(to right, transparent, ${LINE})` } as const
const lineLeft = { background: `linear-gradient(to left, transparent, ${LINE})` } as const
const lineBoth = { background: `linear-gradient(to right, transparent, ${LINE}, transparent)` } as const

type TimelineIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>

interface TimelineEvent {
  time: string
  title: string
  description?: string
  location?: string
  icon: TimelineIcon
  imageSrc?: string
}

function DecoImg({ src, className }: { src: string; className: string }) {
  if (!src) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} loading="lazy" decoding="async" alt="" aria-hidden="true" className={className} />
  )
}

// The Seasons has no clean glyphs for symbols / digits — render only those
// characters (e.g. "&", "-", "'", numbers) in Cinzel, keep letters in The Seasons.
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

function OutsideDivider() {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="h-px w-10 sm:w-16" style={lineRight} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: IVORY }} aria-hidden />
      <span className="h-px w-10 sm:w-16" style={lineLeft} />
    </div>
  )
}

const timelineType = {
  label: "text-[0.7rem] sm:text-[0.75rem] md:text-xs",
  text: "text-[0.875rem] sm:text-[0.9375rem] md:text-[0.9375rem]",
  textRelaxed: "text-[0.875rem] sm:text-[0.9375rem] md:text-[0.9375rem] leading-[1.55] sm:leading-[1.65]",
} as const

const timelineTitleSize = {
  main: "clamp(2.15rem, 11.5vw, 4.95rem)",
  script: "clamp(1.15rem, 5.8vw, 2.55rem)",
} as const

function TimelineKicker({ text }: { text: string }) {
  return (
    <p
      className={`${cinzel.className} mx-auto mt-4 max-w-[20rem] px-2 text-[0.6875rem] font-semibold leading-snug tracking-[0.12em] min-[400px]:max-w-none min-[400px]:text-[0.75rem] min-[400px]:tracking-[0.16em] sm:mt-6 sm:text-[0.875rem] sm:tracking-[0.2em] md:text-[0.9375rem] md:tracking-[0.22em]`}
      style={{ color: PALE, textShadow }}
    >
      {text}
    </p>
  )
}

function TimelineTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": timelineTitleSize.main,
          "--script-size": timelineTitleSize.script,
        } as React.CSSProperties
      }
    >
      <span className="sr-only">{title} — {subtitle}</span>
      <span
        aria-hidden
        className={`${theSeasons.className} block uppercase leading-[0.9] tracking-[0.04em] min-[400px]:tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.14em]`}
        style={{
          fontSize: "var(--title-size)",
          color: IVORY,
          textShadow: titleShadow,
        }}
      >
        <SpecialCharFont text={title} />
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto mt-1.5 block w-fit max-w-[min(100%,22rem)] px-1 leading-[0.88] sm:mt-2 sm:max-w-none sm:leading-[0.9]`}
        style={{
          fontSize: "var(--script-size)",
          color: CREAM,
          textShadow: titleShadow,
        }}
      >
        {subtitle}
      </span>
    </h2>
  )
}

const ICONS: Record<TimelineIconName, TimelineIcon> = {
  arrival: ArrivalIcon,
  rings: RingsIcon,
  departure: DepartureIcon,
  cocktail: CocktailIcon,
  fireworks: FireworksIcon,
  dance: DanceIcon,
}

export function WeddingTimeline() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.weddingTimeline
  const { decos } = content

  const fillVenue = (text: string) =>
    text
      .split("{ceremony}").join(siteConfig.ceremony.location)
      .split("{reception}").join(siteConfig.reception.location)

  // show: false keeps an event in site.ts but leaves it off the page
  const timelineEvents: TimelineEvent[] = content.events
    .filter((event) => event && event.show !== false)
    .map((event) => ({
    time: event.time,
    title: event.title,
    description: event.description || undefined,
    location: event.location ? fillVenue(event.location) : undefined,
    icon: ICONS[event.icon] ?? RingsIcon,
    imageSrc: event.image || undefined,
  }))

  return (
    <div className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full bg-transparent`}>
    <section
      id="wedding-timeline"
      className="relative z-10 overflow-hidden py-10 sm:py-12 md:py-16 lg:py-20"
    >
      {/* Corner decorations (optional, from site.ts) */}
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

      {/* Header */}
      <div className="relative z-20 mx-auto mb-8 max-w-5xl px-3 text-center @container/timeline sm:mb-10 sm:px-4 md:mb-12">
        <div className="mx-auto mb-4 sm:mb-5 md:mb-6">
          <OutsideDivider />
        </div>
        <div className="mx-auto">
          <TimelineKicker text={content.kicker} />
        </div>
        <div className="mx-auto mt-3 sm:mt-4 md:mt-5">
          <TimelineTitle title={content.title} subtitle={content.subtitle} />
        </div>
        <p
          className={`font-goudy-italic mx-auto mt-4 max-w-xl px-2 sm:mt-5 md:mt-6 ${timelineType.textRelaxed}`}
          style={{ color: IVORY, textShadow }}
        >
          {content.description}
        </p>
        <div className="mt-4 flex items-center justify-center sm:mt-5">
          <span className="h-px w-16 sm:w-24 md:w-32" style={lineBoth} />
        </div>
      </div>

      {/* Timeline */}
      <div className="relative z-20 mx-auto max-w-6xl px-3 sm:px-5 lg:px-8">
        <motion.div
          className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-px origin-top -translate-x-1/2"
          initial={{ scaleY: 0, opacity: 0 }}
          whileInView={{ scaleY: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 1.2, ease: entryEase }}
          style={{ background: `linear-gradient(to bottom, transparent, ${LINE}, transparent)` }}
        />

        <div className="space-y-7 sm:space-y-8 md:space-y-10 lg:space-y-12">
          {timelineEvents.map((event, index) => (
            <TimelineItem key={`${event.title}-${event.time}-${index}`} event={event} index={index} />
          ))}
        </div>
      </div>

      {content.quote ? (
        <div className="relative z-20 mx-auto mt-8 max-w-xl px-3 text-center sm:mt-10 md:mt-12">
          <div className="mb-5 flex items-center justify-center sm:mb-6">
            <span className="h-px w-16 sm:w-24 md:w-32" style={lineBoth} />
          </div>
          <blockquote>
            <p
              className={`font-goudy-italic ${timelineType.textRelaxed} italic leading-relaxed`}
              style={{ color: IVORY, textShadow }}
            >
              &ldquo;{content.quote}&rdquo;
            </p>
            {content.quoteCitation ? (
              <footer
                className={`font-goudy-italic mt-2 sm:mt-3 ${timelineType.label} not-italic tracking-wide`}
                style={{ color: PALE, textShadow }}
              >
                — {content.quoteCitation}
              </footer>
            ) : null}
          </blockquote>
        </div>
      ) : null}
    </section>
    </div>
  )
}

function TimelineItem({ event, index }: { event: TimelineEvent; index: number }) {
  const Icon = event.icon
  const isEven = index % 2 === 0
  const fromX = isEven ? -36 : 36

  return (
    <motion.div
      initial={{ opacity: 0, x: fromX, y: 18, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.35, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.78, ease: entryEase }}
      className="relative z-10"
    >
      <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center gap-x-10 lg:gap-x-14">
        <div className={isEven ? "" : "text-right"}>
          <div className="flex items-center justify-end gap-4">
            {!isEven ? (
              <TimelineText event={event} align="right" />
            ) : (
              <IconMark Icon={Icon} imageSrc={event.imageSrc} />
            )}
            <div
              className="hidden h-px w-10 lg:block"
              style={lineRight}
            />
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <span
            className="absolute h-4 w-4 rounded-full"
            style={{ background: "color-mix(in srgb, var(--color-motif-soft) 28%, transparent)" }}
          />
          <div
            className="relative h-2 w-2 rounded-full"
            style={{ background: IVORY, boxShadow: "0 0 8px rgb(48 74 52 / 35%)" }}
          />
        </div>

        <div>
          <div className="flex items-center justify-start gap-4">
            <div
              className="hidden h-px w-10 lg:block"
              style={lineLeft}
            />
            {isEven ? (
              <TimelineText event={event} align="left" />
            ) : (
              <IconMark Icon={Icon} imageSrc={event.imageSrc} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-2.5 sm:gap-x-5 md:hidden">
        <div className={isEven ? "" : "text-right"}>
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            {!isEven ? (
              <TimelineText event={event} align="right" />
            ) : (
              <IconMark Icon={Icon} imageSrc={event.imageSrc} mobile />
            )}
            <div
              className="h-px w-3 shrink-0 sm:w-6"
              style={lineRight}
            />
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <span
            className="absolute h-4 w-4 rounded-full"
            style={{ background: "color-mix(in srgb, var(--color-motif-soft) 28%, transparent)" }}
          />
          <div
            className="relative h-2 w-2 rounded-full"
            style={{ background: IVORY, boxShadow: "0 0 8px rgb(48 74 52 / 35%)" }}
          />
        </div>

        <div>
          <div className="flex items-center justify-start gap-2 sm:gap-3">
            <div
              className="h-px w-3 shrink-0 sm:w-6"
              style={lineLeft}
            />
            {isEven ? (
              <TimelineText event={event} align="left" />
            ) : (
              <IconMark Icon={Icon} imageSrc={event.imageSrc} mobile />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function TimelineText({
  event,
  align,
}: {
  event: TimelineEvent
  align: "left" | "right"
}) {
  const textAlign = align === "right" ? "text-right" : "text-left"

  return (
    <div className={`max-w-md ${textAlign} ${align === "right" ? "ml-auto" : "mr-auto"}`}>
      <p
        className={`${cinzel.className} ${timelineType.label} font-semibold tracking-[0.2em] uppercase`}
        style={{ color: PALE, textShadow }}
      >
        {event.time}
      </p>
      <p
        className={`${theSeasons.className} mt-1 text-[1.15rem] leading-tight tracking-[0.04em] sm:text-[1.25rem] md:text-[1.175rem]`}
        style={{ color: IVORY, textShadow: titleShadow }}
      >
        <SpecialCharFont text={event.title} />
      </p>

      {event.description && (
        <p
          className={`font-goudy-italic ${timelineType.textRelaxed} mt-1.5`}
          style={{ color: CREAM, textShadow }}
        >
          {event.description}
        </p>
      )}

      {event.location && (
        <p
          className={`font-goudy-italic ${timelineType.text} mt-1.5 leading-relaxed`}
          style={{ color: CREAM, textShadow }}
        >
          {event.location}
        </p>
      )}
    </div>
  )
}

function IconMark({
  Icon,
  mobile,
  imageSrc,
}: {
  Icon: TimelineIcon
  mobile?: boolean
  imageSrc?: string
}) {
  if (imageSrc) {
    return (
      <Image
        src={imageSrc}
        alt=""
        width={160}
        height={160}
        className={`${
          mobile ? "h-24 w-24 sm:h-28 sm:w-28" : "h-18 w-18 lg:h-22 lg:w-22"
        } object-contain`}
        // Black line art → warm ivory, with a soft forest halo
        style={{ filter: "brightness(0) invert(1) sepia(0.12) drop-shadow(0 2px 6px rgb(48 74 52 / 45%))" }}
      />
    )
  }

  return (
    <div
      className={`${
        mobile ? "h-20 w-20 sm:h-24 sm:w-24" : "h-16 w-16 lg:h-18 lg:w-18"
      } flex items-center justify-center rounded-full border`}
      style={{
        background: "color-mix(in srgb, var(--color-motif-soft) 14%, transparent)",
        borderColor: LINE,
      }}
    >
      <Icon
        className={`${mobile ? "h-10 w-10" : "h-8 w-8 lg:h-9 lg:w-9"}`}
      />
    </div>
  )
}

const iconStroke = "#FBFCF7" // --color-motif-soft

function ArrivalIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke={iconStroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 28V14L16 6l10 8v14" />
      <path d="M12 28v-8h8v8" />
      <path d="M16 6v-2" />
    </svg>
  )
}

function DepartureIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke={iconStroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 20h18l4-6H11l-2 3H5v3Z" />
      <circle cx="11" cy="23" r="2" />
      <circle cx="21" cy="23" r="2" />
      <path d="M5 20v3h3" />
    </svg>
  )
}

function RingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke={iconStroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="20" r="6" />
      <circle cx="20" cy="20" r="6" />
      <path d="M14 9 16 5l2 4" />
      <path d="M13 7h6" />
    </svg>
  )
}

function FireworksIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke={iconStroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 5v4" />
      <path d="M9 7l2.5 2.5" />
      <path d="M23 7 20.5 9.5" />
      <path d="M8 14h4" />
      <path d="M20 14h4" />
      <path d="M11 21 8 24" />
      <path d="M21 21 24 24" />
      <circle cx="16" cy="14" r="3" />
    </svg>
  )
}

function CocktailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke={iconStroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 28h16" />
      <path d="M16 28V12" />
      <path d="M10 12h12l-1-4H11l-1 4Z" />
      <circle cx="16" cy="8" r="2" />
      <path d="M12 16h8" />
    </svg>
  )
}

function DanceIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke={iconStroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="10" cy="12" r="3" />
      <circle cx="22" cy="12" r="3" />
      <path d="M10 15v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6" />
      <path d="M12 23v2" />
      <path d="M20 23v2" />
      <path d="M8 18h16" />
      <path d="M16 5v4" />
      <path d="M13 7l3-2 3 2" />
    </svg>
  )
}
