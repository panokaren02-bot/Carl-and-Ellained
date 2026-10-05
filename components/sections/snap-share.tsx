"use client"

import { useEffect, useState } from "react"
import { Cinzel } from "next/font/google"
import localFont from "next/font/local"
import { Instagram, Facebook, Twitter, Share2, Copy, Download, Check } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"
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

// Header + closing text sit on the page backdrop, so they stay light.
const OUTSIDE_TEXT = "#FFFFFF"
const OUTSIDE_TEXT_MUTED = "rgba(255, 255, 255, 0.88)"
const OUTSIDE_TITLE_SHADOW = "0 2px 6px rgba(0, 0, 0, 0.28), 0 0 18px rgba(0, 0, 0, 0.12)"
const READABLE_SHADOW = "0 1px 3px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.35)"

// Card palette — globals.css motif / welcome tokens.
const IVORY = "var(--color-motif-soft)"
const PAPER = "var(--color-welcome-bg-soft)"
const HAIRLINE = "color-mix(in srgb, var(--color-motif-medium) 55%, transparent)"
const PALE = "color-mix(in srgb, var(--color-motif-silver) 55%, var(--color-motif-soft))"
const DEEP_GRADIENT =
  "linear-gradient(180deg, var(--color-motif-accent) 0%, var(--color-motif-deep) 55%, var(--color-welcome-navy) 100%)"

const palette = {
  body: "var(--color-welcome-text)",
  heading: "var(--color-welcome-navy)",
  label: "var(--color-motif-accent)",
  accent: "var(--color-motif-deep)",
} as const

const outsideDividerLineStyle = {
  background: "linear-gradient(to right, transparent, rgba(255, 255, 255, 0.55), transparent)",
} as const

const insideDividerLineStyle = {
  background: "linear-gradient(to right, transparent, var(--color-motif-medium), transparent)",
} as const

const ct = {
  body: sectionType.text,
  bodyLg: sectionType.textRelaxed,
  label: sectionType.label,
  cardTitle: `${sectionType.subheader} lg:text-xl`,
  btn: sectionType.label,
} as const

const cardStyle = {
  background: `linear-gradient(180deg, ${PAPER} 0%, var(--color-motif-cream) 100%)`,
  boxShadow:
    "0 24px 50px -28px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent), inset 0 1px 0 rgb(255 255 255 / 80%)",
} as const

const QR_FG = "#304A34" // --color-welcome-navy (canvas needs a literal color)

function OutsideDivider() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="h-px w-6 sm:w-10" style={outsideDividerLineStyle} />
      <span className="h-0.5 w-0.5 rounded-full bg-white/50 sm:h-1 sm:w-1" aria-hidden />
      <span className="h-px w-6 sm:w-10" style={outsideDividerLineStyle} />
    </div>
  )
}

function SnapShareTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
          "--script-overlap": layeredSectionTitleSize.overlap,
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em]`}
        style={{ fontSize: "var(--title-size)", color: OUTSIDE_TEXT, textShadow: OUTSIDE_TITLE_SHADOW }}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9]`}
        style={{
          marginTop: "var(--script-overlap)",
          fontSize: "var(--script-size)",
          color: OUTSIDE_TEXT_MUTED,
          textShadow: OUTSIDE_TITLE_SHADOW,
        }}
      >
        {subtitle}
      </span>
      <span className="sr-only">{subtitle}</span>
    </h2>
  )
}

function ContentCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[1.5rem] sm:rounded-[1.75rem] ${className}`} style={cardStyle}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, color-mix(in srgb, var(--color-motif-silver) 70%, transparent), transparent)",
        }}
      />
      <div className="relative z-20 flex flex-col gap-3 px-4 py-6 sm:gap-4 sm:px-6 sm:py-7 md:px-7">{children}</div>
    </div>
  )
}

function CardTitle({ children, as: Tag = "h4" }: { children: React.ReactNode; as?: "h4" | "h5" }) {
  return (
    <Tag
      className={`${cinzel.className} ${ct.cardTitle} text-center font-semibold uppercase tracking-[0.1em]`}
      style={{ color: palette.heading }}
    >
      {children}
    </Tag>
  )
}

function PrimaryButton({
  onClick,
  children,
  active = false,
}: {
  onClick?: () => void
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${cinzel.className} inline-flex items-center justify-center gap-1.5 rounded-full border px-5 py-2.5 font-semibold uppercase tracking-[0.16em] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-motif-accent)] sm:px-6 ${ct.btn}`}
      style={{
        background: active ? "var(--color-welcome-navy)" : DEEP_GRADIENT,
        borderColor: "color-mix(in srgb, var(--color-motif-medium) 60%, transparent)",
        color: IVORY,
        boxShadow: "0 12px 24px -12px color-mix(in srgb, var(--color-welcome-navy) 60%, transparent)",
      }}
    >
      {children}
    </button>
  )
}

