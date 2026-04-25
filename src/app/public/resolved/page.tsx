// src/app/public/resolved/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ResolvedReport {
  id: string
  title: string
  category: string
  location: string
  city: string
  resolvedAt: string
  createdAt?: string
  rating: number | null
  feedback: string | null
  department: { name: string } | null
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
  Water: "bg-blue-100 text-blue-700",
  Waste: "bg-green-100 text-green-700",
  Roads: "bg-yellow-100 text-yellow-700",
  Electricity: "bg-orange-100 text-orange-700",
  Health: "bg-red-100 text-red-700",
  Other: "bg-gray-100 text-gray-700",
}

function StarRating({
  rating,
  onRate,
  interactive = false,
}: {
  rating: number
  onRate?: (r: number) => void
  interactive?: boolean
}) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onRate && onRate(i + 1)}
          onMouseEnter={() => interactive && setHover(i + 1)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`text-4xl leading-none transition-all ${
            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
          } ${i < (hover || rating) ? "text-yellow-400" : "text-gray-200"}`}
          aria-label={`Rate ${i + 1} stars`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function ratingMeta(rating: number) {
  if (rating === 5)
    return {
      label: "Excellent",
      color: "text-green-700 bg-green-50 border-green-200",
    }
  if (rating === 4)
    return { label: "Very Good", color: "text-blue-700 bg-blue-50 border-blue-200" }
  if (rating === 3)
    return {
      label: "Good",
      color: "text-yellow-700 bg-yellow-50 border-yellow-200",
    }
  if (rating === 2)
    return {
      label: "Fair",
      color: "text-orange-700 bg-orange-50 border-orange-200",
    }
  return { label: "Poor", color: "text-red-700 bg-red-50 border-red-200" }
}

export default function PublicResolvedPage() {
  const router = useRouter()

  const [reports, setReports] = useState<ResolvedReport[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterRating, setFilterRating] = useState("all")

  const [selectedReport, setSelectedReport] = useState<ResolvedReport | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Rating modal state
  const [newRating, setNewRating] = useState(0)
  const [newFeedback, setNewFeedback] = useState("")
  const [ratingLoading, setRatingLoading] = useState(false)
  const [ratingSuccess, setRatingSuccess] = useState("")
  const [ratingError, setRatingError] = useState("")
  const [hasSubmitted, setHasSubmitted] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) setCurrentUser(JSON.parse(userData))
    fetchResolvedReports()
  }, [])

  const fetchResolvedReports = async () => {
    try {
      const res = await fetch("/api/public/resolved", { cache: "no-store" })
      const contentType = res.headers.get("content-type") || ""
      if (!contentType.includes("application/json")) return
      const data = await res.json()
      if (res.ok && data.reports) setReports(data.reports)
    } catch (e) {
      console.error("Resolved fetch error:", e)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenReport = (report: ResolvedReport) => {
    setSelectedReport(report)
    setNewRating(report.rating || 0)
    setNewFeedback(report.feedback || "")
    setRatingSuccess("")
    setRatingError("")
    setHasSubmitted(false)
  }

  const handleSubmitRating = async () => {
    setRatingError("")
    setRatingSuccess("")

    if (!selectedReport) return

    if (newRating === 0) {
      setRatingError("Please select a star rating.")
      return
    }

    if (!currentUser) {
      setRatingError("You must be logged in as a citizen to rate.")
      return
    }
    if (currentUser.role !== "citizen") {
      setRatingError("Only citizens can submit ratings.")
      return
    }

    setRatingLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/reports/${selectedReport.id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: newRating, feedback: newFeedback }),
      })

      const contentType = res.headers.get("content-type") || ""
      if (!contentType.includes("application/json")) {
        setRatingError("Server returned invalid response.")
        return
      }

      const data = await res.json()
      if (!res.ok) {
        setRatingError(data.error || "Failed to submit rating.")
        return
      }

      setRatingSuccess("✅ Thank you! Your rating has been submitted.")
      setHasSubmitted(true)

      // update in local list for instant UI feedback
      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReport.id ? { ...r, rating: newRating, feedback: newFeedback } : r
        )
      )
      setSelectedReport((prev) =>
        prev ? { ...prev, rating: newRating, feedback: newFeedback } : prev
      )

      // refresh from server (optional)
      setTimeout(() => {
        fetchResolvedReports()
      }, 400)
    } catch (e) {
      console.error(e)
      setRatingError("Network error. Please try again.")
    } finally {
      setRatingLoading(false)
    }
  }

  // Stats
  const ratedReports = reports.filter((r) => (r.rating || 0) > 0)
  const avgRating =
    ratedReports.length > 0
      ? (
          ratedReports.reduce((sum, r) => sum + (r.rating || 0), 0) /
          ratedReports.length
        ).toFixed(1)
      : "N/A"

  const fiveStarCount = reports.filter((r) => r.rating === 5).length
  const ratedCount = ratedReports.length

  // Filtering
  const filteredReports = reports.filter((r) => {
    if (filterCategory !== "all" && r.category !== filterCategory) return false
    if (filterRating === "rated" && !r.rating) return false
    if (filterRating === "unrated" && r.rating) return false
    if (filterRating === "5" && r.rating !== 5) return false
    if (filterRating === "4" && r.rating !== 4) return false
    if (filterRating === "low" && (r.rating || 0) > 2) return false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resolved issues...</p>
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

            {/* Back button only */}
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm font-medium flex items-center gap-2"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
            <span>✅</span>
            <span>Public Issue Tracker</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Resolved City Issues</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse all resolved issues. Citizens can click any issue to rate it and see other citizens&apos;
            ratings.
          </p>

          {!currentUser && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm border border-blue-200">
              <span>💡</span>
              <span>
                <Link href="/login" className="font-semibold underline">
                  Login as Citizen
                </Link>{" "}
                to submit a rating
              </span>
            </div>
          )}

          {currentUser && currentUser.role === "citizen" && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-200">
              <span>👤</span>
              <span>
                Logged in as <strong>{currentUser.name}</strong> — click any issue to rate
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm">
            <div className="text-4xl font-bold text-emerald-600 mb-1">{reports.length}</div>
            <div className="text-sm text-gray-600 font-medium">Issues Resolved</div>
          </div>

          <div className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-4xl font-bold text-yellow-500">{avgRating}</span>
              <span className="text-2xl text-yellow-400">★</span>
            </div>
            <div className="text-sm text-gray-600 font-medium">Average Rating</div>
          </div>

          <div className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm">
            <div className="text-4xl font-bold text-purple-600 mb-1">{fiveStarCount}</div>
            <div className="text-sm text-gray-600 font-medium">5-Star Issues</div>
          </div>

          <div className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm">
            <div className="text-4xl font-bold text-blue-600 mb-1">{ratedCount}</div>
            <div className="text-sm text-gray-600 font-medium">Citizen Ratings</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Category
              </label>
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 focus:ring-2 focus:ring-emerald-500 text-sm outline-none"
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
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                Rating
              </label>
              <select
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 focus:ring-2 focus:ring-emerald-500 text-sm outline-none"
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
              >
                <option value="all">⭐ All</option>
                <option value="5">★★★★★ Excellent</option>
                <option value="4">★★★★☆ Very Good</option>
                <option value="low">★★☆☆☆ Fair & Below</option>
                <option value="rated">✅ Rated</option>
                <option value="unrated">⏳ Not Yet Rated</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterCategory("all")
                  setFilterRating("all")
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
              >
                Clear
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-3">
            Showing {filteredReports.length} of {reports.length} resolved issues
          </p>
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Issues Found</h3>
              <button
                onClick={() => {
                  setFilterCategory("all")
                  setFilterRating("all")
                }}
                className="mt-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden cursor-pointer group"
                onClick={() => handleOpenReport(report)}
              >
                <div
                  className={`h-1.5 ${
                    (report.rating || 0) >= 5
                      ? "bg-green-500"
                      : (report.rating || 0) >= 4
                      ? "bg-blue-500"
                      : (report.rating || 0) >= 3
                      ? "bg-yellow-500"
                      : (report.rating || 0) >= 1
                      ? "bg-red-400"
                      : "bg-gray-200"
                  }`}
                />

                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border border-green-100">
                      {categoryIcons[report.category] || "✅"}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition">
                          {report.title}
                        </h3>
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                          ✅ Resolved
                        </span>
                        <span
                          className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                            categoryColors[report.category] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {categoryIcons[report.category]} {report.category}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                        <span>📍 {report.location}</span>
                        <span>🏙️ {report.city}</span>
                        <span>🏢 {report.department?.name || "City Services"}</span>
                        {report.resolvedAt && (
                          <span className="text-emerald-600 font-medium">
                            📅{" "}
                            {new Date(report.resolvedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>

                      {/* Rating summary */}
                      {report.rating ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`text-base ${i < report.rating! ? "text-yellow-400" : "text-gray-200"}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span
                            className={`px-2 py-0.5 text-xs font-bold rounded-full border ${
                              ratingMeta(report.rating).color
                            }`}
                          >
                            {ratingMeta(report.rating).label}
                          </span>
                          {report.feedback && (
                            <span className="text-gray-500 text-xs italic truncate max-w-xs">
                              &quot;{report.feedback}&quot;
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className="text-base text-gray-200">
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">No rating yet</span>
                          {currentUser?.role === "citizen" && (
                            <span className="text-xs text-emerald-600 font-medium animate-pulse">
                              — Click to rate!
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="hidden md:flex items-center text-gray-300 group-hover:text-emerald-500 transition">
                      <span className="text-2xl">→</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReport(null)
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal header */}
            <div className="p-6 border-b bg-gray-50 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                    {categoryIcons[selectedReport.category] || "✅"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedReport.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      📍 {selectedReport.location}, {selectedReport.city}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 text-gray-600 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-5">
              {/* Info blocks */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Department</p>
                  <p className="font-medium text-gray-800">
                    {selectedReport.department?.name || "City Services"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Resolved On</p>
                  <p className="font-medium text-gray-800">
                    {selectedReport.resolvedAt
                      ? new Date(selectedReport.resolvedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Category</p>
                  <p className="font-medium text-gray-800">
                    {categoryIcons[selectedReport.category]} {selectedReport.category}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <p className="font-medium text-green-700">✅ Fully Resolved</p>
                </div>
              </div>

              {/* Current rating display */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-100">
                  <h3 className="font-semibold text-gray-800">⭐ Current Rating</h3>
                </div>

                {selectedReport.rating ? (
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-2xl ${i < selectedReport.rating! ? "text-yellow-400" : "text-gray-200"}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span
                        className={`px-3 py-1 text-sm font-bold rounded-full border ${
                          ratingMeta(selectedReport.rating).color
                        }`}
                      >
                        {ratingMeta(selectedReport.rating).label} — {selectedReport.rating}/5
                      </span>
                    </div>

                    {selectedReport.feedback && selectedReport.feedback.trim() !== "" && (
                      <div className="bg-gray-50 rounded-xl p-3 border-l-4 border-yellow-400">
                        <p className="text-gray-700 text-sm italic">
                          &quot;{selectedReport.feedback}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <div className="text-4xl mb-2">📭</div>
                    <p className="text-gray-500 text-sm">No rating yet.</p>
                  </div>
                )}
              </div>

              {/* Rate form */}
              {currentUser && currentUser.role === "citizen" ? (
                <div className="border border-emerald-200 rounded-xl overflow-hidden">
                  <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
                    <h3 className="font-semibold text-gray-800">
                      ✍️ {selectedReport.rating ? "Update Your Rating" : "Rate This Issue"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      After submitting, the submit button will disappear.
                    </p>
                  </div>

                  <div className="p-4 space-y-4">
                    {ratingSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
                        {ratingSuccess}
                      </div>
                    )}
                    {ratingError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        ⚠️ {ratingError}
                      </div>
                    )}

                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Select your rating:
                      </p>
                      <StarRating
                        rating={newRating}
                        onRate={setNewRating}
                        interactive={!hasSubmitted && !ratingLoading}
                      />
                      <div className="h-6 mt-2">
                        {newRating > 0 && (
                          <p className="text-sm font-semibold text-emerald-600">
                            {newRating === 1 && "Poor 😞"}
                            {newRating === 2 && "Fair 😐"}
                            {newRating === 3 && "Good 🙂"}
                            {newRating === 4 && "Very Good 😃"}
                            {newRating === 5 && "Excellent 🤩"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        disabled={hasSubmitted}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-gray-50 text-sm resize-none outline-none disabled:opacity-60"
                        placeholder="Share your thoughts..."
                        value={newFeedback}
                        onChange={(e) => setNewFeedback(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {["Fixed quickly ⚡", "Great work 👏", "Took too long ⏱️", "Professional 👷", "Could be better 🔧"].map(
                        (chip) => (
                          <button
                            key={chip}
                            type="button"
                            disabled={hasSubmitted}
                            onClick={() =>
                              setNewFeedback((prev) => (prev ? `${prev}, ${chip}` : chip))
                            }
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-emerald-100 hover:text-emerald-700 transition border border-gray-200 disabled:opacity-60"
                          >
                            {chip}
                          </button>
                        )
                      )}
                    </div>

                    {/* Submit button disappears after submit */}
                    {!hasSubmitted ? (
                      <button
                        onClick={handleSubmitRating}
                        disabled={ratingLoading || newRating === 0}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                      >
                        {ratingLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Submitting...
                          </>
                        ) : newRating === 0 ? (
                          "Select a star rating first"
                        ) : (
                          "Submit Rating"
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedReport(null)}
                        className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>
              ) : !currentUser ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <p className="text-blue-700 text-sm font-medium mb-3">
                    🔒 Login as a Citizen to rate this issue
                  </p>
                  <Link
                    href="/login"
                    className="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Login Now →
                  </Link>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-gray-600 text-sm">
                    Only citizens can rate. You are logged in as <strong>{currentUser.role}</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setSelectedReport(null)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}