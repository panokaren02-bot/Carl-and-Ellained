"use client"

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
  type CSSProperties,
  type ReactNode,
} from "react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { Heart, Check, X, Sparkles, MapPin } from "lucide-react"
import localFont from "next/font/local"
import { Cinzel, Playfair_Display } from "next/font/google"
import { ProposalMixedText, proposalMixedTextInter } from "@/lib/proposal-mixed-text"
import { useSiteConfig } from "@/hooks/use-site-config"
import { Hero as InvitationHero } from "@/components/loader/Hero"
import { LoadingScreen } from "@/components/loader/LoadingScreen"
import { InvitePhotoBackdrop } from "@/components/loader/invite-photo-backdrop"
import { sectionType, welcomeTitleSize } from "@/lib/section-typography"
import { sectionBackground } from "@/lib/section-background"
import { siteConfig as defaultSiteConfig } from "@/content/site"
import { parseWeddingDate } from "@/lib/wedding-date"
import type { ProposalRole } from "@/lib/proposal-types"
import { parseInviteeNameFromSearchParams } from "@/lib/proposal-invite-link"

const Silk = dynamic(() => import("@/components/silk"), { ssr: false })

const proposalEntryEase = [0.22, 1, 0.36, 1] as const
const CINEMATIC_ENTRY_MS = 3000

const CORNER_DECO_CLASS =
  "block h-auto w-auto max-w-[52px] min-[380px]:max-w-[60px] sm:max-w-[130px] md:max-w-[185px] lg:max-w-[220px] select-none pointer-events-none opacity-90 sm:opacity-100"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
})

const inter = proposalMixedTextInter

const theSeasons = localFont({
  src: "../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const aboveTheBeyond = localFont({
  src: "../Font/above-the-beyond-script.otf",
  display: "swap",
  variable: "--font-above-beyond",
})

const IVORY = "var(--color-motif-soft)"
const CHAMPAGNE = "var(--color-welcome-gold)"
const INK = "var(--color-welcome-navy)"
const CREAM = "var(--color-welcome-text)"
const LABEL_GOLD = "var(--color-welcome-heading)"
const SCRIPT_GREEN = "var(--color-welcome-green)"
const GOLD_BORDER = "color-mix(in srgb, var(--color-welcome-gold) 38%, transparent)"
const GOLD_BORDER_SOFT = "color-mix(in srgb, var(--color-welcome-gold) 22%, transparent)"
const INNER_SURFACE = "var(--color-welcome-bg-soft)"

const goldGradientText: CSSProperties = {
  background:
    "linear-gradient(168deg, var(--color-welcome-navy) 0%, var(--color-welcome-heading) 55%, color-mix(in srgb, var(--color-welcome-green) 70%, var(--color-welcome-navy)) 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
}

const palette = {
  body: CREAM,
  bodySoft: "var(--color-welcome-text-soft)",
  heading: INK,
  label: LABEL_GOLD,
  script: SCRIPT_GREEN,
} as const

const ambientGlowStyle = {
  background:
    "radial-gradient(ellipse 80% 65% at 50% 50%, color-mix(in srgb, var(--color-welcome-gold) 18%, transparent), transparent 68%)",
} as const

const dividerLineStyle = {
  background:
    "linear-gradient(to right, transparent, color-mix(in srgb, var(--color-welcome-gold) 65%, transparent), transparent)",
} as const

const primaryBtnStyle: CSSProperties = {
  background:
    "linear-gradient(180deg, var(--color-motif-accent) 0%, var(--color-motif-deep) 55%, var(--color-welcome-navy) 100%)",
  borderColor: GOLD_BORDER,
  color: IVORY,
  boxShadow: "0 12px 24px -12px color-mix(in srgb, var(--color-welcome-navy) 70%, transparent)",
}

const secondaryBtnStyle: CSSProperties = {
  color: INK,
  backgroundColor: "color-mix(in srgb, var(--color-welcome-bg-soft) 85%, transparent)",
  borderColor: GOLD_BORDER,
}

const primaryBtnClass =
  `${cinzel.className} touch-manipulation inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full border px-5 py-3.5 text-[0.72rem] font-semibold uppercase leading-snug tracking-[0.14em] transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 sm:px-8 sm:text-xs sm:tracking-[0.2em] sm:hover:scale-[1.02]`

const secondaryBtnClass =
  `${cinzel.className} touch-manipulation inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full border px-5 py-3 text-[0.66rem] font-semibold uppercase leading-snug tracking-[0.12em] transition-all duration-300 active:scale-[0.98] sm:px-8 sm:text-[0.7rem] sm:tracking-[0.18em] sm:hover:scale-[1.02]`

/* ── Invitation types (wording lives in site.ts → proposal.copy) ──────────── */

type CopyKey = "party" | "sponsor" | "bearer" | "flowerGirl"

const CEREMONY_BEARER_ROLE_IDS = new Set(["ring-bearer", "coin-bearer", "bible-bearer", "herald-bearer"])

