"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Report {
  id: string
  title: string
  description: string
  category: string
  location: string
  city: string
  status: string
  priority: string
  isEmergency: boolean
  rating: number | null
  feedback: string | null
  createdAt: string
  department: { name: string } | null
  assignments: {
    officer: { name: string }
  }[]
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
  Other: "📋",
}

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
}

export default function MyReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const res = await fetch("/api/citizen/reports", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        console.error("Failed to fetch reports")
        return
      }

      const data = await res.json()
      setReports(data.reports || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique categories from reports
  const availableCategories = Array.from(
    new Set(reports.map((r) => r.category))
  )

  // Apply all filters
  const filteredReports = reports
    .filter((report) => {
      // Status filter
      if (statusFilter !== "all" && report.status !== statusFilter) return false

      // Category filter
      if (categoryFilter !== "all" && report.category !== categoryFilter)
        return false

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          report.title.toLowerCase().includes(q) ||
          report.description.toLowerCase().includes(q) ||
          report.location.toLowerCase().includes(q) ||
          report.category.toLowerCase().includes(q) ||
          report.city.toLowerCase().includes(q)
        )
      }

      return true
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sortBy === "priority") {
        const order: Record<string, number> = {
          urgent: 4,
          high: 3,
          medium: 2,
          low: 1,
        }
        return (order[b.priority] || 0) - (order[a.priority] || 0)
      }
      return 0
    })

  // Stats
  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    inProgress: reports.filter((r) => r.status === "in-progress").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
  }

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter("all")
    setCategoryFilter("all")
    setSearchQuery("")
    setSortBy("newest")
  }

  const hasActiveFilters =
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    searchQuery !== "" ||
    sortBy !== "newest"

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">🏛️</span>
                <span className="text-xl font-bold text-emerald-600">
                  CityWatch
                </span>
              </Link>
              <div className="hidden md:block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                📋 My Reports
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/citizen/report"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium"
              >
                + New Report
              </Link>
              <Link
                href="/citizen/dashboard"
                className="text-gray-600 hover:text-emerald-600 text-sm"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">📋 My Reports</h1>
          <p className="text-gray-600 mt-1">
            Track and search all your submitted reports
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => {
              setStatusFilter("all")
              setCategoryFilter("all")
            }}
            className={`p-5 rounded-xl border transition text-left ${
              statusFilter === "all"
                ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-200"
                : "bg-white border-gray-100 hover:border-gray-300"
            }`}
          >
            <div className="text-3xl mb-1">📝</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-gray-600 text-sm">Total Reports</div>
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`p-5 rounded-xl border transition text-left ${
              statusFilter === "pending"
                ? "bg-yellow-50 border-yellow-500 shadow-md ring-2 ring-yellow-200"
                : "bg-yellow-50 border-yellow-200 hover:border-yellow-400"
            }`}
          >
            <div className="text-3xl mb-1">⏳</div>
            <div className="text-3xl font-bold text-yellow-700">
              {stats.pending}
            </div>
            <div className="text-yellow-600 text-sm">Pending</div>
          </button>
          <button
            onClick={() => setStatusFilter("in-progress")}
            className={`p-5 rounded-xl border transition text-left ${
              statusFilter === "in-progress"
                ? "bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-200"
                : "bg-blue-50 border-blue-200 hover:border-blue-400"
            }`}
          >
            <div className="text-3xl mb-1">🔄</div>
            <div className="text-3xl font-bold text-blue-700">
              {stats.inProgress}
            </div>
            <div className="text-blue-600 text-sm">In Progress</div>
          </button>
          <button
            onClick={() => setStatusFilter("resolved")}
            className={`p-5 rounded-xl border transition text-left ${
              statusFilter === "resolved"
                ? "bg-green-50 border-green-500 shadow-md ring-2 ring-green-200"
                : "bg-green-50 border-green-200 hover:border-green-400"
            }`}
          >
            <div className="text-3xl mb-1">✅</div>
            <div className="text-3xl font-bold text-green-700">
              {stats.resolved}
            </div>
            <div className="text-green-600 text-sm">Resolved</div>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search by title, description, location..."
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-gray-50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="min-w-[180px]">
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-gray-50"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">📁 All Categories</option>
                <option value="Water">💧 Water Supply</option>
                <option value="Waste">🗑️ Waste Management</option>
                <option value="Roads">🛣️ Roads & Highways</option>
                <option value="Electricity">⚡ Electricity</option>
                <option value="Health">🏥 Public Health</option>
                <option value="Other">📋 Other</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="min-w-[160px]">
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-gray-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">📊 All Status</option>
                <option value="pending">⏳ Pending</option>
                <option value="in-progress">🔄 In Progress</option>
                <option value="resolved">✅ Resolved</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="min-w-[150px]">
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 bg-gray-50"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">🕐 Newest First</option>
                <option value="oldest">🕐 Oldest First</option>
                <option value="priority">🔴 Priority</option>
              </select>
            </div>
          </div>

          {/* Active Filters Info */}
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Active filters:</span>

              {statusFilter !== "all" && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full flex items-center gap-1">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="ml-1 hover:text-emerald-900"
                  >
                    ✕
                  </button>
                </span>
              )}

              {categoryFilter !== "all" && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
                  Category: {categoryFilter}
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className="ml-1 hover:text-blue-900"
                  >
                    ✕
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                  Search: &quot;{searchQuery}&quot;
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:text-purple-900"
                  >
                    ✕
                  </button>
                </span>
              )}

              {sortBy !== "newest" && (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center gap-1">
                  Sort: {sortBy}
                  <button
                    onClick={() => setSortBy("newest")}
                    className="ml-1 hover:text-orange-900"
                  >
                    ✕
                  </button>
                </span>
              )}

              <button
                onClick={clearFilters}
                className="px-3 py-1 bg-red-50 text-red-600 text-xs rounded-full hover:bg-red-100 transition font-medium"
              >
                Clear All ✕
              </button>

              <span className="ml-auto text-sm text-gray-500">
                Showing {filteredReports.length} of {reports.length} reports
              </span>
            </div>
          )}
        </div>

        {/* Category Quick Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              categoryFilter === "all"
                ? "bg-emerald-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            All ({reports.length})
          </button>
          {["Water", "Waste", "Roads", "Electricity", "Health", "Other"].map(
            (cat) => {
              const count = reports.filter((r) => r.category === cat).length
              if (count === 0) return null
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${
                    categoryFilter === cat
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {categoryIcons[cat]} {cat} ({count})
                </button>
              )
            }
          )}
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">
                {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                  ? "🔍"
                  : "📭"}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                  ? "No Matching Reports"
                  : "No Reports Yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "You haven't submitted any reports yet."}
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  href="/citizen/report"
                  className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
                >
                  Submit Your First Report
                </Link>
              )}
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
                  report.isEmergency
                    ? "border-red-500"
                    : report.status === "resolved"
                    ? "border-green-500"
                    : report.status === "in-progress"
                    ? "border-blue-500"
                    : "border-yellow-500"
                } hover:shadow-md transition`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl mt-0.5">
                        {categoryIcons[report.category] || "📋"}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {report.title}
                          </h3>
                          {report.isEmergency && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                              🚨 Emergency
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 flex-wrap mb-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              statusColors[report.status]
                            }`}
                          >
                            {report.status === "pending"
                              ? "⏳ Pending"
                              : report.status === "in-progress"
                              ? "🔄 In Progress"
                              : "✅ Resolved"}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              priorityColors[report.priority]
                            }`}
                          >
                            {report.priority.charAt(0).toUpperCase() +
                              report.priority.slice(1)}
                          </span>
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                            {report.category}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {report.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <span>📍 {report.location}</span>
                      <span>🏙️ {report.city}</span>
                      <span>
                        📅{" "}
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                      {report.department && (
                        <span>🏢 {report.department.name}</span>
                      )}
                      {report.assignments?.length > 0 && (
                        <span>
                          👮 {report.assignments[0].officer.name}
                        </span>
                      )}
                      {report.rating && <span>⭐ {report.rating}/5</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      href={`/citizen/reports/${report.id}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                    >
                      View Details
                    </Link>
                    {report.status === "resolved" && !report.rating && (
                      <Link
                        href={`/citizen/feedback/${report.id}`}
                        className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition text-sm font-medium"
                      >
                        ⭐ Rate
                      </Link>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          report.status === "resolved"
                            ? "bg-green-500 w-full"
                            : report.status === "in-progress"
                            ? "bg-blue-500 w-2/3"
                            : "bg-yellow-500 w-1/3"
                        }`}
                      />
                    </div>
                    <span className="text-xs text-gray-500 min-w-[80px] text-right">
                      {report.status === "resolved"
                        ? "Completed"
                        : report.status === "in-progress"
                        ? "In Progress"
                        : "Submitted"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Results Summary */}
        {filteredReports.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredReports.length} of {reports.length} report(s)
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-2 text-emerald-600 hover:underline font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}