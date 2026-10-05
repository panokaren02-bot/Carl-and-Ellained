"use client"

import { useState } from "react"
import {
  MessageSquare,
  Search,
  Heart,
  RefreshCw,
  Clock,
} from "lucide-react"
import { type Message } from "@/app/api/messages/route"

interface GuestMessagesProps {
  messages: Message[]
  onRefresh: () => Promise<void>
  isLoading?: boolean
}

export function GuestMessages({ messages, onRefresh, isLoading = false }: GuestMessagesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(null)
    try {
      await onRefresh()
    } catch {
      setError("Failed to load messages")
    } finally {
      setIsRefreshing(false)
    }
  }

  const filteredMessages = messages.filter((msg) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      msg.name.toLowerCase().includes(query) ||
      msg.message.toLowerCase().includes(query)
    )
  })

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "Recently"
    try {
      const date = new Date(timestamp)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return timestamp
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#111827]">Guest Messages</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm text-[#6B7280]">
            {filteredMessages.length} of {messages.length} messages
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white hover:bg-gray-50 border border-[#E5E7EB] transition-colors disabled:opacity-50"
            title="Refresh messages"
          >
            <RefreshCw className={`h-4 w-4 text-[#6B7280] ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-br from-[#FBFCF7] to-[#F4F5EA] border border-[#E5E7EB] rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4F674D] to-[#304A34] rounded-xl flex items-center justify-center flex-shrink-0">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#304A34] text-lg mb-2">Messages from Your Guests</h3>
            <p className="text-sm text-[#6B7280]">
              Read heartfelt messages and well wishes from your guests. These messages were submitted through your wedding website.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E7EB]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages by guest name or content..."
            className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#718566] focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {(isLoading || isRefreshing) && messages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F9FAFB] rounded-full mb-4">
            <RefreshCw className="h-8 w-8 text-[#6B7280] animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-[#111827] mb-2">Loading Messages...</h3>
          <p className="text-[#6B7280]">Please wait while we fetch your messages.</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F9FAFB] rounded-full mb-4">
            <MessageSquare className="h-8 w-8 text-[#6B7280]" />
          </div>
          <h3 className="text-lg font-semibold text-[#111827] mb-2">No Messages Found</h3>
          <p className="text-[#6B7280]">
            {searchQuery
              ? "No messages match your search query."
              : "No guests have left messages yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredMessages.map((msg, index) => (
            <div
              key={`${msg.timestamp}-${msg.name}-${index}`}
              className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#C3CFB8] to-[#4F674D] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-lg">
                    {msg.name ? msg.name.charAt(0).toUpperCase() : "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-[#111827] mb-1">{msg.name || "Anonymous"}</h3>
                  {msg.timestamp && (
                    <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{formatTimestamp(msg.timestamp)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#FBFCF7] to-[#F4F5EA] rounded-xl p-4 border border-[#E5E7EB]">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <MessageSquare className="h-5 w-5 text-[#718566]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[#304A34] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-[#4F674D] mb-1">
                {messages.length}
              </div>
              <div className="text-sm text-[#6B7280]">Total Messages</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {messages.filter((m) => m.message && m.message.length > 100).length}
              </div>
              <div className="text-sm text-[#6B7280]">Long Messages (100+ chars)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
