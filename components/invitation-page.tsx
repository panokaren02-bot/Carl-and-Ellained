"use client"

import { Suspense, useState, useCallback, useEffect, useLayoutEffect } from "react"
import { motion } from "motion/react"
import dynamic from "next/dynamic"
import { Hero as MainHero } from "@/components/sections/hero"
import { Welcome } from "@/components/sections/welcome"
import { Hero as InvitationHero } from "@/components/loader/Hero"
import { LoadingScreen } from "@/components/loader/LoadingScreen"
import { InvitePhotoBackdrop } from "@/components/loader/invite-photo-backdrop"
import { Navbar } from "@/components/navbar"
import { AppState } from "@/components/types"
import { prefetchInvitationData } from "@/lib/invitation-data"
import { useSiteConfig } from "@/hooks/use-site-config"
import { WeddingPlaylist } from "@/components/sections/wedding-playlist"
import type { SponsorsList } from "@/components/sections/entourage"

const Silk = dynamic(() => import("@/components/silk"), { ssr: false })
const GuestList = dynamic(() => import("@/components/sections/guest-list").then(mod => ({ default: mod.GuestList })), { ssr: false })

// Below-the-fold sections are split into separate chunks to shrink the initial bundle.
const CoupleVideo = dynamic(() => import("@/components/sections/couple-video").then(mod => mod.CoupleVideo))
const LoveStory = dynamic(() => import("@/components/sections/love-story").then(mod => mod.LoveStory))
const Countdown = dynamic(() => import("@/components/sections/countdown").then(mod => mod.Countdown))
const Gallery = dynamic(() => import("@/components/sections/gallery").then(mod => mod.Gallery))
const MessageVideo = dynamic(() => import("@/components/sections/message-video").then(mod => mod.MessageVideo))
const Messages = dynamic(() => import("@/components/sections/messages").then(mod => mod.Messages))
const Details = dynamic(() => import("@/components/sections/details").then(mod => mod.Details))
const WeddingTimeline = dynamic(() => import("@/components/sections/wedding-timeline").then(mod => mod.WeddingTimeline))
const Entourage = dynamic(() => import("@/components/sections/entourage").then(mod => mod.Entourage))
const BookOfGuests = dynamic(() => import("@/components/sections/book-of-guests").then(mod => mod.BookOfGuests))
const FAQ = dynamic(() => import("@/components/sections/faq").then(mod => mod.FAQ))
const Registry = dynamic(() => import("@/components/sections/registry").then(mod => mod.Registry))
const SnapShare = dynamic(() => import("@/components/sections/snap-share").then(mod => mod.SnapShare))
const SeeYouThere = dynamic(() => import("@/components/sections/see-you-there").then(mod => mod.SeeYouThere))
const Footer = dynamic(() => import("@/components/sections/footer").then(mod => mod.Footer))

const mainEntryEase = [0.22, 1, 0.36, 1] as const
const CINEMATIC_ENTRY_MS = 3000

const detailsShellVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.01 },
  },
}

const silkBackdropVariants = {
  hidden: { opacity: 0, scale: 1.08 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.45, ease: mainEntryEase, delay: 0.42 },
  },
}

// Navbar drops in last, once the hero title has landed
const navbarRevealVariants = {
  hidden: { opacity: 0, y: -28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: mainEntryEase, delay: 1.1 },
  },
}

// The hero shows at once beneath the dissolving envelope — the backgrounds match,
// so moving or blurring the whole block would show; its text and corners animate
// in by themselves (MainHero play/delay)
const heroRevealVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.01 } },
}

// Below the fold; no blur — a full-page filter is costly on phones
const sectionsRevealVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: mainEntryEase, delay: 0.6 },
  },
}

// Seconds after the hand-off starts before the hero's entry plays: by then the
// letter and envelope are mostly gone (components/loader/Hero.tsx exit timings)
const HERO_ENTRY_DELAY_S = 0.33

/** WebGL Silk needs a hex color. */
const SILK_COLOR = "#1F3460"

type InvitationPageProps = {
  /** Which principal-sponsor sheet the entourage shows (googleAPI.sponsorsInviteOne / Two) */
  sponsorsList?: SponsorsList
  /** false hides the entourage section (e.g. /inviteguest) */
  showEntourage?: boolean
}