const SOCIAL = {
  instagram: { Icon: Instagram, label: "Instagram" },
  facebook: { Icon: Facebook, label: "Facebook" },
  tiktok: { Icon: Share2, label: "TikTok" },
  twitter: { Icon: Twitter, label: "Twitter" },
} as const

export function SnapShare() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.snapShare
  const [copiedHashtagIndex, setCopiedHashtagIndex] = useState<number | null>(null)
  const [copiedAllHashtags, setCopiedAllHashtags] = useState(false)
  const [copiedDriveLink, setCopiedDriveLink] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const { groomNickname, brideNickname } = siteConfig.couple
  const coupleDisplayName = `${groomNickname} & ${brideNickname}`
  const fill = (text: string) => text.split("{couple}").join(coupleDisplayName)

  const websiteUrl = typeof window !== "undefined" ? window.location.href : "https://example.com"
  const uploadLink = content.googleDriveLink
  const hashtags = content.hashtag
  const allHashtagsText = hashtags.join(" ")
  const sanitizedGroomName = groomNickname.replace(/\s+/g, "")
  const sanitizedBrideName = brideNickname.replace(/\s+/g, "")
  const shareText = `${fill(content.social.shareText)} ${websiteUrl} ${allHashtagsText}`

  // Plain display mode never shows the photo card
  const isPlain = siteConfig.loadingScreen?.display === "plain"
  const showMoments = content.moments.show && !isPlain && content.moments.images.length > 0
  const [momentA, momentB, momentC] = content.moments.images

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const shareOnSocial = (platform: keyof typeof SOCIAL) => {
    const encodedUrl = encodeURIComponent(websiteUrl)
    const encodedText = encodeURIComponent(shareText)
    const urls: Record<string, string> = {
      instagram: "https://www.instagram.com/",
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      tiktok: "https://www.tiktok.com/",
    }
    const target = urls[platform]
    if (target) window.open(target, "_blank", "width=600,height=400")
  }

  const downloadCanvas = (id: string, filename: string) => {
    const canvas = document.getElementById(id) as HTMLCanvasElement | null
    if (!canvas) return
    const link = document.createElement("a")
    link.download = filename
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const copyText = async (text: string, onDone: () => void) => {
    try {
      await navigator.clipboard.writeText(text)
      onDone()
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const qrFrame = (
    id: string,
    value: string,
    level: "L" | "M" | "Q" | "H",
    note?: string,
  ) => (
    <div
      className="mx-auto flex w-full max-w-[240px] flex-col items-center rounded-2xl p-3 sm:p-4"
      style={{ background: IVORY, boxShadow: `0 0 0 1px ${HAIRLINE}, 0 14px 28px -20px color-mix(in srgb, var(--color-welcome-navy) 50%, transparent)` }}
    >
      <div className="flex w-full max-w-full justify-center overflow-hidden rounded-xl bg-white">
        <QRCodeCanvas
          id={id}
          value={value}
          size={isMobile ? 160 : 200}
          level={level}
          includeMargin
          className="h-auto max-w-full"
          fgColor={QR_FG}
          bgColor="#FFFFFF"
        />
      </div>
      {note ? (
        <p className={`font-goudy-italic ${ct.body} mt-2 text-center sm:mt-3`} style={{ color: palette.label }}>
          {note}
        </p>
      ) : null}
    </div>
  )

  const websiteCard = content.website.show && (
    <ContentCard>
      <CardTitle>{content.website.title}</CardTitle>
      <p className={`font-goudy-italic ${ct.body} text-center`} style={{ color: palette.body }}>
        {fill(content.website.description)}
      </p>
      {qrFrame("snapshare-qr", websiteUrl, "M")}
      <div className="flex justify-center">
        <PrimaryButton
          onClick={() =>
            downloadCanvas(
              "snapshare-qr",
              `${sanitizedGroomName.toLowerCase()}-${sanitizedBrideName.toLowerCase()}-wedding-qr.png`,
            )
          }
        >
          <Download className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
          {content.website.downloadButton}
        </PrimaryButton>
      </div>
      <p className={`font-goudy-italic ${ct.body} text-center`} style={{ color: "var(--color-welcome-text-soft)" }}>
        {content.website.note}
      </p>
    </ContentCard>
  )

  const hashtagsCard = content.hashtags.show && hashtags.length > 0 && (
    <ContentCard>
      <CardTitle as="h5">{content.hashtags.title}</CardTitle>
      <div className="w-full min-w-0 space-y-2">
        {hashtags.map((hashtag, index) => {
          const isCopied = copiedHashtagIndex === index
          return (
            <button
              key={index}
              type="button"
              onClick={() =>
                copyText(hashtag, () => {
                  setCopiedHashtagIndex(index)
                  setTimeout(() => setCopiedHashtagIndex(null), 2000)
                })
              }
              className="flex w-full min-w-0 items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 transition-all duration-200 active:scale-[0.98]"
              style={{
                background: isCopied ? PALE : IVORY,
                boxShadow: `inset 0 0 0 1px ${isCopied ? "color-mix(in srgb, var(--color-motif-accent) 50%, transparent)" : HAIRLINE}`,
              }}
            >
              <span
                className={`font-goudy-italic ${ct.body} min-w-0 flex-1 break-all text-left font-semibold`}
                style={{ color: isCopied ? palette.accent : palette.heading }}
              >
                {hashtag}
              </span>
              <span
                className={`${cinzel.className} flex flex-shrink-0 items-center gap-1 whitespace-nowrap ${sectionType.label} font-semibold uppercase tracking-wider`}
                style={{ color: isCopied ? palette.accent : palette.label }}
              >
                {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {isCopied ? content.hashtags.copied : content.hashtags.copy}
              </span>
            </button>
          )
        })}
      </div>
      {hashtags.length > 1 && (
        <button
          type="button"
          onClick={() =>
            copyText(allHashtagsText, () => {
              setCopiedAllHashtags(true)
              setTimeout(() => setCopiedAllHashtags(false), 2000)
            })
          }
          className="flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
          style={copiedAllHashtags ? { background: PALE, color: palette.accent } : { background: DEEP_GRADIENT, color: IVORY }}
        >
          {copiedAllHashtags ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span className={`${cinzel.className} ${ct.btn} font-semibold uppercase tracking-[0.12em]`}>
            {copiedAllHashtags ? content.hashtags.allCopied : content.hashtags.copyAll}
          </span>
        </button>
      )}
    </ContentCard>
  )

  const socialCard = content.social.show && content.social.platforms.length > 0 && (
    <ContentCard>
      <CardTitle as="h5">{content.social.title}</CardTitle>
      <p className={`font-goudy-italic ${ct.body} text-center`} style={{ color: palette.body }}>
        {fill(content.social.description)}
      </p>
      <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:gap-3">
        {content.social.platforms.map((platform) => {
          const { Icon, label } = SOCIAL[platform]
          return (
            <button
              key={platform}
              type="button"
              onClick={() => shareOnSocial(platform)}
              className="group flex w-full min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-3 transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: IVORY, boxShadow: `inset 0 0 0 1px ${HAIRLINE}` }}
            >
              <Icon className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" style={{ color: palette.label }} />
              <span className={`${cinzel.className} ${ct.btn} truncate font-semibold uppercase tracking-[0.08em]`} style={{ color: palette.heading }}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </ContentCard>
  )

  const uploadCard = uploadLink && (
    <ContentCard>
      <p
        className={`${cinzel.className} ${ct.label} mx-auto w-full rounded-full px-3 py-1.5 text-center uppercase leading-snug tracking-[0.16em] break-words`}
        style={{ color: palette.heading, background: PALE }}
      >
        {content.upload.badge}
      </p>
      <p className={`font-goudy-italic ${ct.body} break-words text-center`} style={{ color: palette.body }}>
        {content.instructions}
      </p>
      {qrFrame("album-qr", uploadLink, "H", content.upload.scanNote)}
      <span className="mx-auto block h-px w-24 sm:w-32" style={insideDividerLineStyle} aria-hidden />
      <div className="flex w-full flex-col justify-center gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
        <PrimaryButton
          onClick={() =>
            copyText(uploadLink, () => {
              setCopiedDriveLink(true)
              setTimeout(() => setCopiedDriveLink(false), 2000)
            })
          }
          active={copiedDriveLink}
        >
          {copiedDriveLink ? <Check className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" /> : <Copy className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />}
          {copiedDriveLink ? content.upload.copied : content.upload.copyLink}
        </PrimaryButton>
        <PrimaryButton onClick={() => downloadCanvas("album-qr", "album-qr.png")}>
          <Download className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
          {content.upload.downloadQr}
        </PrimaryButton>
        <a
          href={uploadLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`${cinzel.className} inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 font-semibold uppercase tracking-[0.16em] transition-all duration-300 hover:-translate-y-0.5 sm:px-6 ${ct.btn}`}
          style={{ background: IVORY, color: palette.heading, boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--color-motif-accent) 55%, transparent)` }}
        >
          <Share2 className="h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4" />
          {content.upload.uploadButton}
        </a>
      </div>
    </ContentCard>
  )

  return (
    <section
      id="snap-share"
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative z-10 bg-transparent pt-8 pb-8 sm:pt-10 sm:pb-10 md:pt-12 md:pb-12 lg:pt-14 lg:pb-14`}
    >
      <div className="relative z-20 mx-auto max-w-6xl px-4 @container/snap-share sm:px-6 md:px-8">
        <div className="relative z-20 px-6 text-center sm:px-10 md:px-12">
          <div className="mx-auto mb-5 sm:mb-6 md:mb-7">
            <OutsideDivider />
          </div>
          <div className="mx-auto mt-2 sm:mt-3 md:mt-4">
            <SnapShareTitle title={content.title} subtitle={content.subtitle} />
          </div>
          <p
            className={`font-goudy-italic mx-auto mt-4 max-w-2xl px-2 sm:mt-5 md:mt-6 ${ct.bodyLg}`}
            style={{ color: OUTSIDE_TEXT_MUTED, textShadow: READABLE_SHADOW }}
          >
            {fill(content.description)}
          </p>
          <div className="flex items-center justify-center pt-3 sm:pt-4">
            <span className="h-px w-16 bg-white/50 sm:w-24 md:w-32" />
          </div>
        </div>

        {showMoments ? (
          <div className="mt-6 grid grid-cols-1 items-start gap-5 sm:mt-8 sm:gap-6 md:mt-10 lg:grid-cols-2 lg:gap-8">
            <ContentCard>
              <CardTitle>{content.moments.title}</CardTitle>
              <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:gap-3">
                {[momentA, momentB].filter(Boolean).map((src, i) => (
                  <div key={src} className="relative aspect-square overflow-hidden rounded-xl" style={{ boxShadow: `0 0 0 1px ${HAIRLINE}` }}>
                    <Image src={src} alt={`Wedding moment ${i + 1}`} fill sizes="(max-width: 1024px) 45vw, 22vw" className="object-cover" />
                  </div>
                ))}
                {momentC ? (
                  <div className="relative col-span-2 aspect-[3/2] overflow-hidden rounded-xl" style={{ boxShadow: `0 0 0 1px ${HAIRLINE}` }}>
                    <Image src={momentC} alt="Wedding moment 3" fill sizes="(max-width: 1024px) 90vw, 45vw" className="object-cover" />
                  </div>
                ) : null}
              </div>
              <p className={`font-goudy-italic ${ct.body} text-center`} style={{ color: palette.body }}>
                {content.moments.caption}
              </p>
            </ContentCard>

            <div className="w-full min-w-0 space-y-5 sm:space-y-6">
              {websiteCard}
              {hashtagsCard}
              {socialCard}
              {uploadCard}
            </div>
          </div>
        ) : (
          // Without the photo card, the remaining cards share a balanced two-column grid
          <div className="mt-6 grid grid-cols-1 items-start gap-5 sm:mt-8 sm:gap-6 md:mt-10 lg:grid-cols-2 lg:gap-8">
            <div className="w-full min-w-0 space-y-5 sm:space-y-6">
              {websiteCard}
              {hashtagsCard}
            </div>
            <div className="w-full min-w-0 space-y-5 sm:space-y-6">
              {socialCard}
              {uploadCard}
            </div>
          </div>
        )}

        <div className="mt-6 space-y-2 text-center sm:mt-8 md:mt-10">
          <p className={`font-goudy-italic ${ct.bodyLg}`} style={{ color: OUTSIDE_TEXT_MUTED, textShadow: READABLE_SHADOW }}>
            {fill(content.closing)}
          </p>
          <p
            className={`${cinzel.className} ${ct.label} uppercase tracking-[0.18em] sm:tracking-[0.2em]`}
            style={{ color: OUTSIDE_TEXT, textShadow: READABLE_SHADOW }}
          >
            {content.closingTag}
          </p>
        </div>
      </div>
    </section>
  )
}
