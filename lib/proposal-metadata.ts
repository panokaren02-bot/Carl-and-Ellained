import type { Metadata } from "next"
import { siteConfig, canonicalSiteUrl } from "@/content/site"

const canonicalBase = canonicalSiteUrl

export const PROPOSAL_OG_IMAGE_PATH = siteConfig.linkPreviewImage
export const PROPOSAL_OG_IMAGE_URL = `${canonicalBase}${PROPOSAL_OG_IMAGE_PATH}`

const coupleNames = `${siteConfig.couple.groomNickname} & ${siteConfig.couple.brideNickname}`

export function buildProposalMetadata(options?: {
  roleTitle?: string
  path?: string
}): Metadata {
  const roleTitle = options?.roleTitle
  const path = options?.path ?? "/will-you-be-proposal"
  const url = `${canonicalBase}${path}`

  const title = roleTitle
    ? `Will You Be Our ${roleTitle}?`
    : "Will You Be Part of Our Wedding?"

  const description = roleTitle
    ? `${coupleNames} lovingly invite you to be their ${roleTitle}. Open this special proposal and share your heartfelt response.`
    : `${coupleNames} have a special wedding proposal for you. Open your link to view the invitation and respond.`

  const ogTitle = `${title} | ${coupleNames}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: `${coupleNames} Wedding`,
      locale: "en_PH",
      type: "website",
      images: [
        {
          url: PROPOSAL_OG_IMAGE_URL,
          secureUrl: PROPOSAL_OG_IMAGE_URL,
          width: 1200,
          height: 630,
          type: "image/jpeg",
          alt: roleTitle
            ? `Will you be our ${roleTitle}? — ${coupleNames} Wedding Proposal`
            : `${coupleNames} Wedding Proposal`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [PROPOSAL_OG_IMAGE_URL],
    },
  }
}
