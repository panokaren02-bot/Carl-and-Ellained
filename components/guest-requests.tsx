"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Search,
  AlertCircle,
  X,
  UserPlus,
  Phone,
  Mail,
  Users,
} from "lucide-react"

interface GuestRequest {
  Name: string
  Email: string
  Phone: string
  RSVP: string
  Guest: string
  Message: string
}

interface GuestRequestsProps {
  requests: GuestRequest[]
  onRefresh: () => void
  onApproveRequest: (request: GuestRequest) => void
  isLoading: boolean
}

export function GuestRequests({ requests, onRefresh, onApproveRequest, isLoading }: GuestRequestsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingRequest, setEditingRequest] = useState<GuestRequest | null>(null)
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Phone: "",
    RSVP: "",
    Guest: "",
    Message: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const filteredRequests = requests.filter((request) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      request.Name.toLowerCase().includes(query) ||
      (request.Email && request.Email.toLowerCase().includes(query)) ||
      (request.Phone && request.Phone.toLowerCase().includes(query))
    )
  })

  const handleEditClick = (request: GuestRequest) => {
    setEditingRequest(request)
    setFormData({
      Name: request.Name,
      Email: request.Email && request.Email !== "Pending" ? request.Email : "",
      Phone: request.Phone || "",
      RSVP: request.RSVP || "",
      Guest: request.Guest || "1",
      Message: request.Message || "",
    })
  }

  const handleUpdateRequest = async () => {
    if (!editingRequest || !formData.Name) {
      setError("Name is required")
      setTimeout(() => setError(null), 3000)
      return
    }

    try {
      const response = await fetch("/api/guest-requests", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Name: formData.Name,
          Email: formData.Email,
          Phone: formData.Phone,
          RSVP: formData.RSVP,
          Guest: formData.Guest,
          Message: formData.Message,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update request")
      }

      setSuccessMessage("Request updated successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
      setEditingRequest(null)
      setFormData({ Name: "", Email: "", Phone: "", RSVP: "", Guest: "", Message: "" })
      onRefresh()
    } catch (error) {
      console.error("Error updating request:", error)
      setError("Failed to update request")
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleDeleteRequest = async (requestName: string) => {
    if (!confirm(`Are you sure you want to delete this request from ${requestName}?`)) {
      return
    }

    try {
      const response = await fetch("/api/guest-requests", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Name: requestName }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete request")
      }

      setSuccessMessage("Request deleted successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
      onRefresh()
    } catch (error) {
      console.error("Error deleting request:", error)
      setError("Failed to delete request")
      setTimeout(() => setError(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#111827]">Guest Join Requests</h2>
        <div className="text-sm text-[#6B7280]">
          {filteredRequests.length} of {requests.length} requests
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <UserPlus className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-purple-900 mb-1">Join Requests</h3>
            <p className="text-sm text-purple-700">
              These are guests who have requested to join your wedding. Review and approve them to add to your guest list, or edit/delete as needed.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E7EB]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search requests by name, email or phone..."
            className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#718566] focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Requests Grid/Table */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F9FAFB] rounded-full mb-4">
            <UserPlus className="h-8 w-8 text-[#6B7280]" />
          </div>
          <h3 className="text-lg font-semibold text-[#111827] mb-2">No Join Requests</h3>
          <p className="text-[#6B7280]">
            {isLoading ? "Loading requests..." : "You don't have any pending join requests at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((request, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Left: Main Info */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#111827] mb-2">{request.Name}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-[#6B7280]">
                      {request.Email && request.Email !== "Pending" && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-4 w-4" />
                          <span>{request.Email}</span>
                        </div>
                      )}
                      {request.Phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-4 w-4" />
                          <span>{request.Phone}</span>
                        </div>
                      )}
                      {request.Guest && (
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4" />
                          <span>{parseInt(request.Guest) || 1} guest(s)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {request.Message && (
                    <div className="bg-[#F9FAFB] rounded-lg p-3 border border-[#E5E7EB]">
                      <p className="text-sm text-[#6B7280] italic">"{request.Message}"</p>
                    </div>
                  )}

                  {request.RSVP && (
                    <div>
                      {request.RSVP === "Yes" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                          <CheckCircle className="h-4 w-4" />
                          Will Attend
                        </span>
                      )}
                      {request.RSVP === "No" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200">
                          <XCircle className="h-4 w-4" />
                          Won't Attend
                        </span>
                      )}
                      {request.RSVP === "Maybe" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium border border-yellow-200">
                          <AlertCircle className="h-4 w-4" />
                          Maybe
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex lg:flex-col gap-2">
                  <Button
                    onClick={() => onApproveRequest(request)}
                    className="flex-1 lg:flex-none bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <button
                    onClick={() => handleEditClick(request)}
                    className="flex-1 lg:flex-none px-4 py-2 text-sm font-medium text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#304A34] rounded-lg transition-colors border border-[#E5E7EB]"
                    title="Edit request"
                  >
                    <Edit2 className="h-4 w-4 mx-auto lg:mr-2" />
                    <span className="hidden lg:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteRequest(request.Name)}
                    className="flex-1 lg:flex-none px-4 py-2 text-sm font-medium text-[#6B7280] hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-[#E5E7EB]"
                    title="Delete request"
                  >
                    <Trash2 className="h-4 w-4 mx-auto lg:mr-2" />
                    <span className="hidden lg:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Request Modal */}
      {editingRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#111827]">Edit Join Request</h3>
              <button
                onClick={() => {
                  setEditingRequest(null)
                  setFormData({ Name: "", Email: "", Phone: "", RSVP: "", Guest: "", Message: "" })
                }}
                className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-[#6B7280]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#718566] focus:border-transparent outline-none"
                  placeholder="Enter name"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Email</label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#718566] focus:border-transparent outline-none"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.Phone}
                  onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#718566] focus:border-transparent outline-none"
                  placeholder="Enter phone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">RSVP Status</label>
                <select
                  value={formData.RSVP}
                  onChange={(e) => setFormData({ ...formData, RSVP: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#718566] focus:border-transparent outline-none"
                >
                  <option value="">Pending</option>
                  <option value="Yes">Will Attend</option>
                  <option value="No">Won't Attend</option>
                  <option value="Maybe">Maybe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Number of Guests</label>
                <input
                  type="number"
                  min="1"
                  value={formData.Guest}
                  onChange={(e) => setFormData({ ...formData, Guest: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#718566] focus:border-transparent outline-none"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Message</label>
                <textarea
                  value={formData.Message}
                  onChange={(e) => setFormData({ ...formData, Message: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#718566] focus:border-transparent outline-none"
                  placeholder="Enter message"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setEditingRequest(null)
                  setFormData({ Name: "", Email: "", Phone: "", RSVP: "", Guest: "", Message: "" })
                }}
                variant="outline"
                className="flex-1 border-[#E5E7EB] text-[#6B7280]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateRequest}
                className="flex-1 bg-gradient-to-r from-[#4F674D] to-[#304A34] hover:from-[#304A34] hover:to-[#4F674D] text-white"
              >
                Update Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


