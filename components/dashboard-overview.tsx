"use client"

import { Users, Table, Mail, UserPlus, Plane, CheckCircle, XCircle, Crown, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { TableFinderQrCard } from "@/components/table-finder-qr-card"

interface DashboardOverviewProps {
  stats: {
    guestGroups: number
    confirmedPax: number
    pendingRSVP: number
    joinRequests: number
    attending?: number
    notAttending?: number
    entourage?: number
    principalSponsors?: number
  }
  weddingBrief?: {
    title: string
    content: string
  }
}

interface StatCardProps {
  icon: React.ReactNode
  value: number
  label: string
  iconBgColor: string
  iconColor: string
}

function StatCard({ icon, value, label, iconBgColor, iconColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E7EB] hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
            iconBgColor
          )}
        >
          <div className={iconColor}>{icon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#6B7280] font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-[#111827]">{value}</p>
        </div>
      </div>
    </div>
  )
}

export function DashboardOverview({ stats, weddingBrief }: DashboardOverviewProps) {
  const defaultBrief = {
    title: "Gemini's Wedding Brief",
    content: `Here are a few options for a joyful status update: **Option 1: Sweet and simple** "The countdown is officially on! 🔔 We already have ${stats.confirmedPax} of our favorite people confirmed, and we can't wait to hear from the rest of you. We are so excited to see our final group of ${stats.guestGroups} come together for the big day! ❤️ **Option 2: High energy** "RSVPs are rolling in and our hearts are full! ❤️ ${stats.confirmedPax} 'Yes' responses down, ${stats.pendingRSVP} more to hear from! We can't wait to reach our magic number of ${stats.guestGroups} and celebrate the best day ever with you all! 🎉 ✨ **Option 3: Short and punchy** "${stats.confirmedPax} confirmed, ${stats.pendingRSVP} to go! 📝 Watching the guest list grow is getting us so excited for our celebration of ${stats.guestGroups}. Let the wedding countdown begin! 🔔 ✨ **Option 4: Focus on the "Yes"*** "It's getting real! ⭕ We've got ${stats.confirmedPax} 'Yes' votes in the bag and ${stats.pendingRSVP} more pending. We can't wait to see who fills our final ${stats.guestGroups} spots—see you at the altar! 💕 🔔 ""`
  }

  const brief = weddingBrief || defaultBrief

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#111827] mb-2">Wedding Overview</h1>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="h-6 w-6" />}
          value={stats.guestGroups}
          label="Guest Groups"
          iconBgColor="bg-[#C3CFB8]/20"
          iconColor="text-[#4F674D]"
        />
        <StatCard
          icon={<Table className="h-6 w-6" />}
          value={stats.confirmedPax}
          label="Total Guests (Pax)"
          iconBgColor="bg-[#86EFAC]/20"
          iconColor="text-[#16A34A]"
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6" />}
          value={stats.attending || 0}
          label="Attending"
          iconBgColor="bg-[#86EFAC]/20"
          iconColor="text-[#16A34A]"
        />
        <StatCard
          icon={<XCircle className="h-6 w-6" />}
          value={stats.notAttending || 0}
          label="Not Attending"
          iconBgColor="bg-[#FCA5A5]/20"
          iconColor="text-[#DC2626]"
        />
        <StatCard
          icon={<Mail className="h-6 w-6" />}
          value={stats.pendingRSVP}
          label="Pending RSVP"
          iconBgColor="bg-[#FED7AA]/20"
          iconColor="text-[#EA580C]"
        />
        <StatCard
          icon={<UserPlus className="h-6 w-6" />}
          value={stats.joinRequests}
          label="Join Requests"
          iconBgColor="bg-[#DDD6FE]/20"
          iconColor="text-[#7C3AED]"
        />
        <StatCard
          icon={<Crown className="h-6 w-6" />}
          value={stats.entourage || 0}
          label="Entourage"
          iconBgColor="bg-[#FDE68A]/20"
          iconColor="text-[#F59E0B]"
        />
        <StatCard
          icon={<UserCheck className="h-6 w-6" />}
          value={stats.principalSponsors || 0}
          label="Principal Sponsors"
          iconBgColor="bg-[#C7D2FE]/20"
          iconColor="text-[#6366F1]"
        />
      </div>

      <TableFinderQrCard />

      {/* Wedding Brief Card */}
      <div className="bg-gradient-to-br from-[#4F674D] to-[#304A34] rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Plane className="h-6 w-6 text-white" />
          <h2 className="text-2xl font-serif font-bold text-white">{brief.title}</h2>
        </div>
        <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
          {brief.content}
        </div>
      </div>
    </div>
  )
}