function copyKeyFor(role: ProposalRole): CopyKey {
  if (role.type === "sponsor-ninong" || role.type === "sponsor-ninang") return "sponsor"
  if (role.id === "flower-girl") return "flowerGirl"
  if (CEREMONY_BEARER_ROLE_IDS.has(role.id)) return "bearer"
  return "party"
}

function isPlayful(key: CopyKey) {
  return key === "bearer" || key === "flowerGirl"
}

/* ── Small pieces ─────────────────────────────────────────────────────────── */

/** Config text with emoji / apostrophes / "&" / "!" in a clean font (display fonts lack them). */
function T({ text, className = "" }: { text: string; className?: string }) {
  return (
    <ProposalMixedText
      text={text}
      className={className}
      specialClassName={`${inter.className} inline-block align-baseline text-[0.95em] leading-none font-normal not-italic tracking-normal`}
    />
  )
}

function ProposalCornerDecorations() {
  const decos = useSiteConfig().proposal.decos
  const corners = [
    { src: decos.topLeft, pos: "left-0 top-0" },
    { src: decos.topRight, pos: "right-0 top-0" },
    { src: decos.bottomLeft, pos: "bottom-0 left-0" },
    { src: decos.bottomRight, pos: "bottom-0 right-0" },
  ]
  return (
    <>
      {corners.map(({ src, pos }) =>
        src ? (
          <div key={pos} className={`pointer-events-none absolute z-[5] ${pos}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" aria-hidden className={CORNER_DECO_CLASS} />
          </div>
        ) : null,
      )}
    </>
  )
}

function OrnamentalDivider({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`mx-auto flex items-center justify-center gap-2 ${compact ? "max-w-[10rem]" : "max-w-xs sm:max-w-sm"}`}
      aria-hidden
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--color-welcome-gold)_65%,transparent)] to-transparent" />
      <span className="h-1 w-1 rotate-45 bg-[var(--color-welcome-gold)]" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[color-mix(in_srgb,var(--color-welcome-gold)_65%,transparent)] to-transparent" />
    </div>
  )
}

function DividerLine({ className = "w-16 sm:w-24 md:w-32" }: { className?: string }) {
  return <span className={`block h-px ${className}`} style={dividerLineStyle} aria-hidden />
}

function SmallCaps({
  children,
  className = "",
  color = palette.label,
}: {
  children: ReactNode
  className?: string
  color?: string
}) {
  return (
    <p
      className={`${cinzel.className} text-[0.64rem] font-semibold uppercase leading-relaxed tracking-[0.2em] sm:text-[0.7rem] sm:tracking-[0.24em] ${className}`}
      style={{ color }}
    >
      {children}
    </p>
  )
}

/** "JV & Jemiree" in The Seasons with a script "&". */
function CoupleNamesText({ className = "" }: { className?: string }) {
  const siteConfig = useSiteConfig()
  const groom = siteConfig.couple.groomNickname || siteConfig.couple.groom
  const bride = siteConfig.couple.brideNickname || siteConfig.couple.bride
  return (
    <p className={`${theSeasons.className} uppercase leading-snug tracking-[0.12em] ${className}`} style={{ color: INK }}>
      {groom}
      <span
        className={`${aboveTheBeyond.className} mx-2 inline-block text-[1.25em] normal-case tracking-normal`}
        style={{ color: SCRIPT_GREEN }}
        aria-hidden
      >
        &
      </span>
      <span className="sr-only">and</span>
      {bride}
    </p>
  )
}

function LayeredProposalTitle({ main, script }: { main: string; script: string }) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--welcome-size": welcomeTitleSize.main,
          "--script-size": welcomeTitleSize.script,
          "--script-overlap": welcomeTitleSize.overlap,
        } as CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.92] tracking-[0.05em] min-[400px]:tracking-[0.08em] sm:leading-[0.94] sm:tracking-[0.12em] md:tracking-[0.14em]`}
        style={{ fontSize: "var(--welcome-size)", ...goldGradientText }}
      >
        <T text={main} />
      </span>
      {script ? (
        <>
          <span
            aria-hidden
            className={`${aboveTheBeyond.className} relative z-10 mx-auto block w-fit max-w-full px-1 leading-[1]`}
            style={{ marginTop: "var(--script-overlap)", fontSize: "var(--script-size)", color: SCRIPT_GREEN }}
          >
            <T text={script} />
          </span>
          <span className="sr-only">{script}</span>
        </>
      ) : null}
    </h2>
  )
}

function Paragraphs({ lines, className = "" }: { lines: readonly string[]; className?: string }) {
  if (lines.length === 0) return null
  return (
    <div className={`mx-auto max-w-md space-y-3.5 text-pretty sm:space-y-4 ${className}`} style={{ color: palette.body }}>
      {lines.map((line, i) => (
        <p key={i}>
          <T text={line} />
        </p>
      ))}
    </div>
  )
}

/* ── Card shell ───────────────────────────────────────────────────────────── */

function ProposalCard({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="pointer-events-none absolute -inset-3 rounded-[2rem] opacity-60 blur-2xl" style={ambientGlowStyle} aria-hidden />
      <div
        className="relative overflow-hidden rounded-[1.5rem] border sm:rounded-[1.85rem]"
        style={{
          background: `linear-gradient(170deg, ${IVORY} 0%, var(--color-welcome-bg-soft) 50%, var(--color-motif-cream) 100%)`,
          borderColor: GOLD_BORDER,
          boxShadow:
            "0 24px 56px -30px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent), inset 0 1px 0 rgb(255 255 255 / 85%)",
        }}
      >
        {/* Double hairline frame, with a small diamond on the top and bottom edge */}
        <div
          className="pointer-events-none absolute inset-2.5 rounded-[1.15rem] sm:inset-4 sm:rounded-[1.4rem]"
          style={{ border: `1px solid ${GOLD_BORDER_SOFT}` }}
          aria-hidden
        >
          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45" style={{ background: CHAMPAGNE }} />
          <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45" style={{ background: CHAMPAGNE }} />
        </div>
        <div
          className="pointer-events-none absolute inset-[0.95rem] rounded-[0.95rem] sm:inset-[1.4rem] sm:rounded-[1.15rem]"
          style={{ border: "1px solid color-mix(in srgb, var(--color-welcome-gold) 12%, transparent)" }}
          aria-hidden
        />

        <div className="relative z-20 px-6 py-10 text-center sm:px-12 sm:py-14 md:px-14">{children}</div>
      </div>
    </div>
  )
}

/**
 * Couple-name lettering tinted with the motif gradient (same treatment as the opening screen).
 * The PNG is used as a mask, so any lettering image picks up the theme colours.
 */
function CoupleNameLockup({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mx-auto w-full max-w-[14rem] sm:max-w-[18rem]">
      {/* Invisible copy keeps the image's natural proportions */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="block h-auto w-full select-none opacity-0" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(118deg, var(--couple-name-fill, var(--color-welcome-navy)) 0%, var(--couple-name-fill-mid, var(--color-motif-deep)) 48%, var(--couple-name-fill-accent, var(--color-welcome-heading)) 100%)",
          WebkitMaskImage: `url("${src}")`,
          maskImage: `url("${src}")`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          filter:
            "drop-shadow(0 1px 0 rgb(255 255 255 / 70%)) drop-shadow(0 6px 14px color-mix(in srgb, var(--color-welcome-navy) 18%, transparent))",
        }}
      />
    </div>
  )
}

/** Classic invitation date: month / weekday — day — time / year. */
function DateLockup() {
  const siteConfig = useSiteConfig()
  const dateStr = siteConfig.ceremony.date ?? siteConfig.wedding.date ?? defaultSiteConfig.ceremony.date
  const time = siteConfig.ceremony.time ?? siteConfig.wedding.time ?? defaultSiteConfig.ceremony.time
  const parsed = parseWeddingDate(dateStr)
  const weekday = siteConfig.ceremony.day || parsed.dayOfWeek
  const side = `${cinzel.className} w-[5.5rem] text-[0.6rem] font-semibold uppercase tracking-[0.24em] sm:w-28 sm:text-[0.7rem] sm:tracking-[0.3em]`

  return (
    <div className="mx-auto mt-6 w-full max-w-sm sm:mt-7" aria-label={`${weekday}, ${dateStr} at ${time}`}>
      <p className={`${theSeasons.className} text-[clamp(1.05rem,4.4vw,1.4rem)] uppercase leading-none tracking-[0.22em]`} style={{ color: INK }}>
        {parsed.month}
      </p>
      <div className="mt-2 flex items-center justify-center gap-2 sm:gap-3">
        <div className="flex flex-col items-center gap-1.5">
          <DividerLine className="w-full" />
          <span className={side} style={{ color: palette.label }}>{weekday}</span>
          <DividerLine className="w-full" />
        </div>
        <span className="relative px-1">
          <span className="absolute inset-0 -z-0 rounded-full opacity-80 blur-xl" style={ambientGlowStyle} aria-hidden />
          <span
            className={`${playfair.className} relative block text-[clamp(2.8rem,13vw,4.25rem)] font-semibold italic leading-[0.95] tabular-nums`}
            style={goldGradientText}
          >
            {parsed.day}
          </span>
        </span>
        <div className="flex flex-col items-center gap-1.5">
          <DividerLine className="w-full" />
          <span className={side} style={{ color: palette.label }}>{time}</span>
          <DividerLine className="w-full" />
        </div>
      </div>
      <p className={`${cinzel.className} mt-2 text-[0.8rem] font-semibold tracking-[0.42em] sm:text-sm`} style={goldGradientText}>
        {parsed.year}
      </p>
    </div>
  )
}

/** Top of the invitation card: sprig, eyebrow, couple names with sprigs, script line, date. */
function CardHeader() {
  const siteConfig = useSiteConfig()
  const { ornament, labels, coupleNameImage, nameDecos, showDate } = siteConfig.proposal
  const groom = siteConfig.couple.groomNickname || siteConfig.couple.groom
  const bride = siteConfig.couple.brideNickname || siteConfig.couple.bride
  const sprig = "pointer-events-none absolute top-1/2 h-auto w-12 -translate-y-1/2 select-none opacity-90 sm:w-20"

  return (
    <header className="mb-8 sm:mb-10">
      {ornament ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ornament} alt="" aria-hidden className="mx-auto mb-3 block h-auto w-24 select-none sm:mb-4 sm:w-32" />
      ) : null}
      {labels.headerEyebrow ? (
        <SmallCaps className="mb-4">
          <T text={labels.headerEyebrow} />
        </SmallCaps>
      ) : null}

      {/* Names flanked by eucalyptus sprigs */}
      <div className="relative mx-auto max-w-md px-10 sm:px-16">
        {nameDecos?.left ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={nameDecos.left} alt="" aria-hidden className={`${sprig} left-0`} />
        ) : null}
        {nameDecos?.right ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={nameDecos.right} alt="" aria-hidden className={`${sprig} right-0`} />
        ) : null}
        {coupleNameImage ? (
          <CoupleNameLockup src={coupleNameImage} alt={`${groom} and ${bride}`} />
        ) : (
          <CoupleNamesText className="text-[clamp(1.3rem,5vw,1.8rem)]" />
        )}
      </div>

      {labels.headerScript ? (
        <p className={`${aboveTheBeyond.className} mt-3 text-[clamp(1.05rem,4.6vw,1.5rem)] leading-none`} style={{ color: SCRIPT_GREEN }}>
          <T text={labels.headerScript} />
        </p>
      ) : null}

      {showDate ? <DateLockup /> : null}

      <div className="mt-6">
        <OrnamentalDivider />
      </div>
    </header>
  )
}