export function InvitationPage({ sponsorsList, showEntourage = true }: InvitationPageProps = {}) {
  // Skip loading/landing only when returning from /gallery.
  // The flag is set by the "View Full Gallery" button and cleared immediately
  // here so a page refresh always replays the loading screen.
  // Always start in LOADING so the first client render matches the server HTML;
  // the gallery flag is read in a layout effect, before the browser paints.
  const [appState, setAppState] = useState<AppState>(AppState.LOADING)
  const siteConfig = useSiteConfig()
  const plainLoader = siteConfig.loadingScreen?.display === "plain"
  const enableDecor = process.env.NEXT_PUBLIC_ENABLE_DECOR !== 'false'
  const [showInvitation, setShowInvitation] = useState(false)
  const [loadingOverlayVisible, setLoadingOverlayVisible] = useState(
    () => appState === AppState.LOADING,
  )
  const [heroEnterFromLoading, setHeroEnterFromLoading] = useState(false)
  const [enteringFromInvite, setEnteringFromInvite] = useState(false)
  // The ~20,000px page below the hero is only built once the guest is in. Kept
  // mounted (invisibly) under the loader and envelope it needed ~1.7GB of layer
  // memory at iPhone resolution and Safari killed the tab (white screen).
  const [sectionsMounted, setSectionsMounted] = useState(false)

  useLayoutEffect(() => {
    if (sessionStorage.getItem("returnFromGallery") !== "true") return
    sessionStorage.removeItem("returnFromGallery")
    setAppState(AppState.DETAILS)
    setLoadingOverlayVisible(false)
  }, [])

  // When returning from /gallery, scroll to the #gallery hash in the URL
  useEffect(() => {
    if (!sectionsMounted) return
    const hash = window.location.hash
    if (!hash) return
    // Sections load as separate chunks — wait (up to ~3s) for the target to exist
    let tries = 0
    const id = setInterval(() => {
      const el = document.querySelector(hash)
      if (el || ++tries > 30) {
        clearInterval(id)
        el?.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
    return () => clearInterval(id)
  }, [sectionsMounted])

  const handleLoadingFadeStart = useCallback(() => {
    setShowInvitation(true)
    setHeroEnterFromLoading(true)
  }, [])

  const handleLoadingComplete = useCallback(() => {
    setAppState(AppState.LANDING)
    setLoadingOverlayVisible(false)
  }, [])

  const handleTransitionStart = useCallback(() => {
    setEnteringFromInvite(true)
    setAppState(AppState.DETAILS)
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [])

  const handleOpenInvitation = useCallback(() => {
    setShowInvitation(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
    window.setTimeout(() => setEnteringFromInvite(false), CINEMATIC_ENTRY_MS)
  }, [])

  const detailsVisible = appState === AppState.DETAILS
  const pageScrollLocked = appState !== AppState.DETAILS
  const cinematicEntry = enteringFromInvite && detailsVisible

  // Coming from the envelope, wait until the hero's entry has mostly played so
  // mounting the sections doesn't stutter it; from /gallery, mount straight away
  useEffect(() => {
    if (!detailsVisible || sectionsMounted) return
    const id = window.setTimeout(() => setSectionsMounted(true), enteringFromInvite ? 1300 : 0)
    return () => window.clearTimeout(id)
  }, [detailsVisible, enteringFromInvite, sectionsMounted])

  useEffect(() => {
    prefetchInvitationData({ sponsorsList, entourage: showEntourage })
  }, [sponsorsList, showEntourage])

  return (
      <div className={`relative min-h-screen bg-[var(--color-bg-ocean-deep)] text-charcoal selection:bg-birch selection:text-nut font-sans ${pageScrollLocked ? "overflow-hidden" : ""}`}>
        {loadingOverlayVisible && !plainLoader && (
          <div
            className="invite-photo-backdrop-wrap invite-photo-backdrop-wrap--loading"
            aria-hidden="true"
          >
            <InvitePhotoBackdrop photos={siteConfig.loadingScreen?.backgroundPhotos} />
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

        <main className="relative w-full h-full">

          <motion.div
            className={detailsVisible ? "" : "pointer-events-none"}
            initial={false}
            variants={detailsShellVariants}
            animate={detailsVisible ? "show" : "hidden"}
          >
            {cinematicEntry && !plainLoader && (
              <motion.div
                className="fixed inset-0 z-[28] pointer-events-none bg-[var(--color-bg-ocean-floor)]"
                aria-hidden="true"
                initial={{ clipPath: "circle(0% at 50% 46%)", opacity: 0.98 }}
                animate={{ clipPath: "circle(145% at 50% 46%)", opacity: 0 }}
                transition={{ duration: 1.55, delay: 0.12, ease: mainEntryEase }}
              />
            )}

            {enableDecor && detailsVisible && (
              <motion.div
                className="fixed inset-0 z-0 pointer-events-none"
                variants={silkBackdropVariants}
                initial={false}
                animate={cinematicEntry ? "show" : detailsVisible ? "show" : "hidden"}
                transition={cinematicEntry ? undefined : { duration: 0.01 }}
              >
                <Suspense
                  fallback={
                    <div className="h-full w-full bg-[var(--color-bg-ocean-deep)]" />
                  }
                >
                  <Silk
                    speed={8}
                    scale={0.9}
                    color={SILK_COLOR}
                    noiseIntensity={0}
                    rotation={0.3}
                  />
                </Suspense>
              </motion.div>
            )}

            <div className="relative z-10">
              {appState === AppState.DETAILS && (
                <motion.div
                  variants={navbarRevealVariants}
                  initial={false}
                  animate={cinematicEntry ? "show" : "show"}
                  transition={cinematicEntry ? undefined : { duration: 0.01 }}
                >
                  <Navbar />
                </motion.div>
              )}
              {/* Spacer so content starts below fixed navbar (h-12 sm:h-14 md:h-16) */}
              {appState === AppState.DETAILS && <div className="h-12 sm:h-14 md:h-16" aria-hidden />}
              <motion.div
                variants={heroRevealVariants}
                initial={false}
                animate={cinematicEntry ? "show" : detailsVisible ? "show" : "hidden"}
                transition={cinematicEntry ? undefined : { duration: 0.01 }}
              >
                <MainHero play={detailsVisible} delay={cinematicEntry ? HERO_ENTRY_DELAY_S : 0.1} />
              </motion.div>
              {sectionsMounted && (
              <motion.div
                variants={sectionsRevealVariants}
                initial={false}
                animate={cinematicEntry ? "show" : detailsVisible ? "show" : "hidden"}
                transition={cinematicEntry ? undefined : { duration: 0.01 }}
              >
               <Welcome />
              {/* <CoupleVideo />  */}
              <LoveStory />
              <Countdown />
              {/* <Gallery /> */}
              {/* <MessageVideo /> */}
              
              <Details />
              <WeddingTimeline />
              {showEntourage && <Entourage sponsorsList={sponsorsList} />}
              <GuestList />
              <BookOfGuests />
              <Messages />
              <FAQ />
              <Registry />
              <WeddingPlaylist /> 
              <SnapShare />
              <SeeYouThere />
              <Footer />
              </motion.div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
  )
}