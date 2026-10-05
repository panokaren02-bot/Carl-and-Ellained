import { siteConfig } from "@/content/site"
import {
  coastalLightBg,
  coastalPalette,
  coastalTitleShadow,
  displayScript,
} from "@/lib/coastal-palette"

const CORNER_DECO_CLASS =
  "block h-auto w-auto max-w-[165px] sm:max-w-[245px] md:max-w-[350px] lg:max-w-[425px] xl:max-w-[500px] select-none pointer-events-none"

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden border-t pt-8 pb-8 sm:pt-10 sm:pb-10"
      style={{
        backgroundColor: coastalLightBg,
        borderColor: `color-mix(in srgb, ${coastalPalette.blueGray} 35%, white)`,
      }}
    >
      <div className="pointer-events-none absolute left-0 top-0 z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/deco/left-top-deco.webp" alt="" aria-hidden="true" className={CORNER_DECO_CLASS} />
      </div>
      <div className="pointer-events-none absolute right-0 top-0 z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/deco/right-top-deco.webp" alt="" aria-hidden="true" className={CORNER_DECO_CLASS} />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/deco/left-bottom-deco.webp" alt="" aria-hidden="true" className={CORNER_DECO_CLASS} />
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0 z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/deco/right-bottom-deco.webp" alt="" aria-hidden="true" className={CORNER_DECO_CLASS} />
      </div>
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center mb-8 sm:mb-10">
          <p
            className="text-[11px] sm:text-xs uppercase tracking-[0.2em] mb-2 font-semibold"
            style={{ color: coastalPalette.dustyRose }}
          >
            With Love
          </p>
          <h3
            className="whitespace-nowrap leading-[1.08]"
            style={{
              ...displayScript,
              fontSize: "clamp(1.5rem, 4vw + 0.5rem, 2.5rem)",
              color: coastalPalette.title,
              textShadow: coastalTitleShadow,
            }}
          >
            {siteConfig.couple.bride} & {siteConfig.couple.groom}
          </h3>
          <p className="text-sm mt-2" style={{ color: coastalPalette.body }}>
            {siteConfig.wedding.date}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4
              className="font-semibold mb-2 tracking-[0.16em] uppercase text-xs"
              style={{ color: coastalPalette.deep }}
            >
              Ceremony
            </h4>
            <p className="text-sm" style={{ color: coastalPalette.body }}>
              {siteConfig.ceremony.location}
            </p>
          </div>
          <div>
            <h4
              className="font-semibold mb-2 tracking-[0.16em] uppercase text-xs"
              style={{ color: coastalPalette.deep }}
            >
              Reception
            </h4>
            <p className="text-sm" style={{ color: coastalPalette.body }}>
              {siteConfig.reception.location}
            </p>
          </div>
          <div>
            <h4
              className="font-semibold mb-2 tracking-[0.16em] uppercase text-xs"
              style={{ color: coastalPalette.deep }}
            >
              Celebrate With Us
            </h4>
            <p className="text-sm" style={{ color: coastalPalette.body }}>
              {siteConfig.ceremony.venue}
            </p>
          </div>
        </div>

        <div
          className="mt-8 pt-8 text-center text-sm border-t"
          style={{
            borderColor: `color-mix(in srgb, ${coastalPalette.blueGray} 35%, white)`,
            color: coastalPalette.dustyRose,
          }}
        >
          <p>With love and gratitude • {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  )
}
