"use client"

import React, { useMemo } from "react"
import localFont from "next/font/local"
import { motion, useReducedMotion } from "motion/react"
import { StorySection } from "@/components/StorySection"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"
import { useSiteConfig } from "@/hooks/use-site-config"
import { siteConfig as defaultSiteConfig } from "@/content/site"
import { PlainBubbles } from "@/components/loader/PlainBubbles"
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

const revealEase = [0.22, 1, 0.36, 1] as const

// Section background = the hero's circle pattern (PlainBubbles paints its own aqua base)
const sectionBg = "var(--color-bg-pattern-base)"

// Soft white halo so text stays readable over the circles (globals.css → --color-on-pattern-glow)
const onBgGlow = "0 1px 0 var(--color-on-pattern-glow), 0 2px 12px var(--color-on-pattern-glow)"

function formatStoryParagraph(
  paragraph: string,
  groom: string,
  bride: string,
): string {
  return paragraph
    .replace(/\{groom\}/g, groom)
    .replace(/\{bride\}/g, bride)
}

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span
        className="h-px w-6 sm:w-10"
        style={{
          background: "color-mix(in srgb, #1F3460 35%, transparent)",
        }}
      />
      <span className="h-0.5 w-0.5 rounded-full bg-motif-deep sm:h-1 sm:w-1" aria-hidden />
      <span
        className="h-px w-6 sm:w-10"
        style={{
          background: "color-mix(in srgb, #1F3460 35%, transparent)",
        }}
      />
    </div>
  )
}

function LoveStoryTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <h1
      className="welcome-title-lockup relative mx-auto mt-6 w-full max-w-full text-center sm:mt-8 md:mt-10"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block pb-1 uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em]`}
        style={{
          fontSize: "var(--title-size)",
          color: "#1F3460",
          textShadow: onBgGlow,
        }}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} mx-auto mt-2 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2.5 sm:leading-[0.9] md:mt-3`}
        style={{
          fontSize: "var(--script-size)",
          color: "#D0899A",
          textShadow: onBgGlow,
        }}
      >
        {subtitle}
      </span>
      <span className="sr-only">{subtitle}</span>
    </h1>
  )
}

const CORNER_ANIM_CLASS = {
  topLeft: "invite-section-corner-img--animated invite-section-corner-img--tl",
  topRight: "invite-section-corner-img--animated invite-section-corner-img--tr",
  bottomLeft: "invite-section-corner-img--animated invite-section-corner-img--bl",
  bottomRight: "invite-section-corner-img--animated invite-section-corner-img--br",
} as const

function SectionCornerDecos({
  cornerDecos,
}: {
  cornerDecos: (typeof defaultSiteConfig.loadingScreen)["cornerDecos"]
}) {
  const corners = [
    { src: cornerDecos.topLeft, className: "left-0 top-0", anim: CORNER_ANIM_CLASS.topLeft },
    { src: cornerDecos.topRight, className: "right-0 top-0", anim: CORNER_ANIM_CLASS.topRight },
    {
      src: cornerDecos.bottomLeft,
      className: "left-0 bottom-0",
      anim: CORNER_ANIM_CLASS.bottomLeft,
    },
    {
      src: cornerDecos.bottomRight,
      className: "right-0 bottom-0",
      anim: CORNER_ANIM_CLASS.bottomRight,
    },
  ] as const

  return (
    <div className="invite-section-corners" aria-hidden="true">
      {corners.map(({ src, className, anim }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          className={`invite-section-corner-img absolute ${className} ${anim}`}
        />
      ))}
    </div>
  )
}

function chapterTextFromParagraphs(
  paragraphs: readonly string[],
  groom: string,
  bride: string,
) {
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className={
            paragraphs.length > 1 && index < paragraphs.length - 1 ? "mb-4" : undefined
          }
        >
          {formatStoryParagraph(paragraph, groom, bride)}
        </p>
      ))}
    </>
  )
}

export function LoveStory() {
  const siteConfig = useSiteConfig()
  const loading = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen
  const loveStory = siteConfig.loveStory ?? defaultSiteConfig.loveStory
  const isPlain = loading.display === "plain"
  const cornerDecos =
    loading.cornerDecos ?? defaultSiteConfig.loadingScreen.cornerDecos
  const reduceMotion = useReducedMotion()

  const groom =
    siteConfig.couple.groomNickname || siteConfig.couple.groom
  const bride =
    siteConfig.couple.brideNickname || siteConfig.couple.bride

  const chapters = useMemo(
    () => loveStory.chapters ?? defaultSiteConfig.loveStory.chapters,
    [loveStory.chapters],
  )
  const eucalyptusDecos =
    loveStory.eucalyptusDecos ?? defaultSiteConfig.loveStory.eucalyptusDecos

  return (
    <div
      id="love-story"
      className={`love-story-root ${theSeasons.variable} ${aboveTheBeyond.variable} relative min-h-screen w-full overflow-x-hidden`}
      style={{ background: sectionBg }}
    >
      {/* Same circle pattern as the other sections */}
      <PlainBubbles />
      <SectionCornerDecos cornerDecos={cornerDecos} />

      <header
        className="relative z-20 px-4 pb-6 pt-8 text-center sm:px-6 sm:pb-4 sm:pt-10 md:px-8 md:pt-12"
      >
        <motion.div
          className="relative mx-auto max-w-5xl @container/love-story"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.75, ease: revealEase }}
        >
          <OrnamentalDivider />
          <LoveStoryTitle title={loveStory.title} subtitle={loveStory.subtitle} />
        </motion.div>
      </header>

      {chapters.map((chapter, index) => (
        <StorySection
          key={`${chapter.image}-${index}`}
          title={chapter.title}
          theme={chapter.theme}
          layout={chapter.layout}
          imageSrc={chapter.image}
          text={chapterTextFromParagraphs(chapter.paragraphs, groom, bride)}
          plain={isPlain}
          chapterIndex={index}
          isFirst={index === 0}
          isLast={index === chapters.length - 1}
          eucalyptusDecos={isPlain ? eucalyptusDecos : undefined}
          chapterLabelText={loveStory.chapterLabel}
        />
      ))}

      <footer
        className="relative z-20 px-4 pb-16 pt-8 text-center sm:px-6 sm:pb-20 sm:pt-10 md:pb-24 md:px-8 md:pt-12"
      >
        <motion.div
          className="relative mx-auto max-w-xl px-2"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.75, delay: 0.08, ease: revealEase }}
        >
          <OrnamentalDivider />
          <blockquote className="mt-5 sm:mt-6">
            <p
              className={`font-goudy-italic ${sectionType.textRelaxed} italic leading-relaxed`}
              style={{ color: "#1F3460", textShadow: onBgGlow }}
            >
              &ldquo;{loveStory.closingQuote}&rdquo;
            </p>
            <footer
              className={`font-goudy-italic mt-2 sm:mt-3 ${sectionType.label} not-italic tracking-wide`}
              style={{ color: "#D0899A", textShadow: onBgGlow }}
            >
              — {loveStory.closingCitation}
            </footer>
          </blockquote>
          {isPlain && eucalyptusDecos.sectionBottom ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={eucalyptusDecos.sectionBottom}
              alt=""
              className="love-story-footer-euc mx-auto mt-8 sm:mt-10"
            />
          ) : null}
        </motion.div>
      </footer>
    </div>
  )
}
