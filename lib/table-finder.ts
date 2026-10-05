import { canonicalSiteUrl } from "@/content/site"

export const TABLE_FINDER_PATH = "/table"

export function getTableFinderUrl(origin?: string) {
  const base =
    origin ??
    (typeof window !== "undefined"
      ? window.location.origin
      : canonicalSiteUrl)

  return `${base.replace(/\/$/, "")}${TABLE_FINDER_PATH}`
}
