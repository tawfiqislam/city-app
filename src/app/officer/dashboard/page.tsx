"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Ticket {
  id: string
  title: string
  description: string
  category: string
  location: string
  city: string
  status: string
  priority: string
  isEmergency: boolean
  imageUrl: string | null
  createdAt: string
  user: {
    name: string
    email: string
    phone: string
  }
  department: {
    name: string
  } | null
  assignments: {
    id: string
    officer: { id: string; name: string; email: string }
    claimedAt: string | null
  }[]
}

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  "in-progress": "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
}

const categoryIcons: Record<string, string> = {
  Water: "💧",
  Waste: "🗑️",
  Roads: "🛣️",
  Electricity: "⚡",
  Health: "🏥",
}

export default function OfficerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "officer") {
      router.push("/login")
      return
    }
    setUser(parsedUser)
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch("/api/officer/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        console.error("Failed to fetch tickets")
        setTickets([])
        return
      }

      const data = await res.json()
      console.log("Tickets fetched:", data.tickets?.length)
      setTickets(data.tickets || [])
    } catch (error) {
      console.error("Error:", error)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  const claimTicket = async (reportId: string) => {
    const confirmed = window.confirm("Are you sure you want to claim this ticket?")
    if (!confirmed) return

    setClaimingId(reportId)

    try {
      const token = localStorage.getItem("token")

      console.log("Claiming ticket:", reportId)

      const res = await fetch("/api/officer/tickets/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reportId }),
      })

      console.log("Claim response status:", res.status)

      const data = await res.json()
      console.log("Claim response data:", data)

      if (res.ok && data.success) {
        alert("✅ Ticket claimed successfully! Status changed to In Progress.")

        // Close modal if open
        setSelectedTicket(null)

        // Wait a moment then refresh
        setTimeout(() => {
          fetchTickets()
        }, 500)
      } else {
        alert("❌ " + (data.error || "Failed to claim ticket"))
      }
    } catch (error) {
      console.error("Claim error:", error)
      alert("❌ Failed to claim ticket. Please try again.")
    } finally {
      setClaimingId(null)
    }
  }

  const goToResolvePage = (ticketId: string) => {
    setSelectedTicket(null)
    router.push(`/officer/resolve/${ticketId}`)
  }

  const filteredTickets = tickets.filter((ticket) => {
    // Tab filter
    if (activeTab === "pending" && ticket.status !== "pending") return false
    if (activeTab === "in-progress" && ticket.status !== "in-progress") return false
    if (activeTab === "emergency" && !ticket.isEmergency) return false

    // Search filter
    if (search) {
      const s = search.toLowerCase()
      return (
        ticket.title.toLowerCase().includes(s) ||
        ticket.location.toLowerCase().includes(s) ||
        ticket.description.toLowerCase().includes(s) ||
        ticket.user.name.toLowerCase().includes(s)
      )
    }

    return true
  })

  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "pending").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    emergency: tickets.filter((t) => t.isEmergency).length,
  }

  const logout = () => {
    localStorage.clear()
    router.push("/login")
  }

  // Check if current officer has claimed a ticket
  const isClaimedByMe = (ticket: Ticket) => {
    return ticket.assignments.some(a => a.officer?.id === user?.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">🏛️</span>
                <span className="text-xl font-bold text-emerald-600">CityWatch</span>
              </Link>
              <div className="hidden md:block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                👮 Officer Panel
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/officer/maintenance"
                className="px-4 py-2 text-gray-600 hover:text-emerald-600 font-medium"
              >
                📅 Maintenance
              </Link>
              <div className="hidden md:flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-bold">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.department?.name}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}! 👋</h1>
          <p className="text-emerald-100">Department: {user?.department?.name || "General"}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Tickets", value: stats.total, icon: "📋", color: "bg-gray-100" },
            { label: "Pending", value: stats.pending, icon: "⏳", color: "bg-yellow-100" },
            { label: "In Progress", value: stats.inProgress, icon: "🔄", color: "bg-blue-100" },
            { label: "Emergency", value: stats.emergency, icon: "🚨", color: "bg-red-100" },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} p-6 rounded-xl`}>
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs & Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "all", label: "All", count: stats.total },
                { id: "pending", label: "Pending", count: stats.pending },
                { id: "in-progress", label: "In Progress", count: stats.inProgress },
                { id: "emergency", label: "🚨 Emergency", count: stats.emergency },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === tab.id
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="🔍 Search tickets..."
              className="px-4 py-2 border border-gray-200 rounded-lg w-full md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Tickets */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Tickets Found</h3>
              <p className="text-gray-600">No matching tickets in your department</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
                  ticket.isEmergency
                    ? "border-red-500"
                    : ticket.status === "in-progress"
                    ? "border-blue-500"
                    : ticket.priority === "high" || ticket.priority === "urgent"
                    ? "border-orange-500"
                    : "border-emerald-500"
                } hover:shadow-md transition`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Ticket Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl mt-1">
                        {categoryIcons[ticket.category] || "📝"}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-lg font-bold text-gray-900">{ticket.title}</h3>
                          {ticket.isEmergency && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                              🚨 EMERGENCY
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 flex-wrap mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${statusColors[ticket.status]}`}>
                            {ticket.status === "pending" ? "⏳ Pending" :
                             ticket.status === "in-progress" ? "🔄 In Progress" : "✅ Resolved"}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[ticket.priority]}`}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600 line-clamp-2">{ticket.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <span>📍 {ticket.location}</span>
                      <span>🏙️ {ticket.city}</span>
                      <span>👤 {ticket.user.name}</span>
                      <span>📞 {ticket.user.phone}</span>
                      <span>📅 {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Show assigned officer */}
                    {ticket.assignments.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                        <span>👮 Assigned to: {ticket.assignments[0].officer.name}</span>
                        {isClaimedByMe(ticket) && (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                            (You)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {/* Show CLAIM button only for pending tickets */}
                    {ticket.status === "pending" && (
                      <button
                        onClick={() => claimTicket(ticket.id)}
                        disabled={claimingId === ticket.id}
                        className={`px-5 py-3 rounded-xl font-medium transition whitespace-nowrap ${
                          claimingId === ticket.id
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : ticket.isEmergency
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {claimingId === ticket.id
                          ? "⏳ Claiming..."
                          : ticket.isEmergency
                          ? "🚨 Claim Now"
                          : "✅ Claim"}
                      </button>
                    )}

                    {/* Show RESOLVE button for in-progress tickets */}
                    {ticket.status === "in-progress" && (
                      <button
                        onClick={() => goToResolvePage(ticket.id)}
                        className="px-5 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition whitespace-nowrap"
                      >
                        🔧 Resolve
                      </button>
                    )}

                    {/* Details button always visible */}
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition whitespace-nowrap"
                    >
                      👁️ Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Details Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTicket(null)
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className={`p-6 border-b sticky top-0 z-10 ${
              selectedTicket.isEmergency ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{categoryIcons[selectedTicket.category] || "📝"}</span>
                    {selectedTicket.isEmergency && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                        🚨 EMERGENCY
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedTicket.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status Badges */}
              <div className="flex gap-3 flex-wrap">
                <span className={`px-3 py-1 text-sm rounded-full ${statusColors[selectedTicket.status]}`}>
                  {selectedTicket.status === "pending" ? "⏳ Pending" :
                   selectedTicket.status === "in-progress" ? "🔄 In Progress" : "✅ Resolved"}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${priorityColors[selectedTicket.priority]}`}>
                  {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)} Priority
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {selectedTicket.category}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">📄 Description</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{selectedTicket.description}</p>
              </div>

              {/* Location Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-1">📍 Location</h3>
                  <p className="text-gray-700">{selectedTicket.location}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-1">🏙️ City</h3>
                  <p className="text-gray-700">{selectedTicket.city}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-1">🏢 Department</h3>
                  <p className="text-gray-700">{selectedTicket.department?.name || "Not Assigned"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-1">📅 Submitted</h3>
                  <p className="text-gray-700">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Citizen Info */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h3 className="font-bold text-gray-900 mb-3">👤 Reported By</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{selectedTicket.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{selectedTicket.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{selectedTicket.user.phone}</p>
                  </div>
                </div>
              </div>

              {/* Image */}
              {selectedTicket.imageUrl && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">📷 Photo</h3>
                  <img
                    src={selectedTicket.imageUrl}
                    alt="Issue"
                    className="w-full max-h-64 object-contain rounded-xl bg-gray-100"
                  />
                </div>
              )}

              {/* Assignment Info */}
              {selectedTicket.assignments.length > 0 && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h3 className="font-bold text-gray-900 mb-3">👮 Assignment</h3>
                  {selectedTicket.assignments.map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                        {a.officer?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {a.officer?.name}
                          {a.officer?.id === user?.id && " (You)"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Claimed: {a.claimedAt ? new Date(a.claimedAt).toLocaleString() : "Pending"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-gray-200 flex gap-4 sticky bottom-0 bg-white">
              <button
                onClick={() => setSelectedTicket(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Close
              </button>

              {selectedTicket.status === "pending" && (
                <button
                  onClick={() => {
                    claimTicket(selectedTicket.id)
                  }}
                  disabled={claimingId === selectedTicket.id}
                  className={`flex-1 py-3 rounded-xl font-medium transition ${
                    claimingId === selectedTicket.id
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : selectedTicket.isEmergency
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {claimingId === selectedTicket.id
                    ? "⏳ Claiming..."
                    : selectedTicket.isEmergency
                    ? "🚨 Claim Emergency"
                    : "✅ Claim Ticket"}
                </button>
              )}

              {selectedTicket.status === "in-progress" && (
                <button
                  onClick={() => goToResolvePage(selectedTicket.id)}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                >
                  🔧 Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}