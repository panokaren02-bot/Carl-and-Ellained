"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Crown,
  UserCheck,
  Edit2,
  Trash2,
  Search,
  Plus,
  AlertCircle,
  X,
  CheckCircle,
} from "lucide-react"

interface Entourage {
  Name: string
  RoleCategory: string
  RoleTitle: string
  Email: string
}

interface PrincipalSponsor {
  MalePrincipalSponsor: string
  FemalePrincipalSponsor: string
}

interface EntourageSponsorsProps {
  entourage: Entourage[]
  principalSponsors: PrincipalSponsor[]
  onRefreshEntourage: () => void
  onRefreshSponsors: () => void
  isLoading: boolean
}

export function EntourageSponsors({
  entourage,
  principalSponsors,
  onRefreshEntourage,
  onRefreshSponsors,
  isLoading,
}: EntourageSponsorsProps) {
  const [activeSubTab, setActiveSubTab] = useState<"entourage" | "sponsors">("entourage")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Entourage state
  const [showEntourageModal, setShowEntourageModal] = useState(false)
  const [editingEntourage, setEditingEntourage] = useState<Entourage | null>(null)
  const [entourageFormData, setEntourageFormData] = useState({
    Name: "",
    RoleCategory: "",
    RoleTitle: "",
    Email: "",
  })

  // Principal Sponsor state
  const [showSponsorModal, setShowSponsorModal] = useState(false)
  const [editingSponsor, setEditingSponsor] = useState<PrincipalSponsor | null>(null)
  const [sponsorFormData, setSponsorFormData] = useState({
    MalePrincipalSponsor: "",
    FemalePrincipalSponsor: "",
  })

  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingAction, setProcessingAction] = useState<string>("")

  // Filter entourage
  const filteredEntourage = entourage.filter((member) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      member.Name.toLowerCase().includes(query) ||
      member.RoleTitle.toLowerCase().includes(query) ||
      member.RoleCategory.toLowerCase().includes(query) ||
      (member.Email && member.Email.toLowerCase().includes(query))
    )
  })

  // Filter sponsors
  const filteredSponsors = principalSponsors.filter((sponsor) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      sponsor.MalePrincipalSponsor.toLowerCase().includes(query) ||
      sponsor.FemalePrincipalSponsor.toLowerCase().includes(query)
    )
  })

  // Entourage handlers
  const handleAddEntourage = async () => {
    if (!entourageFormData.Name) {
      setError("Name is required")
      setTimeout(() => setError(null), 3000)
      return
    }

    setIsProcessing(true)
    setProcessingAction("Adding entourage member")

    try {
      const response = await fetch("/api/entourage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entourageFormData),
      })

      if (!response.ok) {
        throw new Error("Failed to add entourage member")
      }

      setIsProcessing(false)
      setSuccessMessage("Entourage member added successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
      setShowEntourageModal(false)
      setEntourageFormData({ Name: "", RoleCategory: "", RoleTitle: "", Email: "" })
      onRefreshEntourage()
      window.dispatchEvent(new Event("entourageUpdated"))
    } catch (error) {
      console.error("Error adding entourage member:", error)
      setIsProcessing(false)
      setError("Failed to add entourage member")
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleUpdateEntourage = async () => {
    if (!editingEntourage || !entourageFormData.Name) {
      setError("Name is required")
      setTimeout(() => setError(null), 3000)
      return
    }

    setIsProcessing(true)
    setProcessingAction("Updating entourage member")

    try {
      const response = await fetch("/api/entourage", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          originalName: editingEntourage.Name,
          ...entourageFormData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update entourage member")
      }

      setIsProcessing(false)
      setSuccessMessage("Entourage member updated successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
      setEditingEntourage(null)
      setEntourageFormData({ Name: "", RoleCategory: "", RoleTitle: "", Email: "" })
      onRefreshEntourage()
      window.dispatchEvent(new Event("entourageUpdated"))
    } catch (error) {
      console.error("Error updating entourage member:", error)
      setIsProcessing(false)
      setError("Failed to update entourage member")
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleDeleteEntourage = async (memberName: string) => {
    if (!confirm(`Are you sure you want to delete ${memberName}?`)) {
      return
    }

    setIsProcessing(true)
    setProcessingAction("Deleting entourage member")

    try {
      const response = await fetch("/api/entourage", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Name: memberName }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete entourage member")
      }

      setIsProcessing(false)
      setSuccessMessage("Entourage member deleted successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
      onRefreshEntourage()
      window.dispatchEvent(new Event("entourageUpdated"))
    } catch (error) {
      console.error("Error deleting entourage member:", error)
      setIsProcessing(false)
      setError("Failed to delete entourage member")
      setTimeout(() => setError(null), 3000)
    }
  }

  // Principal Sponsor handlers
  const handleAddSponsor = async () => {
    if (!sponsorFormData.MalePrincipalSponsor && !sponsorFormData.FemalePrincipalSponsor) {
      setError("At least one sponsor name is required")
      setTimeout(() => setError(null), 3000)
      return
    }

    setIsProcessing(true)
    setProcessingAction("Adding principal sponsor")

    try {
      const response = await fetch("/api/principal-sponsor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sponsorFormData),
      })

      if (!response.ok) {
        throw new Error("Failed to add principal sponsor")
      }

      setIsProcessing(false)
      setSuccessMessage("Principal sponsor added successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
      setShowSponsorModal(false)
      setSponsorFormData({ MalePrincipalSponsor: "", FemalePrincipalSponsor: "" })
      onRefreshSponsors()
    } catch (error) {
      console.error("Error adding principal sponsor:", error)
      setIsProcessing(false)
      setError("Failed to add principal sponsor")
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleUpdateSponsor = async () => {
    if (!editingSponsor) {
      return
    }

    setIsProcessing(true)
    setProcessingAction("Updating principal sponsor")

    try {
      const response = await fetch("/api/principal-sponsor", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalMale: editingSponsor.MalePrincipalSponsor,
          originalFemale: editingSponsor.FemalePrincipalSponsor,
          ...sponsorFormData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update principal sponsor")
      }

      setIsProcessing(false)
      setSuccessMessage("Principal sponsor updated successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
      setEditingSponsor(null)
      setSponsorFormData({ MalePrincipalSponsor: "", FemalePrincipalSponsor: "" })
      onRefreshSponsors()
    } catch (error) {
      console.error("Error updating principal sponsor:", error)
      setIsProcessing(false)
      setError("Failed to update principal sponsor")
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleDeleteSponsor = async (sponsor: PrincipalSponsor) => {
    const displayName = `${sponsor.MalePrincipalSponsor} & ${sponsor.FemalePrincipalSponsor}`
    if (!confirm(`Are you sure you want to delete ${displayName}?`)) {
      return
    }

    setIsProcessing(true)
    setProcessingAction("Deleting principal sponsor")

    try {
      const response = await fetch("/api/principal-sponsor", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          MalePrincipalSponsor: sponsor.MalePrincipalSponsor,
          FemalePrincipalSponsor: sponsor.FemalePrincipalSponsor,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete principal sponsor")
      }

      setIsProcessing(false)
      setSuccessMessage("Principal sponsor deleted successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
      onRefreshSponsors()
    } catch (error) {
      console.error("Error deleting principal sponsor:", error)
      setIsProcessing(false)
      setError("Failed to delete principal sponsor")
      setTimeout(() => setError(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#111827]">Entourage & Principal Sponsors</h2>
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

      {/* Sub Tabs */}
      <div className="bg-white rounded-xl p-2 shadow-sm border border-[#E5E7EB]">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab("entourage")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeSubTab === "entourage"
                ? "bg-[#FBFCF7] text-[#304A34] shadow-sm"
                : "text-[#6B7280] hover:bg-[#F9FAFB]"
            }`}
          >
            <Crown className="h-5 w-5" />
            Entourage ({entourage.length})
          </button>
          <button
            onClick={() => setActiveSubTab("sponsors")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeSubTab === "sponsors"
                ? "bg-[#FBFCF7] text-[#304A34] shadow-sm"
                : "text-[#6B7280] hover:bg-[#F9FAFB]"
            }`}
          >
            <UserCheck className="h-5 w-5" />
            Principal Sponsors ({principalSponsors.length})
          </button>
        </div>
      </div>

      {/* Search and Add */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E7EB]">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeSubTab}...`}
                className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#718566] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
          <Button
            onClick={() => {
              if (activeSubTab === "entourage") {
                setShowEntourageModal(true)
                setEditingEntourage(null)
                setEntourageFormData({ Name: "", RoleCategory: "", RoleTitle: "", Email: "" })
              } else {
                setShowSponsorModal(true)
                setEditingSponsor(null)
                setSponsorFormData({ MalePrincipalSponsor: "", FemalePrincipalSponsor: "" })
              }
            }}
            className="bg-gradient-to-r from-[#4F674D] to-[#304A34] hover:from-[#304A34] hover:to-[#4F674D] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {activeSubTab === "entourage" ? "Entourage" : "Sponsor"}
          </Button>
        </div>
      </div>

      {/* Entourage List */}
      {activeSubTab === "entourage" && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#111827]">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#111827]">Role Category</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#111827]">Role Title</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#111827]">Email</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-[#111827]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredEntourage.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#6B7280]">
                      {isLoading ? "Loading entourage..." : "No entourage members found"}
                    </td>
                  </tr>
                ) : (
                  filteredEntourage.map((member, index) => (
                    <tr key={index} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4 font-medium text-[#111827]">{member.Name}</td>
                      <td className="px-6 py-4 text-[#6B7280]">{member.RoleCategory || "-"}</td>
                      <td className="px-6 py-4 text-[#6B7280]">{member.RoleTitle || "-"}</td>
                      <td className="px-6 py-4 text-[#6B7280]">
                        {member.Email && member.Email !== "Pending" ? member.Email : "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingEntourage(member)
                              setEntourageFormData({
                                Name: member.Name,
                                RoleCategory: member.RoleCategory,
                                RoleTitle: member.RoleTitle,
                                Email: member.Email || "",
                              })
                            }}
                            className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#304A34] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEntourage(member.Name)}
                            className="p-2 text-[#6B7280] hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Principal Sponsors List */}
      {activeSubTab === "sponsors" && (
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#111827]">Male Principal Sponsor</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#111827]">Female Principal Sponsor</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-[#111827]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredSponsors.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-[#6B7280]">
                      {isLoading ? "Loading principal sponsors..." : "No principal sponsors found"}
                    </td>
                  </tr>
                ) : (
                  filteredSponsors.map((sponsor, index) => (
                    <tr key={index} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4 font-medium text-[#111827]">{sponsor.MalePrincipalSponsor}</td>
                      <td className="px-6 py-4 font-medium text-[#111827]">{sponsor.FemalePrincipalSponsor}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingSponsor(sponsor)
                              setSponsorFormData({
                                MalePrincipalSponsor: sponsor.MalePrincipalSponsor,
                                FemalePrincipalSponsor: sponsor.FemalePrincipalSponsor,
                              })
                            }}
                            className="p-2 text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#304A34] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSponsor(sponsor)}
                            className="p-2 text-[#6B7280] hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Entourage Modal */}
      {(showEntourageModal || editingEntourage) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#111827]">
                {editingEntourage ? "Edit Entourage Member" : "Add Entourage Member"}
              </h3>
              <button
                onClick={() => {
                  setShowEntourageModal(false)
                  setEditingEntourage(null)
                  setEntourageFormData({ Name: "", RoleCategory: "", RoleTitle: "", Email: "" })
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
                  value={entourageFormData.Name}
                  onChange={(e) => setEntourageFormData({ ...entourageFormData, Name: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#718566] focus:border-transparent outline-none"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Role Category</label>
                <input
                  type="text"
                  value={entourageFormData.RoleCategory}
                  onChange={(e) => setEntourageFormData({ ...entourageFormData, RoleCategory: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#718566] focus:border-transparent outline-none"
                  placeholder="e.g., Bridesmaid, Groomsman"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Role Title</label>
                <input
                  type="text"
                  value={entourageFormData.RoleTitle}
                  onChange={(e) => setEntourageFormData({ ...entourageFormData, RoleTitle: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#718566] focus:border-transparent outline-none"
                  placeholder="e.g., Maid of Honor, Best Man"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Email</label>
                <input
                  type="email"
                  value={entourageFormData.Email}
                  onChange={(e) => setEntourageFormData({ ...entourageFormData, Email: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#718566] focus:border-transparent outline-none"
                  placeholder="Enter email"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowEntourageModal(false)
                  setEditingEntourage(null)
                  setEntourageFormData({ Name: "", RoleCategory: "", RoleTitle: "", Email: "" })
                }}
                variant="outline"
                className="flex-1 border-[#E5E7EB] text-[#6B7280]"
              >
                Cancel
              </Button>
              <Button
                onClick={editingEntourage ? handleUpdateEntourage : handleAddEntourage}
                className="flex-1 bg-gradient-to-r from-[#4F674D] to-[#304A34] hover:from-[#304A34] hover:to-[#4F674D] text-white"
              >
                {editingEntourage ? "Update" : "Add"} Member
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Principal Sponsor Modal */}
      {(showSponsorModal || editingSponsor) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#111827]">
                {editingSponsor ? "Edit Principal Sponsor" : "Add Principal Sponsor"}
              </h3>
              <button
                onClick={() => {
                  setShowSponsorModal(false)
                  setEditingSponsor(null)
                  setSponsorFormData({ MalePrincipalSponsor: "", FemalePrincipalSponsor: "" })
                }}
                className="p-2 hover:bg-[#F9FAFB] rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-[#6B7280]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Male Principal Sponsor</label>
                <input
                  type="text"
                  value={sponsorFormData.MalePrincipalSponsor}
                  onChange={(e) => setSponsorFormData({ ...sponsorFormData, MalePrincipalSponsor: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#718566] focus:border-transparent outline-none"
                  placeholder="Enter male sponsor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Female Principal Sponsor</label>
                <input
                  type="text"
                  value={sponsorFormData.FemalePrincipalSponsor}
                  onChange={(e) =>
                    setSponsorFormData({ ...sponsorFormData, FemalePrincipalSponsor: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-[#718566] focus:border-transparent outline-none"
                  placeholder="Enter female sponsor name"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowSponsorModal(false)
                  setEditingSponsor(null)
                  setSponsorFormData({ MalePrincipalSponsor: "", FemalePrincipalSponsor: "" })
                }}
                variant="outline"
                className="flex-1 border-[#E5E7EB] text-[#6B7280]"
              >
                Cancel
              </Button>
              <Button
                onClick={editingSponsor ? handleUpdateSponsor : handleAddSponsor}
                className="flex-1 bg-gradient-to-r from-[#4F674D] to-[#304A34] hover:from-[#304A34] hover:to-[#4F674D] text-white"
              >
                {editingSponsor ? "Update" : "Add"} Sponsor
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#E5E7EB] border-t-[#4F674D] rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-[#111827] mb-2">{processingAction}...</h3>
              <p className="text-sm text-[#6B7280]">Please wait while we process your request</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

