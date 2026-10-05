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
import Image from "next/image"
import { motion, AnimatePresence } from "motion/react"
import {
  Heart,
  Check,
  X,
  Sparkles,
  MapPin,
} from "lucide-react"
import localFont from "next/font/local"
import { Cinzel, Playfair_Display } from "next/font/google"
import { ProposalMixedText, proposalMixedTextInter } from "@/lib/proposal-mixed-text"
import { useSiteConfig } from "@/hooks/use-site-config"
import { Hero as InvitationHero } from "@/components/loader/Hero"
import { LoadingScreen } from "@/components/loader/LoadingScreen"
import { InvitePhotoBackdrop } from "@/components/loader/invite-photo-backdrop"
import { parseWeddingDate } from "@/lib/wedding-date"
import { sectionType, welcomeTitleSize } from "@/lib/section-typography"
import { sectionBackground } from "@/lib/section-background"
import { siteConfig as defaultSiteConfig } from "@/content/site"
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

const ceremonyBearerBodyClass =
  `${playfair.className} mx-auto max-w-md space-y-3.5 text-pretty text-[0.9375rem] font-medium leading-[1.68] sm:space-y-4 sm:text-base sm:leading-relaxed`

const ceremonyBearerLabelClass =
  `${cinzel.className} not-italic text-[0.625rem] font-semibold uppercase tracking-[0.12em] leading-snug sm:text-xs sm:tracking-[0.16em]`

const ceremonyBearerPrimaryBtnClass =
  `${playfair.className} touch-manipulation cursor-pointer rounded-full border px-3 py-3.5 text-[0.8125rem] font-semibold normal-case leading-snug tracking-[0.02em] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 sm:px-7 sm:py-3.5 sm:text-sm sm:tracking-[0.03em] sm:hover:scale-[1.02]`

const ceremonyBearerSecondaryBtnClass =
  `${playfair.className} touch-manipulation cursor-pointer rounded-full border px-3 py-3 text-[0.75rem] font-semibold normal-case leading-snug tracking-[0.02em] transition-all duration-300 active:scale-[0.98] sm:px-7 sm:py-3.5 sm:text-[0.8125rem] sm:tracking-[0.03em] sm:hover:scale-[1.02]`

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
const GOLD_BRIGHT = "var(--color-welcome-gold)"
const INK = "var(--color-welcome-navy)"
const CREAM = "var(--color-welcome-text)"
const LABEL_GOLD = "var(--color-welcome-heading)"
const SCRIPT_GREEN = "var(--color-welcome-green)"
const GOLD_BORDER = "color-mix(in srgb, var(--color-welcome-gold) 38%, transparent)"
const GOLD_BORDER_SOFT = "color-mix(in srgb, var(--color-welcome-gold) 22%, transparent)"

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
  accent: GOLD_BRIGHT,
  script: SCRIPT_GREEN,
} as const

const BORDER_SOFT = GOLD_BORDER_SOFT
const INNER_SURFACE = "var(--color-welcome-bg-soft)"

const ambientGlowStyle = {
  background:
    "radial-gradient(ellipse 80% 65% at 50% 50%, color-mix(in srgb, var(--color-welcome-gold) 18%, transparent), transparent 68%)",
} as const

const dividerLineStyle = {
  background:
    "linear-gradient(to right, transparent, color-mix(in srgb, var(--color-welcome-gold) 65%, transparent), transparent)",
} as const

const coupleLabelLineStyle = {
  background:
    "linear-gradient(to right, transparent, color-mix(in srgb, var(--color-welcome-gold) 65%, transparent))",
} as const

const nameStyle: CSSProperties = {
  fontSize: "clamp(0.6875rem, 2.55vw, 1.0625rem)",
  lineHeight: 1.3,
}

const cardStyle: CSSProperties = {
  background: IVORY,
  borderColor: GOLD_BORDER,
  borderWidth: "1px",
  borderStyle: "solid",
  boxShadow:
    "0 10px 28px color-mix(in srgb, var(--color-welcome-gold) 12%, transparent), inset 0 1px 0 rgb(255 255 255 / 80%)",
}

const primaryBtnStyle: CSSProperties = {
  fontWeight: 600,
  background:
    "linear-gradient(180deg, var(--color-welcome-blush) 0%, var(--color-welcome-gold) 48%, color-mix(in srgb, var(--color-welcome-heading) 35%, var(--color-welcome-gold)) 100%)",
  borderColor: GOLD_BORDER,
  color: INK,
  boxShadow: "0 8px 22px color-mix(in srgb, var(--color-welcome-gold) 28%, transparent)",
}

const secondaryBtnStyle: CSSProperties = {
  fontWeight: 600,
  color: INK,
  backgroundColor: "color-mix(in srgb, var(--color-welcome-bg-soft) 85%, transparent)",
  borderColor: GOLD_BORDER_SOFT,
  boxShadow: "none",
}

const labelStyle = (color: string, extra?: CSSProperties): CSSProperties => ({
  fontFamily: cinzel.style.fontFamily,
  fontWeight: 600,
  color,
  ...extra,
})

function ProposalCornerDecorations() {
  const decos = useSiteConfig().proposal.decos
  return (
    <>
      <div className="pointer-events-none absolute left-0 top-0 z-[5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {decos.topLeft ? <img src={decos.topLeft} alt="" aria-hidden className={CORNER_DECO_CLASS} /> : null}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 z-[5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {decos.topRight ? <img src={decos.topRight} alt="" aria-hidden className={CORNER_DECO_CLASS} /> : null}
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 z-[5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {decos.bottomLeft ? <img src={decos.bottomLeft} alt="" aria-hidden className={CORNER_DECO_CLASS} /> : null}
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0 z-[5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {decos.bottomRight ? <img src={decos.bottomRight} alt="" aria-hidden className={CORNER_DECO_CLASS} /> : null}
      </div>
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

function CoupleLabel({ groom, bride }: { groom: string; bride: string }) {
  return (
    <div className="flex items-center justify-center gap-2.5 pt-1 sm:gap-3.5 sm:pt-1.5">
      <span className="h-px w-5 sm:w-7 md:w-9" style={coupleLabelLineStyle} aria-hidden />
      <p
        className={`${theSeasons.className} shrink-0 py-0.5 text-[clamp(0.95rem,3.6vw,1.25rem)] uppercase leading-snug tracking-[0.14em] sm:tracking-[0.18em]`}
        style={{ color: INK }}
      >
        {groom}
        <span
          className={`${aboveTheBeyond.className} mx-2 inline-block text-[clamp(1.15rem,4.2vw,1.5rem)] normal-case tracking-normal`}
          style={{ color: SCRIPT_GREEN, verticalAlign: "middle" }}
          aria-hidden
        >
          &
        </span>
        {bride}
      </p>
      <span
        className="h-px w-5 sm:w-7 md:w-9"
        style={{
          background:
            "linear-gradient(to left, transparent, color-mix(in srgb, var(--color-welcome-gold) 65%, transparent))",
        }}
        aria-hidden
      />
    </div>
  )
}

function LayeredProposalTitle({
  main,
  script,
  titleSize = welcomeTitleSize.main,
  scriptSize = welcomeTitleSize.script,
  scriptOverlap = welcomeTitleSize.overlap,
  scriptClassName = "",
}: {
  main: ReactNode
  script: string
  titleSize?: string
  scriptSize?: string
  scriptOverlap?: string
  scriptClassName?: string
}) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--welcome-size": titleSize,
          "--script-size": scriptSize,
          "--script-overlap": scriptOverlap,
        } as CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.92] tracking-[0.05em] min-[400px]:tracking-[0.08em] sm:leading-[0.94] sm:tracking-[0.12em] md:tracking-[0.14em]`}
        style={{
          fontSize: "var(--welcome-size)",
          ...goldGradientText,
        }}
      >
        {main}
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto block w-fit max-w-full px-1 leading-[1] ${scriptClassName}`}
        style={{
          marginTop: "var(--script-overlap)",
          fontSize: "var(--script-size)",
          color: SCRIPT_GREEN,
        }}
      >
        {script}
      </span>
      <span className="sr-only">{script}</span>
    </h2>
  )
}

