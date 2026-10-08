"use client"

import { useState, type CSSProperties } from "react"
import Image from "next/image"
import localFont from "next/font/local"
import { Cinzel } from "next/font/google"
import { Gift, Heart } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"
import { PlainBubbles } from "@/components/loader/PlainBubbles"

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
  "block h-auto w-auto max-w-[130px] sm:max-w-[200px] md:max-w-[260px] lg:max-w-[320px] select-none opacity-90"

// Text sitting directly on the circle pattern (colors: globals.css → --color-on-pattern*)
const onBg = {
  color: "var(--color-on-pattern)",
  textShadow: "0 1px 0 var(--color-on-pattern-glow), 0 2px 12px var(--color-on-pattern-glow)",
} as const

const ct = {
  body: sectionType.text,
  bodyLg: sectionType.textRelaxed,
} as const

const ease = [0.22, 1, 0.36, 1] as const

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}

const staggerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
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

function RegistryTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
        } as CSSProperties
      }
    >
      <span className="sr-only">
        {title} — {subtitle}
      </span>
      <span
        aria-hidden
        className={`${theSeasons.className} block uppercase leading-[0.9] tracking-[0.04em] min-[400px]:tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.14em]`}
        style={{ fontSize: "var(--title-size)", ...onBg }}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto mt-1.5 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2 sm:leading-[0.9]`}
        style={{ fontSize: "var(--script-size)", ...onBg }}
      >
        {subtitle}
      </span>
    </h2>
  )
}

export function Registry() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.registry
  const { decos } = content
  const c = content.colors // siteConfig.registry.colors (content/site.ts)
  const { brideNickname, groomNickname } = siteConfig.couple
  const reduceMotion = useReducedMotion()
  const [activeTab, setActiveTab] = useState(0)
  const initial = reduceMotion ? false : "hidden"

  const buttonBg = c.button
  const buttonText = "var(--color-motif-soft)"
  // Section background = the hero's circle pattern (PlainBubbles paints its own aqua base)
  const sectionBg = "var(--color-bg-pattern-base)"
  const cardStyle = {
    background: c.card,
    boxShadow: `0 26px 56px -30px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)`,
  }
  const dividerLineStyle = { background: "var(--color-on-pattern-line)" }

  const accounts = content.showAccounts
    ? content.accounts.filter((a) => a.show && (a.accountNumber || a.qr))
    : []
  const activeIndex = Math.min(activeTab, Math.max(0, accounts.length - 1))
  const active = accounts[activeIndex]

  return (
    <div
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-hidden`}
      style={{ background: sectionBg }}
    >
      {/* Same circle pattern as the hero */}
      <PlainBubbles />
      <section
        id="registry"
        className="relative z-10 overflow-hidden pt-14 pb-12 sm:pt-16 sm:pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20"
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

        {/* Header */}
        <motion.div
          className="relative z-20 mx-auto mb-8 max-w-5xl px-3 text-center @container/registry sm:mb-10 sm:px-4 md:mb-12"
          variants={revealVariants}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <DecoImg
            src={decos.headerOrnament}
            className="mx-auto mb-3 block h-auto w-28 select-none sm:mb-4 sm:w-36 md:w-44"
          />
          <DiamondDivider />
          <p
            className={`${cinzel.className} mx-auto mt-4 max-w-[20rem] px-2 text-[0.6875rem] font-semibold uppercase leading-snug tracking-[0.16em] min-[400px]:max-w-none min-[400px]:text-[0.75rem] sm:mt-5 sm:text-[0.875rem] sm:tracking-[0.22em]`}
            style={onBg}
          >
            {content.eyebrow}
          </p>
          <div className="mx-auto mt-3 sm:mt-4 md:mt-5">
            <RegistryTitle title={content.title} subtitle={content.subtitle} />
          </div>
          <p
            className={`font-goudy-italic mx-auto mt-4 max-w-xl px-2 sm:mt-5 md:mt-6 ${ct.bodyLg}`}
            style={{ ...onBg, fontWeight: 600 }}
          >
            {content.description}
          </p>
          <div className="mt-4 flex items-center justify-center sm:mt-5">
            <span className="h-px w-16 sm:w-24 md:w-32" style={dividerLineStyle} />
          </div>
        </motion.div>

        <div className="relative z-20 mx-auto max-w-2xl px-4 sm:px-6 md:px-8">
          {/* Letter card */}
          <motion.div
            className="relative mt-8 rounded-[1.75rem] px-7 pb-10 pt-12 text-center sm:mt-10 sm:rounded-[2.25rem] sm:px-12 sm:pb-12 sm:pt-14 md:px-14"
            style={cardStyle}
            variants={staggerVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.05 }}
          >
            {/* Seal sitting on the top edge */}
            <motion.div variants={itemVariants} className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16"
                style={{
                  background: buttonBg,
                  boxShadow: `0 0 0 5px ${c.card}, 0 0 0 6px color-mix(in srgb, ${c.line} 60%, transparent), 0 16px 30px -12px color-mix(in srgb, ${c.title} 65%, transparent)`,
                }}
                aria-hidden
              >
                <Gift className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: buttonText }} />
              </span>
            </motion.div>

            <div className={`font-goudy-italic relative mx-auto max-w-xl space-y-4 ${ct.bodyLg} leading-relaxed`} style={{ color: c.body }}>
              {content.paragraphs.map((text, i) => (
                <motion.p key={i} variants={itemVariants} className={i === 0 ? "text-left sm:text-center" : ""}>
                  {i === 0 && text.length > 1 ? (
                    <>
                      {/* Drop cap on the first paragraph */}
                      <span
                        className={`${theSeasons.className} float-left mr-2 mt-1 text-[2.6rem] leading-[0.8] sm:float-none sm:mr-1 sm:inline sm:text-[2.2rem] sm:leading-none`}
                        style={{ color: c.script }}
                        aria-hidden
                      >
                        {text.charAt(0)}
                      </span>
                      <span className="sr-only">{text.charAt(0)}</span>
                      {text.slice(1)}
                    </>
                  ) : (
                    text
                  )}
                </motion.p>
              ))}
            </div>

            {/* Optional e-gift accounts — tap a tab to switch */}
            {active && (
              <motion.div
                className="relative mt-8 sm:mt-9"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 0.6, ease }}
              >
                <p
                  className={`${cinzel.className} text-[0.65rem] font-semibold uppercase tracking-[0.22em] sm:text-xs`}
                  style={{ color: c.eyebrow }}
                >
                  {content.accountsTitle}
                </p>

                {accounts.length > 1 && (
                  <div
                    role="tablist"
                    aria-label={content.accountsTitle}
                    className="mx-auto mt-3 inline-flex max-w-full flex-wrap justify-center gap-1 rounded-full p-1"
                    style={{ background: `color-mix(in srgb, ${c.glow} 70%, transparent)` }}
                  >
                    {accounts.map((account, i) => {
                      const selected = i === activeIndex
                      return (
                        <button
                          key={`${account.label}-${i}`}
                          type="button"
                          role="tab"
                          id={`registry-tab-${i}`}
                          aria-selected={selected}
                          aria-controls="registry-tabpanel"
                          onClick={() => setActiveTab(i)}
                          className={`${cinzel.className} rounded-full px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-all duration-300 sm:px-5 sm:text-[0.72rem]`}
                          style={
                            selected
                              ? {
                                  background: buttonBg,
                                  color: buttonText,
                                  boxShadow: `0 6px 14px -8px color-mix(in srgb, ${c.button} 70%, transparent)`,
                                }
                              : { color: c.title }
                          }
                        >
                          {account.label}
                        </button>
                      )
                    })}
                  </div>
                )}

                <div
                  id="registry-tabpanel"
                  role={accounts.length > 1 ? "tabpanel" : undefined}
                  aria-labelledby={accounts.length > 1 ? `registry-tab-${activeIndex}` : undefined}
                  className="mx-auto mt-4 max-w-[17rem]"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeIndex}
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease }}
                      className="flex flex-col items-center rounded-2xl px-5 py-5"
                      style={{
                        background: c.accountCard,
                        border: `1px solid ${c.glow}`,
                        boxShadow: `0 18px 34px -22px color-mix(in srgb, ${c.title} 45%, transparent)`,
                      }}
                    >
                      {accounts.length === 1 && (
                        <p className={`${theSeasons.className} mb-3 text-lg uppercase tracking-[0.12em]`} style={{ color: c.title }}>
                          {active.label}
                        </p>
                      )}
                      {active.qr ? (
                        <div className="relative h-44 w-44 overflow-hidden rounded-xl bg-white sm:h-48 sm:w-48">
                          <Image
                            src={active.qr}
                            alt={`${active.label} QR code`}
                            fill
                            unoptimized
                            sizes="192px"
                            draggable={false}
                            className="pointer-events-none select-none object-contain p-2"
                          />
                        </div>
                      ) : (
                        <span
                          className={`${theSeasons.className} flex h-14 w-14 items-center justify-center rounded-full text-xl`}
                          style={{ background: `color-mix(in srgb, ${c.glow} 80%, transparent)`, color: c.title }}
                          aria-hidden
                        >
                          {active.label.charAt(0)}
                        </span>
                      )}
                      {active.accountName ? (
                        <p className="font-goudy-italic mt-3 text-sm" style={{ color: c.body }}>
                          {active.accountName}
                        </p>
                      ) : null}
                      {active.accountNumber ? (
                        <p
                          className={`${cinzel.className} mt-1 text-[0.8rem] font-semibold tabular-nums tracking-[0.12em]`}
                          style={{ color: c.title }}
                        >
                          {active.accountNumber}
                        </p>
                      ) : null}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            <div className="h-6 sm:h-7" aria-hidden />

            {/* Sign-off */}
            <motion.div variants={itemVariants} className="relative space-y-1.5">
              {content.thankYou ? (
                <p className={`font-goudy-italic ${ct.body}`} style={{ color: c.body }}>
                  {content.thankYou}
                </p>
              ) : null}
              <p className={`font-goudy-italic ${ct.body}`} style={{ color: c.soft }}>
                {content.signOff}
              </p>
              <p className={`${aboveTheBeyond.className} pt-1 text-2xl leading-tight sm:text-3xl`} style={{ color: c.script }}>
                {content.signature || `${groomNickname} & ${brideNickname}`}
              </p>
              <Heart className="mx-auto mt-2 h-3.5 w-3.5" style={{ color: c.eyebrow, fill: c.eyebrow }} aria-hidden />
            </motion.div>
          </motion.div>

          <DecoImg
            src={decos.footerVine}
            className="mx-auto mt-10 block h-auto w-56 select-none opacity-90 sm:mt-12 sm:w-72 md:w-96"
          />
        </div>
      </section>
    </div>
  )
}
