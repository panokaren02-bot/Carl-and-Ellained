"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Download } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { Cinzel } from "next/font/google"
import localFont from "next/font/local"
import { useSiteConfig } from "@/hooks/use-site-config"
import { getTableFinderUrl, TABLE_FINDER_PATH } from "@/lib/table-finder"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const theSeasons = localFont({
  src: "../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
})

const aboveTheBeyond = localFont({
  src: "../Font/above-the-beyond-script.otf",
  display: "swap",
})

const IVORY = "var(--color-motif-soft)"
const GOLD = "var(--color-welcome-gold)"
const NAVY = "var(--color-welcome-navy)"
const SCRIPT = "var(--color-welcome-green)"
const BODY = "var(--color-welcome-text)"
const NAV_GOLD = "linear-gradient(180deg, var(--color-motif-accent) 0%, var(--color-motif-deep) 55%, var(--color-welcome-navy) 100%)"
const GOLD_BORDER = "color-mix(in srgb, var(--color-welcome-gold) 38%, transparent)"
const QR_FG = "#304A34" // --color-welcome-navy
const PRINT_QR_ID = "table-finder-qr-print"
const DISPLAY_QR_ID = "table-finder-qr"

export function TableFinderQrCard() {
  const siteConfig = useSiteConfig()
  const [tableUrl, setTableUrl] = useState("")

  const groomName = siteConfig.couple.groomNickname || siteConfig.couple.groom
  const brideName = siteConfig.couple.brideNickname || siteConfig.couple.bride
  const coupleLine = `${groomName} & ${brideName}`
  const fileSlug = `${groomName}-${brideName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  useEffect(() => {
    setTableUrl(getTableFinderUrl())
  }, [])

  const downloadQr = () => {
    const canvas =
      (document.getElementById(PRINT_QR_ID) as HTMLCanvasElement | null) ??
      (document.getElementById(DISPLAY_QR_ID) as HTMLCanvasElement | null)
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `${fileSlug || "wedding"}-find-your-table-qr.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5 sm:p-8"
      style={{
        background: IVORY,
        borderColor: GOLD_BORDER,
        boxShadow:
          "0 10px 28px color-mix(in srgb, var(--color-welcome-gold) 12%, transparent), inset 0 1px 0 rgb(255 255 255 / 80%)",
      }}
    >
      <div className="wedding-frame-inner hidden min-[400px]:block" aria-hidden />
      <div className="relative grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-8">
        <div className="mx-auto flex max-w-[240px] flex-col items-center">
          <div
            className="relative rounded-2xl border p-3 sm:p-4"
            style={{
              backgroundColor: IVORY,
              borderColor: GOLD_BORDER,
              boxShadow: "0 8px 24px color-mix(in srgb, var(--color-welcome-gold) 12%, transparent)",
            }}
          >
            <span className="absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 sm:left-2.5 sm:top-2.5" style={{ borderColor: GOLD }} aria-hidden />
            <span className="absolute right-2 top-2 h-3 w-3 border-r-2 border-t-2 sm:right-2.5 sm:top-2.5" style={{ borderColor: GOLD }} aria-hidden />
            <span className="absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 sm:bottom-2.5 sm:left-2.5" style={{ borderColor: GOLD }} aria-hidden />
            <span className="absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 sm:bottom-2.5 sm:right-2.5" style={{ borderColor: GOLD }} aria-hidden />
            {tableUrl ? (
              <QRCodeCanvas
                id={DISPLAY_QR_ID}
                value={tableUrl}
                size={196}
                level="H"
                includeMargin={false}
                fgColor={QR_FG}
                bgColor={IVORY}
                className="h-auto w-full max-w-[196px]"
              />
            ) : (
              <div className="h-[196px] w-[196px] animate-pulse rounded-md" style={{ backgroundColor: "color-mix(in srgb, var(--color-motif-silver) 28%, white)" }} />
            )}
          </div>
          <p
            className={`${cinzel.className} mt-3 text-center text-[0.6rem] font-semibold uppercase tracking-[0.18em]`}
            style={{ color: GOLD }}
          >
            Scan to find your table
          </p>
        </div>

        <div className="text-center sm:text-left">
          <p
            className={`${cinzel.className} text-[0.7rem] font-semibold uppercase tracking-[0.22em]`}
            style={{ color: GOLD }}
          >
            {coupleLine}
          </p>
          <h2
            className={`${theSeasons.className} mt-2 text-[1.85rem] leading-none tracking-[0.04em] sm:text-[2.35rem]`}
            style={{ color: NAVY }}
          >
            Find Your Table
          </h2>
          <p
            className={`${aboveTheBeyond.className} mt-1`}
            style={{ color: SCRIPT, fontSize: "clamp(1.1rem, 2.4vw, 1.65rem)" }}
          >
            Please be seated
          </p>
          <p className="font-goudy-italic mx-auto mt-3 max-w-md text-[0.95rem] leading-relaxed sm:mx-0" style={{ color: BODY }}>
            Place this code at the entrance. Guests scan it, search their name, and go straight to their table.
          </p>

          <div className="mt-5 flex flex-col items-center gap-3 sm:items-start">
            <button
              type="button"
              onClick={downloadQr}
              disabled={!tableUrl}
              className={`${cinzel.className} inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-6 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50`}
              style={{
                background: NAV_GOLD,
                borderColor: GOLD_BORDER,
                color: IVORY,
                boxShadow: "0 8px 18px color-mix(in srgb, var(--color-welcome-gold) 22%, transparent)",
              }}
            >
              <Download className="h-3.5 w-3.5" />
              Download QR
            </button>
            <p className="font-goudy-italic text-[0.8rem]" style={{ color: BODY }}>
              Saves a print-ready PNG for signs and table cards.
            </p>
            <Link
              href={TABLE_FINDER_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className={`${cinzel.className} text-[0.625rem] font-semibold uppercase tracking-[0.16em] underline-offset-4 hover:underline`}
              style={{ color: GOLD }}
            >
              Preview seating page
            </Link>
          </div>
        </div>
      </div>

      {tableUrl ? (
        <div className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0" aria-hidden>
          <QRCodeCanvas
            id={PRINT_QR_ID}
            value={tableUrl}
            size={1024}
            level="H"
            includeMargin
            fgColor={QR_FG}
            bgColor="#ffffff"
          />
        </div>
      ) : null}
    </div>
  )
}