function ProposalPersonalInvitationTitle() {
  return <LayeredProposalTitle main="A Special Invitation" script="just for you" />
}

function ProposalFlowHeader({
  icon,
  main,
  script,
  iconClassName = "",
  iconStyle,
  animated = false,
}: {
  icon: ReactNode
  main: ReactNode
  script: string
  iconClassName?: string
  iconStyle?: CSSProperties
  animated?: boolean
}) {
  const iconNode = (
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-full shadow-sm backdrop-blur-sm ${iconClassName}`}
      style={iconStyle}
    >
      {icon}
    </div>
  )

  return (
    <>
      <div className="mb-6 flex justify-center">
        {animated ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6 }}
          >
            {iconNode}
          </motion.div>
        ) : (
          iconNode
        )}
      </div>

      <div className="mb-4">
        <LayeredProposalTitle main={main} script={script} />
      </div>
    </>
  )
}

function ProposalFlowSubheader({ children }: { children: ReactNode }) {
  return (
    <p
      className={`${cinzel.className} ${sectionType.label} mx-auto mb-4 max-w-lg font-semibold uppercase tracking-[0.12em] sm:mb-5 sm:tracking-[0.16em] md:tracking-[0.18em]`}
      style={{ color: palette.label }}
    >
      {children}
    </p>
  )
}

function ProposalFlowBody({
  children,
  className = "",
  mixedText,
}: {
  children?: ReactNode
  className?: string
  /** Full paragraph — apostrophes/emoji render in ordinary font. */
  mixedText?: string
}) {
  return (
    <p
      className={`font-goudy-italic mx-auto max-w-lg ${sectionType.textRelaxed} ${className}`}
      style={{ color: palette.body }}
    >
      {mixedText != null ? <ProposalMixedText text={mixedText} /> : children}
    </p>
  )
}

function ProposalDateBlock({
  month,
  dayShort,
  dayNumber,
  time,
  year,
}: {
  month: string
  dayShort: string
  dayNumber: string
  time: string
  year: string
}) {
  const dateLineStyle = dividerLineStyle

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex flex-col items-center gap-1.5 sm:gap-2.5 md:gap-3">
        <span
          className={`${theSeasons.className} text-[clamp(1.15rem,4.5vw,1.85rem)] uppercase leading-none tracking-[0.12em] sm:tracking-[0.16em]`}
          style={{
            color: INK,
          }}
        >
          {month}
        </span>

        <div className="flex w-full items-center gap-2 sm:gap-4 md:gap-5">
          <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2.5">
            <span className="h-[0.5px] flex-1" style={dateLineStyle} aria-hidden />
            <span
              className={`${cinzel.className} text-[0.6rem] font-light uppercase tracking-[0.3em] sm:text-[0.7rem] sm:tracking-[0.4em] md:text-xs`}
              style={{ color: palette.heading }}
            >
              {dayShort}
            </span>
            <span
              className="h-[0.5px] w-6 sm:w-8 md:w-10"
              style={dateLineStyle}
              aria-hidden
            />
          </div>

          <div className="relative flex items-center justify-center px-3 sm:px-4 md:px-5">
            <span
              aria-hidden
              className="absolute inset-0 mx-auto h-[70%] max-h-[180px] w-[100px] rounded-full opacity-80 blur-[28px] sm:w-[140px] md:w-[170px]"
              style={{
                background: `radial-gradient(ellipse 80% 65% at 50% 50%, color-mix(in srgb, ${GOLD_BRIGHT} 42%, transparent), transparent 68%)`,
              }}
            />
            <span
              className={`${playfair.className} relative text-[clamp(3rem,16vw,6rem)] font-semibold italic leading-[0.92] tabular-nums tracking-[0.01em]`}
              style={goldGradientText}
            >
              {dayNumber}
            </span>
          </div>

          <div className="flex flex-1 items-center gap-1.5 sm:gap-2.5">
            <span
              className="h-[0.5px] w-6 sm:w-8 md:w-10"
              style={dateLineStyle}
              aria-hidden
            />
            <span
              className={`${cinzel.className} text-[0.6rem] font-light uppercase tracking-[0.3em] sm:text-[0.7rem] sm:tracking-[0.4em] md:text-xs`}
              style={{ color: palette.heading }}
            >
              {time.split(",")[0]}
            </span>
            <span className="h-[0.5px] flex-1" style={dateLineStyle} aria-hidden />
          </div>
        </div>

        <span
          className={`${cinzel.className} text-[clamp(0.85rem,3.2vw,1.15rem)] font-semibold uppercase tracking-[0.32em] sm:tracking-[0.38em]`}
          style={goldGradientText}
        >
          {year}
        </span>
      </div>
    </div>
  )
}

function ProposalRoleTitle({ roleSingular }: { roleSingular: string }) {
  return (
    <div className="mx-auto w-full max-w-xl space-y-3 text-center sm:space-y-4">
      {/* <p
        className={`${cinzel.className} ${sectionType.label} font-semibold uppercase tracking-[0.16em] sm:tracking-[0.2em] md:tracking-[0.24em]`}
        style={{ color: palette.label }}
      >
        Will You Stand With Us As Our
      </p> */}

      {/* <div className="flex items-center justify-center gap-3">
       <InlineDivider compact />
        <span
          className={`${aboveTheBeyond.className} shrink-0 text-[clamp(1rem,3vw,1.35rem)] leading-none`}
          style={{ color: palette.accent }}
          aria-hidden
        >
          &
        </span>
        <InlineDivider compact /> 
      </div> */}

      <h2
        className={`${theSeasons.className} capitalize leading-[0.94] tracking-[0.06em] sm:tracking-[0.1em] [overflow-wrap:anywhere]`}
        style={{
          fontSize: "clamp(2rem, 8.5vw, 3.75rem)",
          ...goldGradientText,
        }}
      >
        {roleSingular}?
      </h2>
    </div>
  )
}

function CoupleNameImage({
  groom,
  bride,
  className = "",
}: {
  groom: string
  bride: string
  className?: string
}) {
  return (
    <div
      className={`relative mx-auto aspect-[4/5] w-full max-w-[min(88vw,16rem)] sm:max-w-[14rem] md:max-w-xs ${className}`}
    >
      <Image
        src="/deco/coupleimage.webp"
        alt={`${groom} and ${bride}`}
        fill
        className="object-contain drop-shadow-[0_10px_28px_rgba(48,74,52,0.16)]"
        sizes="(max-width: 640px) 88vw, 320px"
        priority
      />
    </div>
  )
}

function DividerLine({ className = "w-16 sm:w-24 md:w-32" }: { className?: string }) {
  return <span className={`h-px ${className}`} style={dividerLineStyle} aria-hidden />
}

function ProposalPageHeader() {
  return (
    <header className="relative z-10 mb-4 w-full px-1 text-center sm:mb-8 sm:px-0 md:mb-10">
      <OrnamentalDivider />
      <p
        className={`${cinzel.className} mx-auto mt-3 max-w-md text-[0.5625rem] font-semibold uppercase tracking-[0.18em] sm:mt-5 sm:text-[0.6875rem] sm:tracking-[0.26em] md:text-xs`}
        style={{ color: palette.label }}
      >
        A Personal Invitation
      </p>
      <p
        className={`${aboveTheBeyond.className} mx-auto mt-1.5 block text-[clamp(0.95rem,4.5vw,1.45rem)] leading-none sm:mt-2`}
        style={{ color: SCRIPT_GREEN }}
      >
        from our hearts to yours
      </p>
      <div className="mx-auto mt-3 flex justify-center sm:mt-5">
        <DividerLine className="w-16 sm:w-28" />
      </div>
    </header>
  )
}

function ProposalCard({
  children,
  className = "",
  ceremonyBearer = false,
}: {
  children: ReactNode
  className?: string
  ceremonyBearer?: boolean
}) {
  return (
    <div className={`relative mx-auto w-full max-w-2xl ${className}`}>
      <div className="relative">
        <div
          className="pointer-events-none absolute -inset-2 rounded-[1.35rem] opacity-60 blur-2xl sm:-inset-3"
          style={ambientGlowStyle}
          aria-hidden
        />
        <div
          className="relative overflow-hidden rounded-2xl border sm:rounded-[1.35rem]"
          style={cardStyle}
        >
          <div
            className="pointer-events-none absolute inset-2 rounded-xl sm:inset-4 sm:rounded-[1.15rem]"
            style={{ border: `1px solid ${GOLD_BORDER_SOFT}` }}
            aria-hidden
          />
          <div className="wedding-frame-inner hidden min-[400px]:block" aria-hidden />

          <div
            className={
              ceremonyBearer
                ? "relative z-20 px-3 py-5 text-center sm:px-9 sm:py-11 md:px-12 md:py-14"
                : "relative z-20 px-4 py-6 text-center sm:px-9 sm:py-11 md:px-12 md:py-14"
            }
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function isPrincipalSponsorProposal(role: ProposalRole): boolean {
  return role.type === "sponsor-ninong" || role.type === "sponsor-ninang"
}

const CEREMONY_BEARER_ROLE_IDS = new Set([
  "ring-bearer",
  "coin-bearer",
  "bible-bearer",
  "herald-bearer",
])

function isCeremonyBearerProposal(role: ProposalRole): boolean {
  return CEREMONY_BEARER_ROLE_IDS.has(role.id)
}

function isFlowerGirlProposal(role: ProposalRole): boolean {
  return role.id === "flower-girl"
}

function ProposalPersonalLetter({
  inviteeName,
  roleTitle,
  principalSponsor = false,
  ceremonyBearer = false,
  flowerGirl = false,
}: {
  inviteeName: string
  roleTitle: string
  principalSponsor?: boolean
  ceremonyBearer?: boolean
  flowerGirl?: boolean
}) {
  const playfulInvite = ceremonyBearer || flowerGirl
  const siteConfig = useSiteConfig()
  const groom = siteConfig.couple.groomNickname || siteConfig.couple.groom
  const bride = siteConfig.couple.brideNickname || siteConfig.couple.bride
  const ceremonyDate =
    siteConfig.ceremony.date ?? siteConfig.wedding.date ?? defaultSiteConfig.ceremony.date
  const ceremonyDay = siteConfig.ceremony.day ?? defaultSiteConfig.ceremony.day
  const ceremonyTime =
    siteConfig.ceremony.time ?? siteConfig.wedding.time ?? defaultSiteConfig.ceremony.time
  const venueName = siteConfig.ceremony.location ?? defaultSiteConfig.ceremony.location
  const venueDetail = siteConfig.ceremony.venue ?? defaultSiteConfig.ceremony.venue
  const greetingName = inviteeName.trim() || "Friend"

  return (
    <div
      className={
        playfulInvite
          ? "mx-auto w-full max-w-lg space-y-4 text-center sm:space-y-7"
          : "mx-auto w-full max-w-lg space-y-5 text-center sm:space-y-7"
      }
      style={{ color: palette.body, WebkitFontSmoothing: "antialiased" }}
    >
      <div className="space-y-2">
        <p
          className={
            playfulInvite
              ? `${playfair.className} text-[clamp(1.35rem,6vw,1.85rem)] font-semibold leading-tight tracking-[0.02em] [overflow-wrap:anywhere]`
              : `${theSeasons.className} text-[clamp(1.2rem,5.5vw,1.85rem)] leading-tight tracking-[0.05em] [overflow-wrap:anywhere]`
          }
          style={{ color: INK }}
        >
          {playfulInvite ? "Hi" : "Dear"}{" "}
          <ProposalMixedText
            text={greetingName}
            className="[overflow-wrap:anywhere]"
            specialClassName={`${inter.className} inline-block align-baseline text-[1em] font-semibold not-italic leading-none tracking-normal`}
          />
          ,
        </p>
        <OrnamentalDivider compact />
      </div>

      <div
        className={
          playfulInvite
            ? ceremonyBearerBodyClass
            : `font-goudy-italic mx-auto max-w-md space-y-3 text-pretty text-[0.9375rem] leading-relaxed sm:space-y-3.5 sm:text-base ${sectionType.textRelaxed}`
        }
      >
        {playfulInvite ? (
          <>
            <p>
              <ProposalMixedText text="We have a very special day coming up, and we would love for you to be part of it! 🤍" />
            </p>
            <div className="flex flex-col items-center gap-0">
              <p
                className={`${theSeasons.className} not-italic text-[clamp(0.95rem,4.2vw,1.35rem)] leading-snug tracking-[0.06em] uppercase sm:tracking-[0.08em]`}
                style={{ color: INK }}
              >
                {groom}
                <span
                  className={`${aboveTheBeyond.className} mx-1.5 inline-block text-[1.1em] normal-case tracking-normal sm:mx-2`}
                  style={{ color: SCRIPT_GREEN }}
                  aria-hidden
                >
                  &
                </span>
                {bride}
              </p>
              <p
                className={`${playfair.className} mt-3 text-[clamp(0.875rem,3.8vw,1.05rem)] font-medium normal-case leading-snug tracking-[0.02em] sm:mt-4 sm:text-base`}
                style={{ color: INK }}
              >
                are getting married!
              </p>
            </div>
          </>
        ) : (
          <>
            <p>We have some wonderful news that we would love to share with you.</p>
            <p>
              We are happy and excited to announce that we are getting married and will be beginning
              a new chapter of our lives together.
            </p>
          </>
        )}
      </div>

      <div
        className={
          playfulInvite
            ? "relative mx-auto max-w-md overflow-hidden rounded-xl border px-3 py-4 sm:px-7 sm:py-7"
            : "relative mx-auto max-w-md overflow-hidden rounded-xl border px-4 py-5 sm:px-7 sm:py-7"
        }
        style={{ background: INNER_SURFACE, borderColor: BORDER_SOFT }}
      >
        <div
          className="pointer-events-none absolute inset-2 rounded-lg"
          style={{ border: `1px solid ${GOLD_BORDER_SOFT}` }}
          aria-hidden
        />
        <p
          className={`${cinzel.className} relative text-[0.62rem] font-semibold uppercase tracking-[0.32em] sm:text-[0.68rem]`}
          style={{ color: palette.label }}
        >
          Save the Date
        </p>
        {!playfulInvite ? (
          <p
            className={`${theSeasons.className} relative mt-3 text-[clamp(1.2rem,4.2vw,1.55rem)] tracking-[0.1em] uppercase`}
            style={{ color: INK }}
          >
            {groom}
            <span
              className={`${aboveTheBeyond.className} mx-2 inline-block text-[1.2em] normal-case tracking-normal`}
              style={{ color: SCRIPT_GREEN }}
              aria-hidden
            >
              &
            </span>
            {bride}
          </p>
        ) : null}
        <div
          className={`${cinzel.className} relative mt-3 space-y-1 text-[0.625rem] font-medium tracking-[0.08em] sm:space-y-0 sm:text-xs sm:tracking-[0.14em]`}
          style={{ color: palette.bodySoft }}
        >
          {playfulInvite ? (
            <>
              <p className="hidden sm:block">
                {ceremonyDate} | {ceremonyDay} | {ceremonyTime}
              </p>
              <div className="flex flex-col gap-1 sm:hidden">
                <p className="text-[0.6875rem] tracking-[0.06em]">{ceremonyDate}</p>
                <p className="text-[0.6875rem] tracking-[0.06em]">
                  {ceremonyDay}
                  <span className="mx-1.5 opacity-50" aria-hidden>
                    ·
                  </span>
                  {ceremonyTime}
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="sm:inline">
                {ceremonyDate}
                <span className="mx-1.5 hidden opacity-40 sm:inline" aria-hidden>
                  ·
                </span>
              </p>
              <p className="sm:inline">
                {ceremonyDay}
                <span className="mx-1.5 hidden opacity-40 sm:inline" aria-hidden>
                  ·
                </span>
                {ceremonyTime}
              </p>
            </>
          )}
        </div>
        <p
          className={
            playfulInvite
              ? `${playfair.className} relative mx-auto mt-3 flex max-w-sm items-start justify-center gap-1.5 px-0.5 text-center text-[0.8125rem] font-medium leading-snug sm:text-sm`
              : `font-goudy-italic relative mx-auto mt-3 flex max-w-sm items-start justify-center gap-1.5 text-center text-[0.8125rem] leading-relaxed sm:text-sm`
          }
        >
          <MapPin
            className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:mt-1"
            style={{ color: palette.label }}
            aria-hidden
          />
          <span className="text-left sm:text-center">
            {principalSponsor || playfulInvite
              ? "San Bartolome Parish, Magalang, Pampanga"
              : `${venueName}${venueDetail ? `, ${venueDetail}` : ""}`}
          </span>
        </p>
      </div>

      <div
        className={
          playfulInvite
            ? ceremonyBearerBodyClass
            : `font-goudy-italic mx-auto max-w-md space-y-3 text-pretty text-[0.9375rem] leading-relaxed sm:space-y-3.5 sm:text-base ${sectionType.textRelaxed}`
        }
      >
        {flowerGirl ? (
          <>
            <p>
              Our wedding day wouldn&apos;t be complete without some extra sweetness, smiles, and a
              little bit of magic.
            </p>
            <p className={ceremonyBearerLabelClass} style={{ color: palette.label }}>
              And we have a very special role we would love for you to have.
            </p>
          </>
        ) : ceremonyBearer ? (
          <>
            <p>
              Our wedding day is a very important moment for us, and we would love to have you take
              part in making it even more special.
            </p>
            <p className={ceremonyBearerLabelClass} style={{ color: palette.label }}>
              So we have a very important question for you:
            </p>
          </>
        ) : principalSponsor ? (
          <>
            <p>This is not a general invitation. This is a personal ask, especially meant for you.</p>
            <div className="py-1">
              <OrnamentalDivider compact />
            </div>
            <p>
              As we prepare for our wedding, we find ourselves thinking about the people we would be
              grateful to have by our side on one of the most meaningful days of our lives.
            </p>
            <p>
              For us, having a {roleTitle} is more than simply being part of the wedding ceremony.
              It means having someone we respect, someone whose experiences we can learn from, and
              someone whose wisdom and blessings we would be grateful to have as we build our life
              together.
            </p>
            <p
              className={`${cinzel.className} not-italic text-[0.65rem] font-semibold uppercase tracking-[0.14em] sm:text-xs sm:tracking-[0.18em]`}
              style={{ color: palette.label }}
            >
              With great respect and sincerity, we would like to ask you a very special question:
            </p>
          </>
        ) : (
          <>
            <p>
              <span className="not-italic" style={{ color: INK }}>
                But this isn&apos;t just a save-the-date.
              </span>{" "}
              This is a personal ask, especially meant for you.
            </p>
            <p>
              As we imagine our wedding day, we find ourselves thinking about the people we would
              want beside us as we celebrate one of the biggest moments of our lives.
            </p>
            <p>
              You are someone we would genuinely love to have there — not just as a guest, but as
              someone who will stand beside us, celebrate with us, laugh with us, and share in the
              memories we will carry for years to come.
            </p>
          </>
        )}
      </div>

      {!principalSponsor && !playfulInvite && inviteeName.trim() ? (
        <div
          className="mx-auto grid max-w-md grid-cols-1 gap-px overflow-hidden rounded-xl border sm:grid-cols-2"
          style={{ borderColor: BORDER_SOFT, background: GOLD_BORDER_SOFT }}
        >
          <div className="px-3.5 py-3.5 sm:px-4 sm:py-5" style={{ background: IVORY }}>
            <p
              className={`${cinzel.className} text-[0.55rem] font-semibold uppercase tracking-[0.2em] sm:text-[0.6rem]`}
              style={{ color: palette.label }}
            >
              Role offered
            </p>
            <p
              className={`${theSeasons.className} mt-1.5 text-[0.9375rem] tracking-wide [overflow-wrap:anywhere] sm:mt-2 sm:text-lg`}
              style={{ color: INK }}
            >
              {roleTitle}
            </p>
          </div>
          <div
            className="border-t px-3.5 py-3.5 sm:border-t-0 sm:border-l sm:px-4 sm:py-5"
            style={{ background: IVORY, borderColor: BORDER_SOFT }}
          >
            <p
              className={`${cinzel.className} text-[0.55rem] font-semibold uppercase tracking-[0.2em] sm:text-[0.6rem]`}
              style={{ color: palette.label }}
            >
              Prepared for
            </p>
            <p
              className={`${theSeasons.className} mt-1.5 text-[0.9375rem] tracking-wide [overflow-wrap:anywhere] sm:mt-2 sm:text-lg`}
              style={{ color: SCRIPT_GREEN }}
            >
              {inviteeName.trim()}
            </p>
          </div>
        </div>
      ) : null}

      {!principalSponsor && !playfulInvite ? (
        <p
          className={`${cinzel.className} text-[0.65rem] font-semibold uppercase tracking-[0.16em] sm:text-xs sm:tracking-[0.2em]`}
          style={{ color: palette.label }}
        >
          So, with all our hearts, we would like to ask you
        </p>
      ) : null}
    </div>
  )
}

const primaryBtnClass =
  `${cinzel.className} touch-manipulation cursor-pointer rounded-full border px-4 py-3.5 text-[0.58rem] font-semibold uppercase leading-snug tracking-[0.12em] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 sm:px-7 sm:py-3.5 sm:text-xs sm:tracking-[0.22em] sm:hover:scale-[1.02] md:px-8 md:py-4 md:tracking-[0.26em]`

const secondaryBtnClass =
  `${cinzel.className} touch-manipulation cursor-pointer rounded-full border px-4 py-3 text-[0.55rem] font-semibold uppercase leading-snug tracking-[0.1em] transition-all duration-300 active:scale-[0.98] sm:px-7 sm:py-3.5 sm:text-[0.65rem] sm:tracking-[0.18em] sm:hover:scale-[1.02] md:px-8 md:py-4 md:tracking-[0.22em]`

function ProposalAskSection({
  roleTitle,
  submitting,
  onYes,
  onNo,
  principalSponsor = false,
  ceremonyBearer = false,
  flowerGirl = false,
}: {
  roleTitle: string
  submitting?: boolean
  onYes: () => void
  onNo: () => void
  principalSponsor?: boolean
  ceremonyBearer?: boolean
  flowerGirl?: boolean
}) {
  const playfulInvite = ceremonyBearer || flowerGirl
  return (
    <div
      className={
        playfulInvite
          ? "relative mx-auto mt-2 w-full max-w-lg rounded-xl border px-2.5 py-4 sm:mt-4 sm:rounded-2xl sm:px-7 sm:py-9"
          : "relative mx-auto mt-1 w-full max-w-lg rounded-xl border px-3 py-5 sm:mt-4 sm:rounded-2xl sm:px-7 sm:py-9"
      }
      style={{ borderColor: BORDER_SOFT, background: "color-mix(in srgb, var(--color-welcome-bg-soft) 55%, transparent)" }}
    >
      <div className={playfulInvite ? "mb-4 flex justify-center sm:mb-6" : "mb-6 flex justify-center"}>
        <DividerLine className="w-full max-w-[12rem]" />
      </div>

      <div
        className={
          playfulInvite
            ? "relative mx-auto mb-3 h-[7.25rem] w-[4.75rem] sm:mb-7 sm:h-[13.5rem] sm:w-[8.5rem]"
            : "relative mx-auto mb-4 h-[9.5rem] w-[6rem] sm:mb-7 sm:h-[13.5rem] sm:w-[8.5rem]"
        }
      >
        <div
          className="absolute -inset-2 rounded-full opacity-70 blur-xl"
          style={ambientGlowStyle}
          aria-hidden
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: `1px solid ${GOLD_BORDER_SOFT}` }}
          aria-hidden
        />
        <Image
          src="/deco/coupleimage.webp"
          alt="The couple"
          fill
          className="object-contain object-bottom drop-shadow-[0_14px_32px_color-mix(in_srgb,var(--color-welcome-navy)_10%,transparent)]"
          sizes="136px"
          priority
        />
      </div>

      <h2
        className={
          playfulInvite
            ? `${playfair.className} mx-auto max-w-md text-[clamp(1.05rem,4.8vw,1.75rem)] font-semibold leading-snug tracking-[0.01em] sm:tracking-[0.02em]`
            : `${theSeasons.className} mx-auto max-w-md text-[clamp(1.1rem,5.2vw,1.75rem)] leading-snug tracking-[0.03em] sm:tracking-[0.04em]`
        }
        style={{ color: INK }}
      >
        Will you be our{" "}
        <span
          className={
            playfulInvite
              ? `mt-1 block pt-0.5 capitalize [overflow-wrap:anywhere] sm:mt-0 sm:inline sm:pt-0 ${theSeasons.className} tracking-[0.04em]`
              : "block pt-0.5 capitalize [overflow-wrap:anywhere] sm:pt-1"
          }
          style={goldGradientText}
        >
          {roleTitle}?
        </span>
      </h2>

      <p
        className={
          playfulInvite
            ? `${playfair.className} mx-auto mt-2.5 max-w-md text-[0.875rem] font-medium leading-[1.65] sm:mt-4 sm:text-base sm:leading-relaxed`
            : `font-goudy-italic mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed sm:mt-4 sm:text-base ${sectionType.textRelaxed}`
        }
        style={{ color: palette.body }}
      >
        {flowerGirl
          ? "We would love to have you walk down the aisle and help make our wedding day even more beautiful and memorable."
          : ceremonyBearer
            ? "We would be so happy to have you walk down the aisle and carry this special part of our wedding ceremony."
            : principalSponsor
              ? "Having you share this moment with us would truly make our wedding more meaningful."
              : "We know that being part of the wedding party comes with time, effort, and a little bit of responsibility. More than anything, we hope it will be a chance for us to celebrate this beautiful moment together."}
      </p>

      <div className="mx-auto mt-5 flex w-full max-w-sm flex-col gap-2.5 sm:mt-9 sm:gap-2.5">
        <button
          type="button"
          disabled={submitting}
          onClick={onYes}
          className={`${playfulInvite ? ceremonyBearerPrimaryBtnClass : primaryBtnClass} min-h-12 w-full`}
          style={primaryBtnStyle}
        >
          {submitting ? (
            "Saving..."
          ) : flowerGirl ? (
            <ProposalMixedText text="Yes, I'd Love To! 🌸" />
          ) : ceremonyBearer ? (
            <ProposalMixedText text="Yes, I'd Love To! 🤍" />
          ) : principalSponsor ? (
            <ProposalMixedText text="Yes, I'd Be Honored 🤍" />
          ) : (
            "Yes, I'd Love To!"
          )}
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={onNo}
          className={`${playfulInvite ? ceremonyBearerSecondaryBtnClass : secondaryBtnClass} min-h-11 w-full`}
          style={secondaryBtnStyle}
        >
          {playfulInvite ? (
            <ProposalMixedText text="Maybe Next Time 🤍" />
          ) : principalSponsor ? (
            "No, With Love & Warm Wishes"
          ) : (
            <>
              <span className="sm:hidden">No, With Love</span>
              <span className="hidden sm:inline">No, With Love & Warm Wishes</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

type ProposalFlowState =
  | "question"
  | "yes_details"
  | "yes_submitted"
  | "no_clicked"
  | "no_submitted"

interface ProposalPageProps {
  role: ProposalRole
}

function ProposalPageInner({ role }: ProposalPageProps) {
  const searchParams = useSearchParams()
  const inviteeFromLink = useMemo(
    () => parseInviteeNameFromSearchParams(searchParams),
    [searchParams],
  )

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
  const groomSign = siteConfig.couple.groomNickname || siteConfig.couple.groom
  const brideSign = siteConfig.couple.brideNickname || siteConfig.couple.bride
  const confirmedDisplayName = (inviteeFromLink || preferredName).trim()
  const principalSponsor = isPrincipalSponsorProposal(role)
  const ceremonyBearer = isCeremonyBearerProposal(role)
  const flowerGirl = isFlowerGirlProposal(role)
  const playfulInvite = ceremonyBearer || flowerGirl

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
      setValidationError(
        "Please type your preferred name so we can add it to our invitation."
      )
      return
    }
    setValidationError("")
    setSubmitting(true)

    try {
      await submitResponse("Confirmed", preferredName.trim())
      setFlowState("yes_submitted")
    } catch (err) {
      console.error("Failed to submit confirmation:", err)
      setValidationError("We couldn't save your name. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleNoSubmit = async () => {
    setSubmitting(true)
    try {
      const declineLabel = confirmedDisplayName
        ? `${confirmedDisplayName} (declined)`
        : "Declined Entourage Offer"
      await submitResponse("Declined", declineLabel)
      setFlowState("no_submitted")
    } catch (err) {
      console.error("Failed to submit decline:", err)
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
      setValidationError("We couldn't save your response. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative min-h-[100dvh] select-none px-3.5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-16 md:py-20 ${pageScrollLocked ? "overflow-hidden" : "overflow-x-hidden"}`}
      style={{ background: sectionBackground, color: CREAM }}
    >
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.22]" aria-hidden>
        <Suspense fallback={<div className="h-full w-full" style={{ background: sectionBackground }} />}>
          <Silk speed={6} scale={1} color="#9EAF91" noiseIntensity={0} rotation={0.25} />
        </Suspense>
      </div>

      {loadingOverlayVisible && (
        <div
          className="invite-photo-backdrop-wrap invite-photo-backdrop-wrap--loading"
          aria-hidden="true"
        >
          <InvitePhotoBackdrop />
        </div>
      )}

      {loadingOverlayVisible && (
        <LoadingScreen
          onFadeStart={handleLoadingFadeStart}
          onComplete={handleLoadingComplete}
        />
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
        animate={
          proposalVisible
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: 40, filter: "blur(8px)" }
        }
        transition={
          cinematicEntry
            ? { duration: 1.08, ease: proposalEntryEase, delay: 0.86 }
            : { duration: 0.01 }
        }
        className={`relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center justify-start pt-8 sm:justify-center sm:pt-0 min-h-0 sm:min-h-[calc(100dvh-8rem)] pb-4 ${playfulInvite ? "px-0.5 sm:px-0" : "px-1 sm:px-0"} ${proposalVisible ? "" : "pointer-events-none"}`}
        style={{ color: palette.body }}
      >
        {proposalVisible && <ProposalCornerDecorations />}

        {proposalVisible && flowState === "question" && !playfulInvite && (
          <ProposalPageHeader />
        )}

        <AnimatePresence mode="wait">
          {flowState === "question" && (
            <motion.div
              key="question-box"
              className="relative z-10 w-full"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <ProposalCard ceremonyBearer={playfulInvite}>
              <div className="relative z-10 w-full space-y-1 sm:space-y-2">
                <ProposalPersonalLetter
                  inviteeName={inviteeFromLink || preferredName}
                  roleTitle={role.title}
                  principalSponsor={principalSponsor}
                  ceremonyBearer={ceremonyBearer}
                  flowerGirl={flowerGirl}
                />

                {validationError && flowState === "question" && (
                  <p className="text-center text-xs font-medium text-[var(--color-motif-deep)]">{validationError}</p>
                )}

                <ProposalAskSection
                  roleTitle={role.title}
                  submitting={submitting}
                  principalSponsor={principalSponsor}
                  ceremonyBearer={ceremonyBearer}
                  flowerGirl={flowerGirl}
                  onYes={() => void handleYesClick()}
                  onNo={() => setFlowState("no_clicked")}
                />

                {!principalSponsor && !playfulInvite ? (
                  <div className="pt-4 sm:pt-6">
                    <OrnamentalDivider compact />
                    <p
                      className={`${cinzel.className} mt-4 text-[0.58rem] font-medium uppercase tracking-[0.2em] sm:text-[0.625rem]`}
                      style={{ color: palette.bodySoft }}
                    >
                      With love,
                      <br />
                      <span
                        className={`${theSeasons.className} mt-1 inline-block text-sm normal-case tracking-[0.08em]`}
                        style={{ color: INK }}
                      >
                        {groomSign} & {brideSign}
                      </span>
                    </p>
                  </div>
                ) : null}
              </div>
              </ProposalCard>
            </motion.div>
          )}

          {flowState === "yes_details" && (
            <motion.form
              key="yes-form"
              onSubmit={handleYesSubmit}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <ProposalCard ceremonyBearer={playfulInvite}>
              <div className="relative z-10 w-full space-y-4 py-1 sm:space-y-6 sm:py-3">
                <ProposalFlowHeader
                  icon={<Check className="h-6 w-6" style={{ color: INK }} />}
                  iconClassName=""
                  iconStyle={{
                    border: `1px solid ${GOLD_BORDER}`,
                    background:
                      "linear-gradient(180deg, var(--color-welcome-blush) 0%, var(--color-welcome-gold) 100%)",
                    color: INK,
                  }}
                  main="You Said Yes"
                  script="we're so happy"
                />

                <ProposalFlowSubheader>One quick detail</ProposalFlowSubheader>

                <ProposalFlowBody className="mb-2 max-w-md text-center sm:mb-3">
                  We couldn&apos;t be happier to have you by our side! Please confirm the name
                  you&apos;d like on our invitation and guest lists.
                </ProposalFlowBody>

                <p
                  className={`font-goudy-italic mx-auto mb-1 max-w-md text-center ${sectionType.textSnug}`}
                  style={{ color: INK }}
                >
                  Please enter the exact name you would like displayed on our wedding invitation
                  and guest lists:
                </p>

                <div className="mx-auto max-w-md text-left">
                  <label className={`${cinzel.className} mb-2 block text-[10px] font-semibold tracking-[0.16em] uppercase sm:text-[12px]`} style={labelStyle(palette.label)}>
                    Your Preferred Name <span style={{ color: palette.accent }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aunt Maria Clara / Mr. James Bond"
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    className="font-goudy-italic w-full rounded-xl px-4 py-2.5 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-welcome-gold)_45%,transparent)] sm:py-3 sm:text-sm"
                    style={{
                      color: INK,
                      backgroundColor: INNER_SURFACE,
                      border: `1px solid ${BORDER_SOFT}`,
                      boxShadow:
                        "inset 0 1px 2px color-mix(in srgb, var(--color-welcome-navy) 6%, transparent)",
                    }}
                  />
                  {validationError && (
                    <p className="mt-2 flex items-center gap-1 text-xs font-medium text-[var(--color-motif-accent)]">
                      <span>⚠️</span> {validationError}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center pt-4">
                  <DividerLine className="w-full max-w-md" />
                </div>
                <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`${primaryBtnClass} flex-1`}
                    style={primaryBtnStyle}
                  >
                    {submitting ? "Saving..." : "Submit Response"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlowState("question")}
                    className={secondaryBtnClass}
                    style={secondaryBtnStyle}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              </ProposalCard>
            </motion.form>
          )}

          {flowState === "yes_submitted" && (
            <motion.div
              key="yes-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ProposalCard ceremonyBearer={playfulInvite}>
              <div className="relative z-10 space-y-4">
                <ProposalFlowHeader
                  animated
                  icon={<Sparkles className="h-8 w-8" style={{ color: CHAMPAGNE }} />}
                  iconClassName=""
                  iconStyle={{
                    color: CHAMPAGNE,
                    border: `1px solid ${BORDER_SOFT}`,
                    backgroundColor: INNER_SURFACE,
                    boxShadow:
                      "0 8px 24px color-mix(in srgb, var(--color-welcome-gold) 22%, transparent)",
                  }}
                  main={
                    playfulInvite ? (
                      <ProposalMixedText text="Yay!" />
                    ) : (
                      "You Said Yes"
                    )
                  }
                  script={playfulInvite ? "you said yes!" : "thank you"}
                />

                <ProposalFlowSubheader>
                  {flowerGirl ? (
                    <ProposalMixedText text="We are so happy to have you as our Flower Girl!" />
                  ) : ceremonyBearer ? (
                    <ProposalMixedText text="We are so excited to have you on our team!" />
                  ) : principalSponsor ? (
                    <ProposalMixedText text="Thank you for saying yes!" />
                  ) : (
                    "We couldn&apos;t be happier"
                  )}
                </ProposalFlowSubheader>

                {!playfulInvite ? (
                  <div
                    className="mx-auto mb-2 max-w-sm rounded-2xl px-6 py-4 shadow-sm backdrop-blur-sm sm:mb-4"
                    style={{ border: `1px solid ${BORDER_SOFT}`, backgroundColor: INNER_SURFACE }}
                  >
                    <span
                      className={`${cinzel.className} mb-1 block text-[10px] font-semibold tracking-[0.16em] uppercase sm:text-[12px]`}
                      style={labelStyle(palette.label)}
                    >
                      Registered name
                    </span>
                    <p
                      className={`${theSeasons.className} ${sectionType.text} font-medium`}
                      style={{ ...nameStyle, color: palette.heading }}
                    >
                      {confirmedDisplayName || preferredName}
                    </p>
                    <span
                      className={`${cinzel.className} mt-2 block text-[10px] font-semibold tracking-[0.14em] uppercase sm:text-[11px]`}
                      style={{ color: palette.bodySoft }}
                    >
                      {principalSponsor
                        ? `Our ${role.title}`
                        : `Standing as our ${role.title}`}
                    </span>
                  </div>
                ) : (
                  <p
                    className={`${theSeasons.className} mx-auto mb-2 max-w-md text-[clamp(1rem,4vw,1.25rem)] sm:mb-4`}
                    style={{ color: INK }}
                  >
                    Our {role.title}
                  </p>
                )}

                <ProposalFlowBody
                  className={
                    playfulInvite
                      ? `mb-8 max-w-md text-center sm:mb-10 ${playfair.className} text-[0.9375rem] font-medium not-italic leading-[1.68] sm:text-base`
                      : "mb-8 max-w-md text-center sm:mb-10"
                  }
                  mixedText={
                    flowerGirl
                      ? "We can't wait to see you walk down the aisle and be part of our special day. We hope you have lots of fun, smile big, and enjoy every moment! We can't wait to see you on our big day! 🤍"
                      : ceremonyBearer
                        ? `We are so excited to have you as our ${role.title}! We can't wait to see you walk down the aisle and be part of our special day. Your little role will be a very special part of our wedding, and we hope you have lots of fun celebrating with us! See you on our big day! 🤍`
                        : undefined
                  }
                >
                  {flowerGirl || ceremonyBearer ? null : principalSponsor ? (
                    <>
                      We are truly happy and honored to have you accept this special role in our
                      wedding. Your support means a lot to us, and we look forward to celebrating
                      this beautiful day with you and creating a memory we can cherish for years to
                      come. Thank you for being part of this special moment.
                    </>
                  ) : (
                    <>
                      Thank you for being willing to share this special moment with us. We
                      can&apos;t wait to celebrate, laugh, make memories, and experience this
                      beautiful day together. Having you beside us will make our wedding day even
                      more special. Let&apos;s make some unforgettable memories together!
                    </>
                  )}
                </ProposalFlowBody>

                <p
                  className={`${cinzel.className} text-center text-[0.58rem] font-medium uppercase tracking-[0.16em]`}
                  style={{ color: palette.bodySoft }}
                >
                  {principalSponsor ? (
                    <>
                      With love and heartfelt gratitude,
                      <br />
                      {groomSign} & {brideSign}
                    </>
                  ) : (
                    <>
                      With love,
                      <br />
                      {groomSign} & {brideSign}
                    </>
                  )}
                </p>

                <div className="flex items-center justify-center pb-2 sm:pb-3">
                  <DividerLine className="w-full max-w-md" />
                </div>

                <Link
                  href="/"
                  className={`${primaryBtnClass} mx-auto inline-block w-full max-w-sm`}
                  style={primaryBtnStyle}
                >
                  Return to Wedding Page
                </Link>
              </div>
              </ProposalCard>
            </motion.div>
          )}

          {flowState === "no_clicked" && (
            <motion.div
              key="no-confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ProposalCard ceremonyBearer={playfulInvite}>
              <div className="relative z-10 space-y-4">
                <ProposalFlowHeader
                  icon={<X className="h-6 w-6" style={{ color: CHAMPAGNE }} />}
                  iconClassName=""
                  iconStyle={{
                    border: `1px solid ${BORDER_SOFT}`,
                    backgroundColor: INNER_SURFACE,
                    color: CHAMPAGNE,
                  }}
                  main={
                    playfulInvite ? (
                      <ProposalMixedText text="That's Okay!" />
                    ) : (
                      "Thank You"
                    )
                  }
                  script={playfulInvite ? "we understand" : "for responding"}
                />

                <ProposalFlowSubheader>
                  {playfulInvite ? (
                    <ProposalMixedText text="We completely understand 😊" />
                  ) : principalSponsor ? (
                    "We completely understand and respect your decision"
                  ) : (
                    "We completely understand"
                  )}
                </ProposalFlowSubheader>

                <ProposalFlowBody
                  className={
                    playfulInvite
                      ? `mb-8 max-w-lg text-center sm:mb-10 ${playfair.className} text-[0.9375rem] font-medium not-italic leading-[1.68] sm:text-base`
                      : "mb-8 max-w-lg text-center sm:mb-10"
                  }
                  mixedText={
                    flowerGirl
                      ? "Thank you for taking the time to consider being our Flower Girl. Whether you're able to be part of our wedding or not, we hope you know how special you are to us. We'll still be very happy to celebrate our special day with you!"
                      : ceremonyBearer
                        ? `Thank you for considering being our ${role.title}. We hope you know that you are special to us, and we'll be happy to have you celebrate our wedding with us in any way.`
                        : undefined
                  }
                >
                  {flowerGirl || ceremonyBearer ? null : principalSponsor ? (
                    <>
                      Thank you for taking the time to read our letter and consider our request. We
                      sincerely appreciate your kindness and the thought you have given to our
                      invitation. There are no hard feelings at all. We are simply grateful to have
                      shared this moment with you and to have you celebrate our happiness in your
                      own way.
                    </>
                  ) : (
                    <>
                      Thank you for taking the time to consider being part of our wedding party.
                      Please know that there are absolutely no hard feelings. Whether you&apos;re
                      standing beside us or cheering for us from wherever you are, we will always
                      be grateful to have you in our lives.
                    </>
                  )}
                </ProposalFlowBody>

                <div className="flex items-center justify-center pt-4">
                  <DividerLine className="w-full max-w-md" />
                </div>
                <div className="mx-auto flex max-w-xs flex-col gap-3 sm:max-w-md sm:flex-row">
                  <button
                    onClick={handleNoSubmit}
                    disabled={submitting}
                    className={`${cinzel.className} flex-1 cursor-pointer rounded-full border px-8 py-4 text-[11px] font-semibold tracking-[0.18em] uppercase shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50`}
                    style={primaryBtnStyle}
                  >
                    {submitting ? "Sending..." : "Send Response"}
                  </button>
                  <button
                    onClick={() => setFlowState("question")}
                    className={secondaryBtnClass}
                    style={secondaryBtnStyle}
                  >
                    Go Back
                  </button>
                </div>
              </div>
              </ProposalCard>
            </motion.div>
          )}

          {flowState === "no_submitted" && (
            <motion.div
              key="no-submitted-box"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <ProposalCard ceremonyBearer={playfulInvite}>
              <div className="relative z-10 space-y-4">
                <ProposalFlowHeader
                  icon={<Heart className="h-6 w-6" style={{ color: CHAMPAGNE }} />}
                  iconStyle={{
                    color: CHAMPAGNE,
                    border: `1px solid ${BORDER_SOFT}`,
                    backgroundColor: INNER_SURFACE,
                  }}
                  main="Response Sent"
                  script="successfully"
                />

                <ProposalFlowSubheader>
                  {playfulInvite ? "Thank you for letting us know" : "Your message has reached us"}
                </ProposalFlowSubheader>

                <ProposalFlowBody
                  className={
                    playfulInvite
                      ? `mb-6 max-w-md text-center sm:mb-8 ${playfair.className} text-[0.9375rem] font-medium not-italic leading-[1.65] sm:text-base`
                      : "mb-6 max-w-md text-center sm:mb-8"
                  }
                  mixedText={
                    playfulInvite
                      ? "We hope you know how special you are to us, and we look forward to celebrating with you."
                      : undefined
                  }
                >
                  {!playfulInvite
                    ? principalSponsor
                      ? "We are simply grateful to have shared this moment with you. Your love and warmest wishes mean the world to us."
                      : "We hope you'll still celebrate this beautiful day with us in your own way. Your love and warmest wishes mean the world to us."
                    : null}
                </ProposalFlowBody>

                <p
                  className={`${cinzel.className} text-center text-[0.58rem] font-medium uppercase tracking-[0.16em]`}
                  style={{ color: palette.bodySoft }}
                >
                  {playfulInvite ? (
                    <>
                      With lots of love,
                      <br />
                      {groomSign} & {brideSign}{" "}
                      <ProposalMixedText
                        text="🤍"
                        specialClassName={`${inter.className} inline-block align-baseline text-[1em] font-medium not-italic`}
                      />
                    </>
                  ) : (
                    <>
                      With love and warmest wishes,
                      <br />
                      {groomSign} & {brideSign}
                    </>
                  )}
                </p>

                <div className="flex items-center justify-center pb-2 sm:pb-3">
                  <DividerLine className="w-full max-w-md" />
                </div>

                <Link
                  href="/"
                  className={`${secondaryBtnClass} mx-auto inline-block w-full max-w-sm`}
                  style={secondaryBtnStyle}
                >
                  Return to Wedding Page
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
        <div
          className="flex min-h-screen items-center justify-center px-6"
          style={{ background: sectionBackground, color: CREAM }}
        >
          <p className={`${cinzel.className} text-sm uppercase tracking-[0.2em]`}>
            Loading invitation…
          </p>
        </div>
      }
    >
      <ProposalPageInner {...props} />
    </Suspense>
  )
}
