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
  resolvedAt: string | null
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

export default function MyReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/citizen/reports", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setReports(data.reports)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter((report) => {
    if (filter === "all") return true
    return report.status === filter
  })

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    inProgress: reports.filter((r) => r.status === "in-progress").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
  }

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
                <span className="text-xl font-bold text-emerald-600">CityWatch</span>
              </Link>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                📋 My Reports
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/citizen/report"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                + New Report
              </Link>
              <Link
                href="/citizen/dashboard"
                className="text-gray-600 hover:text-emerald-600"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">📝</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-gray-600">Total Reports</div>
          </div>
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
            <div className="text-3xl mb-2">⏳</div>
            <div className="text-3xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="text-yellow-600">Pending</div>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <div className="text-3xl mb-2">🔄</div>
            <div className="text-3xl font-bold text-blue-700">{stats.inProgress}</div>
            <div className="text-blue-600">In Progress</div>
          </div>
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-3xl font-bold text-green-700">{stats.resolved}</div>
            <div className="text-green-600">Resolved</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "all", label: "All Reports", count: stats.total },
              { id: "pending", label: "Pending", count: stats.pending },
              { id: "in-progress", label: "In Progress", count: stats.inProgress },
              { id: "resolved", label: "Resolved", count: stats.resolved },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === tab.id
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-600 mb-4">You haven't submitted any reports yet.</p>
              <Link
                href="/citizen/report"
                className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
              >
                Submit Your First Report
              </Link>
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
                    : "border-gray-300"
                } hover:shadow-md transition`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl">
                        {categoryIcons[report.category] || "📋"}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900">
                            {report.title}
                          </h3>
                          {report.isEmergency && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                              🚨 Emergency
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full ${statusColors[report.status]}`}>
                            {report.status === "pending" ? "Pending" :
                             report.status === "in-progress" ? "In Progress" : "Resolved"}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1 line-clamp-2">
                          {report.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>📍 {report.location}</span>
                      <span>🏙️ {report.city}</span>
                      <span>📅 {new Date(report.createdAt).toLocaleDateString()}</span>
                      {report.rating && (
                        <span>⭐ {report.rating}/5</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {report.status === "resolved" && !report.rating && (
                      <Link
                        href={`/citizen/feedback/${report.id}`}
                        className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition"
                      >
                        ⭐ Rate
                      </Link>
                    )}
                    <Link
                      href={`/citizen/reports/${report.id}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
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
                    <span className="text-sm text-gray-500">
                      {report.status === "resolved" ? "Completed" :
                       report.status === "in-progress" ? "In Progress" : "Submitted"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}