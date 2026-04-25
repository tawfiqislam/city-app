"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function FeedbackPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string

  const [report, setReport] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [alreadyRated, setAlreadyRated] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    const user = JSON.parse(userData)
    if (user.role !== "citizen") {
      router.push("/login")
      return
    }
    fetchReport()
  }, [reportId])

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setReport(data.report)
        if (data.report.rating) {
          setAlreadyRated(true)
          setRating(data.report.rating)
          setFeedback(data.report.feedback || "")
        }
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      alert("Please select a star rating to continue.")
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/reports/${reportId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, feedback }),
      })

      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        alert("Server error: unexpected response")
        return
      }

      if (res.ok) {
        alert("🎉 Thank you for your feedback!")
        router.push("/citizen/my-reports")
      } else {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit feedback")
      }
    } catch (error: any) {
      alert("❌ " + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const getRatingLabel = (r: number) => {
    if (r === 1) return "Poor 😞"
    if (r === 2) return "Fair 😐"
    if (r === 3) return "Good 🙂"
    if (r === 4) return "Very Good 😃"
    if (r === 5) return "Excellent 🤩"
    return ""
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Report Not Found
          </h2>
          <Link
            href="/citizen/my-reports"
            className="text-emerald-600 hover:underline"
          >
            ← Back to My Reports
          </Link>
        </div>
      </div>
    )
  }

  // Only citizens can rate, and only resolved reports
  if (report.status !== "resolved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Not Yet Resolved
          </h2>
          <p className="text-gray-600 mb-6">
            You can only rate a report after it has been resolved by an officer.
            This report is currently{" "}
            <strong className="text-blue-600">{report.status}</strong>.
          </p>
          <Link
            href="/citizen/my-reports"
            className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
          >
            ← Back to My Reports
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/citizen/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <span className="text-xl font-bold text-emerald-600">
                CityWatch
              </span>
            </Link>
            <Link
              href="/citizen/my-reports"
              className="text-gray-600 hover:text-emerald-600 text-sm"
            >
              ← Back to Reports
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">⭐</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {alreadyRated ? "Your Rating" : "Rate This Service"}
            </h1>
            <p className="text-gray-600">
              {alreadyRated
                ? "You have already submitted a rating for this report."
                : "Your feedback helps us improve city services for everyone."}
            </p>
          </div>

          {/* Resolved Report Summary */}
          <div className="bg-green-50 p-4 rounded-xl mb-8 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">✅</span>
              <span className="font-semibold text-green-700">
                Resolved Report
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{report.title}</h3>
            <p className="text-gray-600 text-sm mt-1">📍 {report.location}</p>
            <p className="text-gray-500 text-xs mt-1">
              🏢 {report.department?.name || "City Services"}
            </p>
            {report.resolvedAt && (
              <p className="text-green-600 text-xs mt-1 font-medium">
                ✅ Resolved on{" "}
                {new Date(report.resolvedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>

          {/* If already rated, show existing rating */}
          {alreadyRated ? (
            <div className="text-center space-y-4">
              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                <p className="text-sm text-gray-500 mb-2">Your Rating</p>
                <div className="flex justify-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-4xl ${
                        i < rating ? "text-yellow-400" : "text-gray-200"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="font-semibold text-gray-700 text-lg">
                  {getRatingLabel(rating)}
                </p>
                {feedback && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-yellow-100 text-left">
                    <p className="text-xs text-gray-400 mb-1">Your Comment</p>
                    <p className="text-gray-700 italic text-sm">
                      &quot;{feedback}&quot;
                    </p>
                  </div>
                )}
              </div>
              <Link
                href="/citizen/my-reports"
                className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
              >
                ← Back to My Reports
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Star Rating */}
              <div className="text-center">
                <label className="block text-lg font-semibold mb-4 text-gray-700">
                  How would you rate the resolution?
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className={`text-5xl transition-all duration-150 hover:scale-110 focus:outline-none ${
                        star <= (hoverRating || rating)
                          ? "text-yellow-400 drop-shadow-md scale-110"
                          : "text-gray-200 hover:text-yellow-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className="mt-3 h-8 flex items-center justify-center">
                  {(hoverRating || rating) > 0 && (
                    <p className="font-semibold text-lg text-emerald-600">
                      {getRatingLabel(hoverRating || rating)}
                    </p>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Add a Comment
                  <span className="ml-1 text-gray-400 font-normal">
                    (Optional)
                  </span>
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-gray-50 resize-none"
                  placeholder="Tell us what you thought about the service..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              {/* Quick Comment Chips */}
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">
                  Quick options (click to add):
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Fixed quickly ⚡",
                    "Professional staff 👷",
                    "Problem fully resolved ✅",
                    "Good communication 📞",
                    "Could be faster ⏱️",
                    "Needs improvement 🔧",
                  ].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setFeedback((prev) =>
                          prev ? `${prev}, ${option}` : option
                        )
                      }
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-emerald-100 hover:text-emerald-700 transition border border-gray-200 hover:border-emerald-300"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Submitting...
                  </>
                ) : rating === 0 ? (
                  "Please Select a Star Rating"
                ) : (
                  "Submit Rating & Comment"
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Only you can submit this rating. It will be visible publicly
                on the Resolved Issues page.
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}