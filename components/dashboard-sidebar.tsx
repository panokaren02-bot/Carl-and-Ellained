"use client"

import {
  Users,
  MessageSquare,
  Crown,
  LayoutDashboard,
  RefreshCw,
  ExternalLink,
  UserPlus,
  Heart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSiteConfig } from "@/hooks/use-site-config"

interface DashboardSidebarProps {
  activeTab: "dashboard" | "guests" | "requests" | "messages" | "entourage" | "proposals"
  onTabChange: (tab: "dashboard" | "guests" | "requests" | "messages" | "entourage" | "proposals") => void
  guestRequestCount: number
  messageCount: number
}

export function DashboardSidebar({
  activeTab,
  onTabChange,
  guestRequestCount,
  messageCount,
}: DashboardSidebarProps) {
  const siteConfig = useSiteConfig()
  const navItems = [
    {
      id: "dashboard" as const,
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "guests" as const,
      label: "Guest List",
      icon: Users,
      badge: null,
    },
    {
      id: "requests" as const,
      label: "Join Requests",
      icon: UserPlus,
      badge: guestRequestCount,
    },
    {
      id: "messages" as const,
      label: "Guest Messages",
      icon: MessageSquare,
      badge: messageCount,
    },
    {
      id: "entourage" as const,
      label: "Entourage & Sponsors",
      icon: Crown,
      badge: null,
    },
    {
      id: "proposals" as const,
      label: "Proposal Invites",
      icon: Heart,
      badge: null,
    },
  ]

  return (
    <div className="w-64 bg-white border-r border-[#E5E7EB] h-screen sticky top-0 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-[#718566] rounded-lg flex items-center justify-center">
            <span className="text-white font-serif text-lg">♥</span>
          </div>
          <span className="font-serif text-lg font-bold text-[#304A34]">Wedding Invitation</span>
        </div>
        <p className="text-xs text-[#6B7280] uppercase tracking-wide">Dashboard Panel</p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-[#FBFCF7] text-[#304A34] shadow-sm"
                  : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#304A34]"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-[#718566]" : "text-[#9CA3AF] group-hover:text-[#718566]")} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== null && item.badge > 0 && (
                <span className={cn(
                  "px-2 py-0.5 text-xs font-bold rounded-full min-w-[20px] text-center",
                  item.id === "requests" ? "bg-[#EDE9FE] text-[#6B21A8]" : "bg-[#FEF3C7] text-[#92400E]"
                )}>
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Sync Button */}
      <div className="p-4 border-t border-[#E5E7EB]">
        <a
          href={siteConfig.googleAPI.googleShare}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-[#6B7280] hover:text-[#304A34] hover:bg-[#F9FAFB] border border-[#E5E7EB] transition-all duration-200 justify-start"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Sync Spreadsheet</span>
          <ExternalLink className="h-3 w-3 ml-auto" />
        </a>
      </div>
    </div>
  )
}

