"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ActivityItem {
  id: string
  title: string
  category: string
  location: string
  city: string
  status: string
  priority: string
  isEmergency: boolean
  createdAt: string
  resolvedAt: string | null
  rating: number | null
  feedback: string | null
  department: { name: string } | null
  user: { name: string } | null
}

const categoryIcons: Record<string, string> = {
  Water: "💧",
  Waste: "🗑️",
  Roads: "🛣️",
  Electricity: "⚡",
  Health: "🏥",
  Other: "📋",
}

const categoryColors: Record<string, string> = {
  Water: "bg-blue-100 text-blue-700 border-blue-200",
  Waste: "bg-green-100 text-green-700 border-green-200",
  Roads: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Electricity: "bg-orange-100 text-orange-700 border-orange-200",
  Health: "bg-red-100 text-red-700 border-red-200",
  Other: "bg-gray-100 text-gray-700 border-gray-200",
}

function getTimeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)

  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`
  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  if (minutes > 0) return `${minutes} min${minutes > 1 ? "s" : ""} ago`
  return "Just now"
}

function getResolutionTime(createdAt: string, resolvedAt: string) {
  const diffMs = new Date(resolvedAt).getTime() - new Date(createdAt).getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (hours < 1) return "Less than 1 hour"
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""}`
  return `${days} day${days !== 1 ? "s" : ""}`
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-sm ${i < rating ? "text-yellow-400" : "text-gray-200"}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default function PublicActivityPage() {
  const router = useRouter()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterCity, setFilterCity] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/public/activity", { cache: "no-store" })
      const contentType = res.headers.get("content-type") || ""
      if (!contentType.includes("application/json")) return

      const data = await res.json()
      if (res.ok && data.activities) {
        setActivities(data.activities)
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique cities
  const cities = Array.from(new Set(activities.map((a) => a.city).filter(Boolean)))

  // Category counts
  const categoryCounts: Record<string, number> = {}
  activities.forEach((a) => {
    categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1
  })

  // Filter
  const filtered = activities.filter((a) => {
    if (filterCategory !== "all" && a.category !== filterCategory) return false
    if (filterCity !== "all" && a.city !== filterCity) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        a.title.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.department?.name?.toLowerCase().includes(q)
      )
    }
    return true
  })

  // Stats
  const totalResolved = activities.length
  const ratedActivities = activities.filter((a) => a.rating && a.rating > 0)
  const avgRating =
    ratedActivities.length > 0
      ? (
          ratedActivities.reduce((sum, a) => sum + (a.rating || 0), 0) /
          ratedActivities.length
        ).toFixed(1)
      : "N/A"
  const emergencyResolved = activities.filter((a) => a.isEmergency).length
  const deptCount = new Set(
    activities.filter((a) => a.department).map((a) => a.department?.name)
  ).size

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading public activity...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <span className="text-xl font-bold">CityWatch</span>
            </Link>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm font-medium"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Page Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
            <span>📢</span>
            <span>Public Activity Feed</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            City Resolution Activity
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A transparent public feed of all issues successfully resolved by
            city departments. See how your city is improving.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm">
            <div className="text-4xl font-bold text-emerald-600 mb-1">
              {totalResolved}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Issues Fixed
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-4xl font-bold text-yellow-500">
                {avgRating}
              </span>
              <span className="text-xl text-yellow-400">★</span>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Avg Rating
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm">
            <div className="text-4xl font-bold text-blue-600 mb-1">
              {deptCount}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Departments
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm">
            <div className="text-4xl font-bold text-red-600 mb-1">
              {emergencyResolved}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Emergencies Fixed
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search by title, location, department..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-4 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category */}
            <select
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-w-[160px]"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">📁 All Categories</option>
              <option value="Water">💧 Water</option>
              <option value="Waste">🗑️ Waste</option>
              <option value="Roads">🛣️ Roads</option>
              <option value="Electricity">⚡ Electricity</option>
              <option value="Health">🏥 Health</option>
              <option value="Other">📋 Other</option>
            </select>

            {/* City */}
            <select
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500 min-w-[140px]"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
            >
              <option value="all">🏙️ All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {/* Clear */}
            <button
              onClick={() => {
                setFilterCategory("all")
                setFilterCity("all")
                setSearchQuery("")
              }}
              className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
            >
              Clear
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-3">
            Showing {filtered.length} of {activities.length} resolved activities
          </p>
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filterCategory === "all"
                ? "bg-emerald-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            All ({activities.length})
          </button>
          {Object.entries(categoryCounts).map(([cat, count]) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${
                filterCategory === cat
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {categoryIcons[cat] || "📋"} {cat} ({count})
            </button>
          ))}
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Activities Found
              </h3>
              <p className="text-gray-600 mb-4">
                Try changing your search or filters
              </p>
              <button
                onClick={() => {
                  setFilterCategory("all")
                  setFilterCity("all")
                  setSearchQuery("")
                }}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filtered.map((activity, index) => (
              <div
                key={activity.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
              >
                {/* Top color bar */}
                <div
                  className={`h-1 ${
                    activity.isEmergency
                      ? "bg-red-500"
                      : (activity.rating || 0) >= 4
                      ? "bg-green-500"
                      : (activity.rating || 0) >= 3
                      ? "bg-yellow-500"
                      : "bg-emerald-400"
                  }`}
                />

                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${
                          activity.isEmergency
                            ? "bg-red-50 border-red-200"
                            : "bg-green-50 border-green-200"
                        }`}
                      >
                        {activity.isEmergency
                          ? "🚨"
                          : categoryIcons[activity.category] || "✅"}
                      </div>
                      {/* Connector line for timeline effect */}
                      {index < filtered.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-200 mt-2 hidden md:block"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      {/* Header Row */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {activity.title}
                        </h3>

                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold border border-green-200">
                          ✅ Resolved
                        </span>

                        <span
                          className={`px-2.5 py-1 text-xs rounded-full font-medium border ${
                            categoryColors[activity.category] ||
                            "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {categoryIcons[activity.category]} {activity.category}
                        </span>

                        {activity.isEmergency && (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold border border-red-200">
                            🚨 Emergency
                          </span>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          📍 {activity.location}
                        </span>
                        <span className="flex items-center gap-1">
                          🏙️ {activity.city}
                        </span>
                        <span className="flex items-center gap-1">
                          🏢 {activity.department?.name || "City Services"}
                        </span>
                      </div>

                      {/* Timeline Info */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-3">
                        <span>
                          📝 Reported:{" "}
                          {new Date(activity.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                        {activity.resolvedAt && (
                          <>
                            <span>
                              ✅ Resolved:{" "}
                              {new Date(
                                activity.resolvedAt
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <span className="text-emerald-600 font-medium">
                              ⚡ Fixed in{" "}
                              {getResolutionTime(
                                activity.createdAt,
                                activity.resolvedAt
                              )}
                            </span>
                          </>
                        )}
                        {activity.resolvedAt && (
                          <span>
                            🕐 {getTimeAgo(activity.resolvedAt)}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      {activity.rating && activity.rating > 0 ? (
                        <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                          <div className="flex items-center gap-3 mb-1">
                            <StarDisplay rating={activity.rating} />
                            <span className="text-xs font-bold text-gray-700">
                              {activity.rating}/5
                            </span>
                          </div>
                          {activity.feedback &&
                            activity.feedback.trim() !== "" && (
                              <p className="text-gray-600 text-xs italic mt-1">
                                &quot;{activity.feedback}&quot;
                              </p>
                            )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <StarDisplay rating={0} />
                          <span>Awaiting citizen rating</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More / Summary */}
        {filtered.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Showing {filtered.length} resolved{" "}
              {filtered.length === 1 ? "activity" : "activities"}
            </p>
          </div>
        )}

        {/* Links */}
        <div className="mt-10 grid md:grid-cols-2 gap-4">
          <Link
            href="/public/resolved"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl">
              ✅
            </div>
            <div>
              <p className="font-bold text-gray-900">Resolved Issues</p>
              <p className="text-sm text-gray-500">
                Rate and review resolved issues
              </p>
            </div>
          </Link>
          <Link
            href="/register"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5 rounded-2xl shadow-sm hover:shadow-md transition flex items-center gap-4 text-white"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              📝
            </div>
            <div>
              <p className="font-bold">Report an Issue</p>
              <p className="text-sm text-emerald-100">
                Help improve your city
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}