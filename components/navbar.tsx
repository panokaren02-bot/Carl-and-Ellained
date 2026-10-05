"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { useSiteConfig } from "@/hooks/use-site-config"
import Image from "next/image"
import StaggeredMenu from "./StaggeredMenu"
import { Cormorant_Garamond } from "next/font/google"
import { siteConfig } from "@/content/site"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400"],
})

// Palette lives in globals.css → @theme inline → --color-motif-*
// Edit there once to update every component.


const NAV_MONOGRAM = siteConfig.couple.monogram

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#guest-list", label: "RSVP" },
  { href: "#wedding-timeline", label: "Timeline" },
  { href: "#details", label: "Details" },
  { href: "#entourage", label: "Entourage" },
  { href: "#gallery", label: "Gallery" },
  { href: "#messages", label: "Messages" },
  { href: "#faq", label: "FAQ" },
  { href: "#registry", label: "Registry" },
  { href: "#snap-share", label: "Snap Share" },
  { href: "#see-you-there", label: "See You There" },
]

export function Navbar() {
  const siteConfig = useSiteConfig()
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("#home")

  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    const onScroll = () => {
      if (rafIdRef.current != null) return
      rafIdRef.current = window.requestAnimationFrame(() => {
        rafIdRef.current = null
        setIsScrolled(window.scrollY > 50)
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current)
      window.removeEventListener("scroll", onScroll as EventListener)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const sectionIds = navLinks.map(l => l.href.substring(1))
    const elements = sectionIds
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio - a.intersectionRatio))
        if (visible.length > 0) {
          const topMost = visible[0]
          if (topMost.target && topMost.target.id) {
            const newActive = `#${topMost.target.id}`
            setActiveSection(prev => (prev === newActive ? prev : newActive))
          }
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -70% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
      }
    )

    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const menuItems = useMemo(() => navLinks.map((l) => ({ label: l.label, ariaLabel: `Go to ${l.label}`, link: l.href })), [])

  const monogramSrc = siteConfig.couple.monogram || NAV_MONOGRAM

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${
        isScrolled
          ? "shadow-[0_12px_28px_color-mix(in_srgb,var(--color-welcome-navy)_22%,transparent)]"
          : "shadow-[0_6px_16px_color-mix(in_srgb,var(--color-welcome-navy)_12%,transparent)]"
      }`}
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-motif-accent) 88%, white) 0%, var(--color-motif-accent) 42%, var(--color-motif-deep) 100%)",
        borderBottom:
          "1px solid color-mix(in srgb, var(--color-welcome-navy) 28%, transparent)",
      }}
    >
      {isScrolled && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/12 via-transparent to-[color-mix(in_srgb,var(--color-welcome-navy)_10%,transparent)] pointer-events-none" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-white/14 via-transparent to-[color-mix(in_srgb,var(--color-welcome-navy)_14%,transparent)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 relative">
        <div className="flex justify-between items-center h-12 sm:h-14 md:h-16 gap-3">
          <Link
            href="#home"
            className="flex-shrink-0 group relative z-10 flex items-center justify-center py-0 pl-1 pr-2.5 sm:pl-1.5 sm:pr-3 md:pl-2 md:pr-3.5 -ml-0.5 sm:ml-0 self-stretch"
            aria-label={`${siteConfig.couple.groomNickname} & ${siteConfig.couple.brideNickname} — Home`}
          >
            <div className="relative h-[2.5rem] w-[3.2rem] sm:h-[2.85rem] sm:w-[3.65rem] md:h-[3.35rem] md:w-[4.15rem] shrink-0 my-0">
              <Image
                src={monogramSrc}
                alt=""
                fill
                sizes="(max-width: 768px) 51px, 67px"
                priority
                className="object-contain object-center p-0 group-hover:scale-105 group-active:scale-100 transition-transform duration-500 drop-shadow-[0_2px_6px_color-mix(in_srgb,var(--color-welcome-navy)_35%,transparent)]"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[color-mix(in_srgb,var(--color-motif-soft)_18%,transparent)] blur-md -z-10" />
          </Link>

          <div className="hidden xl:flex gap-0.5 items-center">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap px-2 py-2 text-xs lg:px-2.5 lg:text-sm ${cormorant.className} font-medium rounded-lg transition-all duration-500 relative group ${
                    isActive
                      ? "text-[var(--color-motif-deep)] bg-[var(--color-motif-soft)] backdrop-blur-md shadow-[0_6px_16px_color-mix(in_srgb,var(--color-welcome-navy)_14%,transparent)] border border-[color-mix(in_srgb,var(--color-motif-soft)_85%,white)]"
                      : "text-[var(--color-motif-soft)] hover:text-[var(--color-motif-soft)] hover:bg-white/14 hover:border hover:border-[color-mix(in_srgb,var(--color-motif-soft)_40%,transparent)] hover:shadow-[0_6px_14px_color-mix(in_srgb,var(--color-welcome-navy)_12%,transparent)] hover:scale-105 active:scale-95 bg-transparent border border-transparent"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-[var(--color-motif-silver)] transition-all duration-500 rounded-full ${
                      isActive
                        ? "w-full shadow-[0_0_8px_color-mix(in_srgb,var(--color-motif-soft)_65%,transparent)]"
                        : "w-0 group-hover:w-full group-hover:shadow-[0_0_6px_color-mix(in_srgb,var(--color-motif-soft)_50%,transparent)]"
                    }`}
                  />
                  {isActive && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--color-welcome-gold)] animate-pulse shadow-[0_0_6px_color-mix(in_srgb,var(--color-welcome-gold)_55%,transparent)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                </Link>
              )
            })}
          </div>

          <div className="xl:hidden flex items-center justify-end h-full">
            <StaggeredMenu
              position="left"
              items={menuItems}
              socialItems={[]}
              displaySocials={false}
              menuButtonColor="var(--color-motif-soft)"
              openMenuButtonColor="var(--color-motif-deep)"
              changeMenuColorOnOpen={true}
              colors={[
                "var(--color-motif-silver)",
                "var(--color-motif-blush)",
                "var(--color-motif-medium)",
                "var(--color-motif-soft)",
              ]}
              accentColor="var(--color-motif-accent)"
              isFixed={true}
              onMenuOpen={() => {}}
              onMenuClose={() => {}}
            />
          </div>
        </div>

      </div>
    </nav>
  )
}
