"use client"

import { InvitationPage } from "@/components/invitation-page"

// Full invitation without the entourage section
export default function InviteGuestPage() {
  return <InvitationPage showEntourage={false} />
}
