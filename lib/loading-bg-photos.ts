import { siteConfig } from "@/content/site";

/** Mobile invitation photo marquee — `public/mobile-background` */
export const MOBILE_BACKGROUND_PHOTO_COUNT = 10;

export const MOBILE_BACKGROUND_PHOTOS = Array.from(
  { length: MOBILE_BACKGROUND_PHOTO_COUNT },
  (_, index) => encodeURI(`/mobile-background/couple (${index + 1}).webp`),
);

/**
 * Loader background photos for preloading — set in content/site.ts (loadingScreen.backgroundPhotos).
 * Empty in "plain" display so nothing is downloaded.
 */
export const LOADING_BG_PHOTOS =
  siteConfig.loadingScreen.display === "plain"
    ? []
    : (siteConfig.loadingScreen.backgroundPhotos ?? []).map((src) => encodeURI(src));
