"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Copy,
  ExternalLink,
  Send,
  Check,
  Search,
  Sparkles,
  Heart,
  Link2,
  Crown,
  Users,
} from "lucide-react"
import { useSiteConfig } from "@/hooks/use-site-config"
import {
  PROPOSAL_ROLES,
  PROPOSAL_ENTOURAGE_ROLE_SLOTS,
  PROPOSAL_SPONSOR_ROLE_SLOTS,
  countFilledNamesByProposalRoles,
  getRoleSingular,
} from "@/lib/proposal-roles"
import { buildProposalInviteUrl } from "@/lib/proposal-invite-link"
import {
  ProposalMixedText,
  ProposalMixedTextBlock,
  proposalMixedTextInter,
} from "@/lib/proposal-mixed-text"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const CATEGORY_TABS = ["all", "Entourage", "Principal Sponsor"] as const

interface EntourageRow {
  Name?: string
  RoleCategory?: string
  RoleTitle?: string
  Email?: string
}

interface PrincipalSponsorRow {
  MalePrincipalSponsor?: string
  FemalePrincipalSponsor?: string
}

export function ProposalDashboard() {
  const siteConfig = useSiteConfig()
  const [entourageRows, setEntourageRows] = useState<EntourageRow[]>([])
  const [sponsorRows, setSponsorRows] = useState<PrincipalSponsorRow[]>([])
  const [isCountsLoading, setIsCountsLoading] = useState(true)
  const [copiedRoleId, setCopiedRoleId] = useState<string | null>(null)
  const [categoryTab, setCategoryTab] = useState<(typeof CATEGORY_TABS)[number]>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInviteRole, setSelectedInviteRole] = useState<
    (typeof PROPOSAL_ROLES)[number] | null
  >(null)
  const [inviteeName, setInviteeName] = useState("")
  const [copiedInviteText, setCopiedInviteText] = useState(false)
  const [copiedPersonalLink, setCopiedPersonalLink] = useState(false)
  const [inviteNameError, setInviteNameError] = useState("")

  const getOrigin = () =>
    typeof window !== "undefined" ? window.location.origin : ""

  const getProposalLink = (roleId: string, invitee?: string) => {
    const origin = getOrigin()
    if (origin) {
      return buildProposalInviteUrl(origin, roleId, invitee)
    }
    return `/will-you-be-proposal/${encodeURIComponent(roleId)}`
  }

  const handleCopyLink = (roleId: string) => {
    const link = getProposalLink(roleId)
    navigator.clipboard.writeText(link).then(() => {
      setCopiedRoleId(roleId)
      setTimeout(() => setCopiedRoleId(null), 2500)
    })
  }

  const openInviteModal = (role: (typeof PROPOSAL_ROLES)[number]) => {
    setSelectedInviteRole(role)
    setInviteeName("")
    setCopiedInviteText(false)
  }

  const closeInviteModal = () => {
    setSelectedInviteRole(null)
    setInviteeName("")
    setCopiedInviteText(false)
    setCopiedPersonalLink(false)
    setInviteNameError("")
  }

  const getInviteMessage = () => {
    if (!selectedInviteRole) return ""
    const name = inviteeName.trim()
    const roleSingular = getRoleSingular(selectedInviteRole.title)
    const url = getProposalLink(selectedInviteRole.id, name)
    const groom = siteConfig.couple.groomNickname
    const bride = siteConfig.couple.brideNickname
    const date = siteConfig.wedding.date
    const day = siteConfig.ceremony.day ?? "Saturday"
    const time = siteConfig.ceremony.time ?? siteConfig.wedding.time
    const venue = siteConfig.ceremony.location

    const greeting = name ? `Dear ${name},` : "Hello,"

    return `${greeting}

${groom} & ${bride} have a personal wedding invitation for you.

They would love for you to open your special link, read their message, and confirm whether you can stand with them as their ${roleSingular}.

${date} | ${day} | ${time}
${venue}

Open your invitation:
${url}

With love,
${groom} & ${bride}`
  }

  const handleCopyInviteText = () => {
    if (!inviteeName.trim()) {
      setInviteNameError("Enter the guest's name so the link opens with “Dear (Name)” on the proposal page.")
      return
    }
    setInviteNameError("")
    navigator.clipboard.writeText(getInviteMessage()).then(() => {
      setCopiedInviteText(true)
      setTimeout(() => setCopiedInviteText(false), 2500)
    })
  }

  const handleCopyPersonalLink = () => {
    if (!selectedInviteRole) return
    if (!inviteeName.trim()) {
      setInviteNameError("Enter the guest's name to generate a personalized link.")
      return
    }
    setInviteNameError("")
    const link = getProposalLink(selectedInviteRole.id, inviteeName.trim())
    navigator.clipboard.writeText(link).then(() => {
      setCopiedPersonalLink(true)
      setTimeout(() => setCopiedPersonalLink(false), 2500)
    })
  }

  const fetchSheetCounts = async () => {
    setIsCountsLoading(true)
    try {
      const [entourageRes, sponsorsRes] = await Promise.all([
        fetch("/api/entourage", { cache: "no-store" }),
        fetch("/api/principal-sponsor", { cache: "no-store" }),
      ])

      if (entourageRes.ok) {
        const data = await entourageRes.json()
        setEntourageRows(Array.isArray(data) ? data : [])
      }

      if (sponsorsRes.ok) {
        const data = await sponsorsRes.json()
        setSponsorRows(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching entourage/sponsor counts:", error)
    } finally {
      setIsCountsLoading(false)
    }
  }

  useEffect(() => {
    fetchSheetCounts()

    const handleEntourageUpdate = () => {
      setTimeout(fetchSheetCounts, 1000)
    }

    window.addEventListener("entourageUpdated", handleEntourageUpdate)
    return () => window.removeEventListener("entourageUpdated", handleEntourageUpdate)
  }, [])

  const filteredRoles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return PROPOSAL_ROLES.filter((role) => {
      const matchesCategory = categoryTab === "all" || role.category === categoryTab
      const matchesSearch =
        !query ||
        role.title.toLowerCase().includes(query) ||
        role.category.toLowerCase().includes(query) ||
        role.roleCategory.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [categoryTab, searchQuery])

  const { filledEntourage: filledEntourageCount, filledSponsors: filledSponsorCount } =
    countFilledNamesByProposalRoles(entourageRows, sponsorRows)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-[#FBFCF7] via-white to-[#F9FAFB] p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#718566]/15 text-[#4F674D]">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#111827]">Special Proposal Invitations</h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#6B7280]">
                Enter each guest&apos;s name, copy their personal link, and send it by text or
                messenger. They&apos;ll see &ldquo;Dear (Name)&rdquo; and the role you&apos;re
                offering — they only need to confirm yes or no. Accepted names fill the next open
                slot in Google Sheets for that role.
              </p>
            </div>
          </div>
          <Link
            href="/"
            target="_blank"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#304A34] shadow-sm transition-colors hover:bg-[#FBFCF7]"
          >
            <ExternalLink className="h-4 w-4" />
            Preview Site
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#6B7280]">
            <Users className="h-3.5 w-3.5 text-[#718566]" />
            <span>
              <strong className="text-[#304A34]">
                {isCountsLoading ? "…" : filledEntourageCount}
              </strong>{" "}
              names · {PROPOSAL_ENTOURAGE_ROLE_SLOTS} entourage roles
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#6B7280]">
            <Crown className="h-3.5 w-3.5 text-[#718566]" />
            <span>
              <strong className="text-[#304A34]">
                {isCountsLoading ? "…" : filledSponsorCount}
              </strong>{" "}
              names · {PROPOSAL_SPONSOR_ROLE_SLOTS} sponsor roles
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#6B7280]">
            <Link2 className="h-3.5 w-3.5 text-[#718566]" />
            <span>
              <strong className="text-[#304A34]">{PROPOSAL_ROLES.length}</strong> proposal links
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-dashed border-[#E5E7EB] bg-white/80 px-3 py-1.5 text-[10px] text-[#9CA3AF]">
            Live from Google Sheets
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setCategoryTab(tab)}
              className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-all ${
                categoryTab === tab
                  ? "border-[#718566] bg-[#718566] text-white shadow-sm"
                  : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#C3CFB8] hover:text-[#304A34]"
              }`}
            >
              {tab === "all" ? "All Roles" : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-3 left-3 h-4 w-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pr-4 pl-10 text-sm shadow-sm focus:ring-2 focus:ring-[#718566]/30 focus:outline-none"
          />
        </div>
      </div>

      {/* Role cards */}
      {filteredRoles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] py-16 text-center">
          <Search className="mx-auto mb-3 h-10 w-10 text-[#D1D5DB]" />
          <p className="font-medium text-[#6B7280]">No roles match your search</p>
          <p className="mt-1 text-sm text-[#9CA3AF]">Try a different filter or search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRoles.map((role) => {
            const isCopied = copiedRoleId === role.id
            const link = getProposalLink(role.id)

            return (
              <div
                key={role.id}
                className="group flex flex-col rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm transition-all hover:border-[#C3CFB8]/60 hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-base font-semibold text-[#111827]">{role.title}</h4>
                    <p className="mt-0.5 text-xs text-[#9CA3AF]">{role.roleCategory}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#E5E7EB] bg-[#FBFCF7] px-2 py-0.5 text-[9px] font-bold tracking-widest text-[#4F674D] uppercase">
                    {role.category}
                  </span>
                </div>

                <p className="mb-4 line-clamp-2 flex-1 text-xs leading-relaxed text-[#6B7280]">
                  {role.description}
                </p>

                <div className="mb-4 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB] px-3 py-2">
                  <p className="truncate font-mono text-[10px] text-[#9CA3AF]">{link}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(role.id)}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all ${
                      isCopied
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-[#E5E7EB] bg-white text-[#304A34] hover:bg-[#FBFCF7]"
                    }`}
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {isCopied ? "Copied!" : "Copy Link"}
                  </button>

                  <button
                    onClick={() => openInviteModal(role)}
                    className="cursor-pointer rounded-lg border border-[#718566]/30 bg-[#FBFCF7] px-3 py-2.5 text-xs font-semibold text-[#4F674D] transition-all hover:border-[#718566] hover:bg-[#718566] hover:text-white"
                    title="Create personalized invitation"
                  >
                    <Send className="h-4 w-4 inline sm:mr-1" />
                    <span className="hidden sm:inline">Personalize</span>
                  </button>

                  <Link
                    href={`/will-you-be-proposal/${role.id}`}
                    target="_blank"
                    className="rounded-lg border border-[#E5E7EB] bg-white p-2.5 text-[#6B7280] transition-all hover:bg-[#F9FAFB] hover:text-[#304A34]"
                    title="Open proposal page"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Invite Helper Modal */}
      <Dialog
        open={!!selectedInviteRole}
        onOpenChange={(open) => {
          if (!open) closeInviteModal()
        }}
      >
        <DialogContent className="flex w-full max-w-lg flex-col gap-0 overflow-hidden border-[#E5E7EB] bg-white p-0 sm:max-w-xl">
          <div className="border-b border-[#F3F4F6] bg-gradient-to-r from-[#FBFCF7] to-white px-6 py-5 pr-12">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="flex items-center gap-2 text-[#304A34]">
                <Sparkles className="h-5 w-5 text-[#718566]" />
                Personal Special Invitation
              </DialogTitle>
              <DialogDescription className="text-sm text-[#6B7280]">
                {selectedInviteRole
                  ? `Role offered: ${selectedInviteRole.title}. The guest’s name appears on their proposal page — they only confirm yes or no.`
                  : "Create a personalized proposal link"}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-w-0 space-y-4 px-6 py-5">
            {selectedInviteRole && (
              <div className="rounded-xl border border-[#E5E7EB] bg-[#FBFCF7] px-4 py-3">
                <p className="text-[10px] font-bold tracking-widest text-[#4F674D] uppercase">
                  Role offer
                </p>
                <p className={`${proposalMixedTextInter.className} mt-1 text-base font-semibold text-[#111827]`}>
                  <ProposalMixedText text={selectedInviteRole.title} />
                </p>
                <p className="mt-0.5 text-xs text-[#6B7280]">{selectedInviteRole.category}</p>
              </div>
            )}

            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-[#6B7280] uppercase">
                Guest name <span className="text-[#718566]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Maria Clara Santos"
                value={inviteeName}
                onChange={(e) => {
                  setInviteeName(e.target.value)
                  if (e.target.value.trim()) setInviteNameError("")
                }}
                className={`${proposalMixedTextInter.className} box-border w-full min-w-0 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-normal not-italic focus:ring-2 focus:ring-[#718566]/30 focus:outline-none`}
              />
              <p className={`${proposalMixedTextInter.className} mt-1.5 text-xs font-normal text-[#9CA3AF]`}>
                Shown on the proposal as &ldquo;
                {selectedInviteRole &&
                (selectedInviteRole.id === "flower-girl" ||
                  [
                    "ring-bearer",
                    "coin-bearer",
                    "bible-bearer",
                    "herald-bearer",
                  ].includes(selectedInviteRole.id))
                  ? "Hi "
                  : "Dear "}
                <ProposalMixedText
                  text={inviteeName.trim() || "Name"}
                  specialClassName={`${proposalMixedTextInter.className} inline align-baseline text-[1em] font-normal not-italic`}
                />
                &rdquo;
              </p>
              {inviteNameError && (
                <p className="mt-2 text-xs font-medium text-rose-600">{inviteNameError}</p>
              )}
            </div>

            <div className="min-w-0">
              <label className="mb-1.5 block text-xs font-semibold tracking-wider text-[#6B7280] uppercase">
                Message preview
              </label>
              <ProposalMixedTextBlock
                text={getInviteMessage()}
                className={`${proposalMixedTextInter.className} box-border max-h-52 min-h-[10rem] w-full min-w-0 overflow-y-auto overflow-x-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-sm font-normal leading-relaxed break-words text-[#374151]`}
                lineClassName="min-h-[1.35em]"
              />
            </div>

            {selectedInviteRole && (
              <div className="min-w-0 rounded-xl border border-[#E5E7EB] bg-[#FBFCF7] px-4 py-3">
                <p className="text-[10px] font-semibold tracking-wider text-[#4F674D] uppercase">
                  Personal proposal link
                </p>
                <p className="mt-1 break-all font-mono text-xs text-[#6B7280]">
                  {getProposalLink(selectedInviteRole.id, inviteeName.trim() || undefined)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 flex-col gap-2 border-t border-[#F3F4F6] bg-[#F9FAFB] px-6 py-4 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={closeInviteModal}
              className="cursor-pointer rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold tracking-wide text-[#6B7280] uppercase hover:text-[#304A34]"
            >
              Cancel
            </button>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleCopyPersonalLink}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#718566]/40 bg-white px-4 py-2.5 text-xs font-semibold tracking-wide text-[#304A34] uppercase transition-all hover:bg-[#FBFCF7]"
              >
                {copiedPersonalLink ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Link2 className="h-3.5 w-3.5" />
                )}
                {copiedPersonalLink ? "Link copied!" : "Copy link"}
              </button>
              <button
                type="button"
                onClick={handleCopyInviteText}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#718566] bg-[#718566] px-5 py-2.5 text-xs font-semibold tracking-wide text-white uppercase transition-all hover:bg-[#4F674D]"
              >
                {copiedInviteText ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copiedInviteText ? "Copied!" : "Copy full message"}
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-xs leading-relaxed text-[#9CA3AF]">
        Confirmed responses fill the bottom-most empty row in{" "}
        <span className="font-mono text-[#6B7280]">googleAPI.entourage</span> or{" "}
        <span className="font-mono text-[#6B7280]">googleAPI.sponsors</span> for the matching role
        (Name + RoleCategory). Redeploy the Apps Script after updating{" "}
        <span className="font-mono text-[#6B7280]">entourage-management.js</span> and{" "}
        <span className="font-mono text-[#6B7280]">principal-sponsor-management.js</span>.
      </p>
    </div>
  )
}