function SignOff({ line }: { line: string }) {
  if (!line) return null
  return (
    <div className="text-center">
      <SmallCaps color={palette.bodySoft}>
        <T text={line} />
      </SmallCaps>
      <CoupleNamesText className="mt-1 text-base" />
    </div>
  )
}

/* ── The letter ───────────────────────────────────────────────────────────── */

function ProposalLetter({
  copyKey,
  inviteeName,
  roleTitle,
  fill,
  bodyClass,
}: {
  copyKey: CopyKey
  inviteeName: string
  roleTitle: string
  fill: (text: string) => string
  bodyClass: string
}) {
  const siteConfig = useSiteConfig()
  const copy = siteConfig.proposal.copy[copyKey]
  const { labels } = siteConfig.proposal
  const playful = isPlayful(copyKey)

  const ceremonyDate = siteConfig.ceremony.date ?? siteConfig.wedding.date ?? defaultSiteConfig.ceremony.date
  const ceremonyDay = siteConfig.ceremony.day ?? defaultSiteConfig.ceremony.day
  const ceremonyTime = siteConfig.ceremony.time ?? siteConfig.wedding.time ?? defaultSiteConfig.ceremony.time
  const venueName = siteConfig.ceremony.location ?? defaultSiteConfig.ceremony.location
  const venueDetail = siteConfig.ceremony.venue ?? defaultSiteConfig.ceremony.venue
  const venue = `${venueName}${venueDetail && venueDetail !== venueName ? `, ${venueDetail}` : ""}`
  const greetingName = inviteeName.trim() || "Friend"

  return (
    <div className="mx-auto w-full max-w-lg space-y-7 text-center sm:space-y-8">
      {/* Greeting */}
      <div className="space-y-3">
        <p
          className={
            playful
              ? `${playfair.className} text-[clamp(1.4rem,6vw,1.9rem)] font-semibold leading-tight [overflow-wrap:anywhere]`
              : `${theSeasons.className} text-[clamp(1.3rem,5.6vw,1.9rem)] leading-tight tracking-[0.05em] [overflow-wrap:anywhere]`
          }
          style={{ color: INK }}
        >
          <T text={`${fill(copy.greeting)} ${greetingName},`} />
        </p>
        <OrnamentalDivider compact />
      </div>

      <Paragraphs lines={copy.intro.map(fill)} className={bodyClass} />

      {/* Save the date */}
      <div
        className="relative mx-auto max-w-md overflow-hidden rounded-2xl border px-5 py-6 sm:px-8 sm:py-7"
        style={{ background: INNER_SURFACE, borderColor: GOLD_BORDER_SOFT }}
      >
        <div className="pointer-events-none absolute inset-1.5 rounded-xl" style={{ border: `1px solid ${GOLD_BORDER_SOFT}` }} aria-hidden />
        {labels.saveTheDate ? (
          <SmallCaps className="relative tracking-[0.32em]">
            <T text={labels.saveTheDate} />
          </SmallCaps>
        ) : null}
        <p className={`${cinzel.className} relative mt-3 text-[0.8rem] font-medium tracking-[0.1em] sm:text-sm sm:tracking-[0.14em]`} style={{ color: INK }}>
          {ceremonyDate}
        </p>
        <p className={`${cinzel.className} relative mt-1 text-[0.7rem] tracking-[0.12em] sm:text-xs`} style={{ color: palette.bodySoft }}>
          {ceremonyDay}
          <span className="mx-2 opacity-50" aria-hidden>·</span>
          {ceremonyTime}
        </p>
        <DividerLine className="relative mx-auto my-3.5 w-16" />
        <p
          className="font-goudy-italic relative mx-auto flex max-w-sm items-start justify-center gap-1.5 text-[0.9rem] leading-snug sm:text-[0.95rem]"
          style={{ color: palette.body }}
        >
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: palette.label }} aria-hidden />
          <span>
            <T text={venue} />
          </span>
        </p>
      </div>

      <Paragraphs lines={copy.body.map(fill)} className={bodyClass} />

      {/* Role / name summary (wedding party only, when the link carries a name) */}
      {copyKey === "party" && inviteeName.trim() ? (
        <div
          className="mx-auto grid max-w-md grid-cols-2 gap-px overflow-hidden rounded-2xl border"
          style={{ borderColor: GOLD_BORDER_SOFT, background: GOLD_BORDER_SOFT }}
        >
          {[
            { label: labels.roleOffered, value: roleTitle, color: INK },
            { label: labels.preparedFor, value: inviteeName.trim(), color: SCRIPT_GREEN },
          ].map((cell) => (
            <div key={cell.label} className="px-3 py-4 sm:px-4 sm:py-5" style={{ background: IVORY }}>
              <SmallCaps className="text-[0.58rem] sm:text-[0.62rem]">
                <T text={cell.label} />
              </SmallCaps>
              <p
                className={`${theSeasons.className} mt-1.5 text-[0.98rem] tracking-wide [overflow-wrap:anywhere] sm:text-lg`}
                style={{ color: cell.color }}
              >
                <T text={cell.value} />
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {copy.askLead ? (
        <SmallCaps className="mx-auto max-w-sm">
          <T text={fill(copy.askLead)} />
        </SmallCaps>
      ) : null}
    </div>
  )
}

function ProposalAsk({
  copyKey,
  roleTitle,
  submitting,
  onYes,
  onNo,
  fill,
  bodyClass,
}: {
  copyKey: CopyKey
  roleTitle: string
  submitting?: boolean
  onYes: () => void
  onNo: () => void
  fill: (text: string) => string
  bodyClass: string
}) {
  const siteConfig = useSiteConfig()
  const copy = siteConfig.proposal.copy[copyKey]
  const { labels, coupleImage } = siteConfig.proposal

  return (
    <div
      className="relative mx-auto mt-8 w-full max-w-lg rounded-2xl border px-5 py-8 sm:mt-10 sm:px-8 sm:py-10"
      style={{ borderColor: GOLD_BORDER_SOFT, background: "color-mix(in srgb, var(--color-welcome-bg-soft) 60%, transparent)" }}
    >
      {coupleImage ? (
        <div className="relative mx-auto mb-5 w-[7.5rem] sm:mb-7 sm:w-[9.5rem]">
          <div className="absolute -inset-3 rounded-full opacity-70 blur-xl" style={ambientGlowStyle} aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coupleImage}
            alt="The couple"
            className="relative mx-auto block h-auto w-full select-none drop-shadow-[0_14px_28px_rgba(48,74,52,0.18)]"
          />
        </div>
      ) : null}

      <h2 className={`${theSeasons.className} mx-auto max-w-md text-[clamp(1.15rem,5.2vw,1.6rem)] leading-snug tracking-[0.04em]`} style={{ color: INK }}>
        <T text={labels.askQuestion} />
        <span className="block pt-1 text-[1.3em] capitalize [overflow-wrap:anywhere]" style={goldGradientText}>
          <T text={`${roleTitle}?`} />
        </span>
      </h2>

      {copy.askNote ? (
        <div className="mt-4">
          <Paragraphs lines={[fill(copy.askNote)]} className={bodyClass} />
        </div>
      ) : null}

      <div className="mx-auto mt-7 flex w-full max-w-sm flex-col gap-3 sm:mt-9">
        <button type="button" disabled={submitting} onClick={onYes} className={primaryBtnClass} style={primaryBtnStyle}>
          {submitting ? labels.saving : <T text={fill(copy.yesButton)} />}
        </button>
        <button type="button" disabled={submitting} onClick={onNo} className={secondaryBtnClass} style={secondaryBtnStyle}>
          <T text={fill(copy.noButton)} />
        </button>
      </div>
    </div>
  )
}

/** Header for the after-answer cards (icon + layered title + subheader). */
function FlowHeader({
  icon,
  title,
  script,
  subheader,
  animated = false,
}: {
  icon: ReactNode
  title: string
  script: string
  subheader: string
  animated?: boolean
}) {
  const iconNode = (
    <div
      className="flex h-14 w-14 items-center justify-center rounded-full border shadow-sm"
      style={{ borderColor: GOLD_BORDER, background: INNER_SURFACE }}
    >
      {icon}
    </div>
  )
  return (
    <div className="mb-6">
      <div className="mb-6 flex justify-center">
        {animated ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.6 }}>
            {iconNode}
          </motion.div>
        ) : (
          iconNode
        )}
      </div>
      <LayeredProposalTitle main={title} script={script} />
      {subheader ? (
        <SmallCaps className="mx-auto mt-5 max-w-md">
          <T text={subheader} />
        </SmallCaps>
      ) : null}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

type ProposalFlowState = "question" | "yes_details" | "yes_submitted" | "no_clicked" | "no_submitted"

interface ProposalPageProps {
  role: ProposalRole
}

function ProposalPageInner({ role }: ProposalPageProps) {
  const searchParams = useSearchParams()
  const inviteeFromLink = useMemo(() => parseInviteeNameFromSearchParams(searchParams), [searchParams])

  const [flowState, setFlowState] = useState<ProposalFlowState>("question")
  const [preferredName, setPreferredName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [validationError, setValidationError] = useState("")
  const [showInvitation, setShowInvitation] = useState(false)
  const [loadingOverlayVisible, setLoadingOverlayVisible] = useState(true)
  const [heroEnterFromLoading, setHeroEnterFromLoading] = useState(false)
  const [proposalVisible, setProposalVisible] = useState(false)
  const [enteringFromInvite, setEnteringFromInvite] = useState(false)

  const handleLoadingFadeStart = useCallback(() => {
    setShowInvitation(true)
    setHeroEnterFromLoading(true)
  }, [])

  const handleLoadingComplete = useCallback(() => {
    setLoadingOverlayVisible(false)
  }, [])

  const handleTransitionStart = useCallback(() => {
    setEnteringFromInvite(true)
    setProposalVisible(true)
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [])

  const handleOpenInvitation = useCallback(() => {
    setShowInvitation(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
    window.setTimeout(() => setEnteringFromInvite(false), CINEMATIC_ENTRY_MS)
  }, [])

  const pageScrollLocked = loadingOverlayVisible || showInvitation
  const cinematicEntry = enteringFromInvite && proposalVisible

  useEffect(() => {
    if (inviteeFromLink) {
      setPreferredName(inviteeFromLink)
    }
  }, [inviteeFromLink])

  const siteConfig = useSiteConfig()
  const { labels } = siteConfig.proposal
  const copyKey = copyKeyFor(role)
  const copy = siteConfig.proposal.copy[copyKey]
  const confirmedDisplayName = (inviteeFromLink || preferredName).trim()

  const groom = siteConfig.couple.groomNickname || siteConfig.couple.groom
  const bride = siteConfig.couple.brideNickname || siteConfig.couple.bride
  const fill = (text: string) =>
    text
      .split("{name}").join(confirmedDisplayName || "Friend")
      .split("{role}").join(role.title)
      .split("{groom}").join(groom)
      .split("{bride}").join(bride)

  // Playful roles (bearers, flower girl) read in Playfair; the rest in Goudy italic
  const bodyClass = isPlayful(copyKey)
    ? `${playfair.className} text-[0.95rem] font-medium leading-[1.7] sm:text-base`
    : `font-goudy-italic text-[0.98rem] sm:text-[1.05rem] ${sectionType.textRelaxed}`

  const submitResponse = async (status: "Confirmed" | "Declined", name: string) => {
    const response = await fetch("/api/proposal-responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: role.id,
        name,
        status,
        submittedAt: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to submit response")
    }

    window.dispatchEvent(new Event("entourageUpdated"))
  }

  const handleYesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!preferredName.trim()) {
      setValidationError(labels.nameForm.required)
      return
    }
    setValidationError("")
    setSubmitting(true)

    try {
      await submitResponse("Confirmed", preferredName.trim())
      setFlowState("yes_submitted")
    } catch (err) {
      console.error("Failed to submit confirmation:", err)
      setValidationError(labels.saveError)
    } finally {
      setSubmitting(false)
    }
  }

  const handleNoSubmit = async () => {
    setSubmitting(true)
    setValidationError("")
    try {
      const declineLabel = confirmedDisplayName ? `${confirmedDisplayName} (declined)` : "Declined Entourage Offer"
      await submitResponse("Declined", declineLabel)
      setFlowState("no_submitted")
    } catch (err) {
      console.error("Failed to submit decline:", err)
      setValidationError(labels.saveError)
    } finally {
      setSubmitting(false)
    }
  }

  const handleYesClick = async () => {
    const name = (inviteeFromLink || preferredName).trim()
    if (!name) {
      setFlowState("yes_details")
      return
    }
    setPreferredName(name)
    setValidationError("")
    setSubmitting(true)
    try {
      await submitResponse("Confirmed", name)
      setFlowState("yes_submitted")
    } catch (err) {
      console.error("Failed to submit confirmation:", err)
      setValidationError(labels.saveError)
    } finally {
      setSubmitting(false)
    }
  }

  const goTo = (state: ProposalFlowState) => {
    setValidationError("")
    setFlowState(state)
  }

  const errorLine = validationError ? (
    <p className="mt-4 text-center text-sm font-medium" style={{ color: "var(--color-motif-deep)" }} role="alert">
      <T text={validationError} />
    </p>
  ) : null

  const cardMotion = {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
    transition: { duration: 0.5, ease: "easeOut" as const },
  }

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative min-h-[100dvh] select-none px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:py-16 md:py-20 ${pageScrollLocked ? "overflow-hidden" : "overflow-x-hidden"}`}
      style={{ background: sectionBackground, color: CREAM }}
    >
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.22]" aria-hidden>
        <Suspense fallback={<div className="h-full w-full" style={{ background: sectionBackground }} />}>
          <Silk speed={6} scale={1} color="#9EAF91" noiseIntensity={0} rotation={0.25} />
        </Suspense>
      </div>

      {loadingOverlayVisible && (
        <div className="invite-photo-backdrop-wrap invite-photo-backdrop-wrap--loading" aria-hidden="true">
          <InvitePhotoBackdrop />
        </div>
      )}

      {loadingOverlayVisible && (
        <LoadingScreen onFadeStart={handleLoadingFadeStart} onComplete={handleLoadingComplete} />
      )}

      {(loadingOverlayVisible || showInvitation) && (
        <InvitationHero
          onOpen={handleOpenInvitation}
          onTransitionStart={handleTransitionStart}
          enterFromLoading={heroEnterFromLoading}
          visible={showInvitation}
        />
      )}

      {cinematicEntry && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[28] bg-[var(--color-welcome-bg)]"
          aria-hidden="true"
          initial={{ clipPath: "circle(0% at 50% 46%)", opacity: 0.98 }}
          animate={{ clipPath: "circle(145% at 50% 46%)", opacity: 0 }}
          transition={{ duration: 1.55, delay: 0.12, ease: proposalEntryEase }}
        />
      )}

      <motion.div
        initial={false}
        animate={proposalVisible ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 40, filter: "blur(8px)" }}
        transition={cinematicEntry ? { duration: 1.08, ease: proposalEntryEase, delay: 0.86 } : { duration: 0.01 }}
        className={`relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center justify-start pt-6 pb-4 sm:min-h-[calc(100dvh-8rem)] sm:justify-center sm:pt-0 ${proposalVisible ? "" : "pointer-events-none"}`}
        style={{ color: palette.body }}
      >
        {proposalVisible && <ProposalCornerDecorations />}

        <AnimatePresence mode="wait">
          {flowState === "question" && (
            <motion.div key="question" className="relative z-10 w-full" {...cardMotion}>
              <ProposalCard>
                <CardHeader />
                <ProposalLetter
                  copyKey={copyKey}
                  inviteeName={inviteeFromLink || preferredName}
                  roleTitle={role.title}
                  fill={fill}
                  bodyClass={bodyClass}
                />
                <ProposalAsk
                  copyKey={copyKey}
                  roleTitle={role.title}
                  submitting={submitting}
                  onYes={() => void handleYesClick()}
                  onNo={() => goTo("no_clicked")}
                  fill={fill}
                  bodyClass={bodyClass}
                />
                {errorLine}
                <div className="mt-9 space-y-4 sm:mt-10">
                  <OrnamentalDivider compact />
                  <SignOff line={fill(copy.signOff)} />
                </div>
              </ProposalCard>
            </motion.div>
          )}

          {flowState === "yes_details" && (
            <motion.form key="yes-form" onSubmit={handleYesSubmit} className="relative z-10 w-full" {...cardMotion}>
              <ProposalCard>
                <FlowHeader
                  icon={<Check className="h-6 w-6" style={{ color: INK }} />}
                  title={fill(labels.nameForm.title)}
                  script={fill(labels.nameForm.script)}
                  subheader={fill(labels.nameForm.subheader)}
                />
                <Paragraphs lines={[fill(labels.nameForm.body)]} className={bodyClass} />

                <div className="mx-auto mt-6 max-w-md text-left">
                  <label htmlFor="preferred-name" className="mb-2 block">
                    <SmallCaps>
                      <T text={labels.nameForm.label} /> <span style={{ color: CHAMPAGNE }}>*</span>
                    </SmallCaps>
                  </label>
                  <input
                    id="preferred-name"
                    type="text"
                    required
                    placeholder={labels.nameForm.placeholder}
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    // 16px text on phones so iOS doesn't zoom in while typing
                    className="font-goudy-italic w-full select-text rounded-xl px-4 py-3 text-base transition-all focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-welcome-gold)_45%,transparent)]"
                    style={{
                      color: INK,
                      backgroundColor: IVORY,
                      border: `1px solid ${GOLD_BORDER}`,
                      boxShadow: "inset 0 1px 2px color-mix(in srgb, var(--color-welcome-navy) 6%, transparent)",
                    }}
                  />
                </div>
                {errorLine}

                <div className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
                  <button type="submit" disabled={submitting} className={primaryBtnClass} style={primaryBtnStyle}>
                    {submitting ? labels.saving : <T text={labels.nameForm.submit} />}
                  </button>
                  <button type="button" onClick={() => goTo("question")} className={secondaryBtnClass} style={secondaryBtnStyle}>
                    <T text={labels.nameForm.cancel} />
                  </button>
                </div>
              </ProposalCard>
            </motion.form>
          )}

          {flowState === "yes_submitted" && (
            <motion.div key="yes-success" className="relative z-10 w-full" {...cardMotion}>
              <ProposalCard>
                <FlowHeader
                  animated
                  icon={<Sparkles className="h-7 w-7" style={{ color: CHAMPAGNE }} />}
                  title={fill(copy.yes.title)}
                  script={fill(copy.yes.script)}
                  subheader={fill(copy.yes.subheader)}
                />

                <div
                  className="mx-auto mb-7 max-w-sm rounded-2xl border px-5 py-4"
                  style={{ borderColor: GOLD_BORDER_SOFT, backgroundColor: INNER_SURFACE }}
                >
                  {confirmedDisplayName && !isPlayful(copyKey) ? (
                    <>
                      <SmallCaps className="text-[0.58rem] sm:text-[0.62rem]">
                        <T text={labels.registeredName} />
                      </SmallCaps>
                      <p className={`${theSeasons.className} mt-1 text-lg tracking-wide [overflow-wrap:anywhere]`} style={{ color: INK }}>
                        <T text={confirmedDisplayName} />
                      </p>
                    </>
                  ) : null}
                  <SmallCaps className="mt-1.5" color={palette.bodySoft}>
                    <T text={fill(copy.yes.roleLine)} />
                  </SmallCaps>
                </div>

                <Paragraphs lines={copy.yes.body.map(fill)} className={bodyClass} />

                <div className="mt-9 space-y-6">
                  <SignOff line={fill(copy.yes.signOff)} />
                  <DividerLine className="mx-auto w-full max-w-md" />
                  <Link href="/" className={`${primaryBtnClass} mx-auto max-w-sm`} style={primaryBtnStyle}>
                    <T text={labels.returnButton} />
                  </Link>
                </div>
              </ProposalCard>
            </motion.div>
          )}

          {flowState === "no_clicked" && (
            <motion.div key="no-confirm" className="relative z-10 w-full" {...cardMotion}>
              <ProposalCard>
                <FlowHeader
                  icon={<X className="h-6 w-6" style={{ color: CHAMPAGNE }} />}
                  title={fill(copy.no.title)}
                  script={fill(copy.no.script)}
                  subheader={fill(copy.no.subheader)}
                />
                <Paragraphs lines={copy.no.body.map(fill)} className={bodyClass} />
                {errorLine}
                <div className="mt-9 space-y-6">
                  <DividerLine className="mx-auto w-full max-w-md" />
                  <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => void handleNoSubmit()}
                      disabled={submitting}
                      className={primaryBtnClass}
                      style={primaryBtnStyle}
                    >
                      {submitting ? labels.sending : <T text={labels.sendButton} />}
                    </button>
                    <button type="button" onClick={() => goTo("question")} className={secondaryBtnClass} style={secondaryBtnStyle}>
                      <T text={labels.goBack} />
                    </button>
                  </div>
                </div>
              </ProposalCard>
            </motion.div>
          )}

          {flowState === "no_submitted" && (
            <motion.div key="no-sent" className="relative z-10 w-full" {...cardMotion}>
              <ProposalCard>
                <FlowHeader
                  icon={<Heart className="h-6 w-6" style={{ color: CHAMPAGNE }} />}
                  title={fill(copy.sent.title)}
                  script={fill(copy.sent.script)}
                  subheader={fill(copy.sent.subheader)}
                />
                <Paragraphs lines={copy.sent.body.map(fill)} className={bodyClass} />
                <div className="mt-9 space-y-6">
                  <SignOff line={fill(copy.sent.signOff)} />
                  <DividerLine className="mx-auto w-full max-w-md" />
                  <Link href="/" className={`${secondaryBtnClass} mx-auto max-w-sm`} style={secondaryBtnStyle}>
                    <T text={labels.returnButton} />
                  </Link>
                </div>
              </ProposalCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export function ProposalPage(props: ProposalPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-6" style={{ background: sectionBackground, color: CREAM }}>
          <p className={`${cinzel.className} text-sm uppercase tracking-[0.2em]`}>Loading invitation…</p>
        </div>
      }
    >
      <ProposalPageInner {...props} />
    </Suspense>
  )
}
