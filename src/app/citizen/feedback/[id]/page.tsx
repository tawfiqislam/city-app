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

  useEffect(() => {
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
        setRating(data.report.rating || 0)
        setFeedback(data.report.feedback || "")
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
      alert("Please select a rating")
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

      if (res.ok) {
        alert("Thank you for your feedback!")
        router.push("/citizen/my-reports")
      } else {
        throw new Error("Failed to submit feedback")
      }
    } catch (error) {
      alert("Failed to submit feedback")
    } finally {
      setSubmitting(false)
    }
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

  if (!report || report.status !== "resolved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cannot Rate This Report</h2>
          <p className="text-gray-600 mb-4">This report is not yet resolved or doesn't exist.</p>
          <Link href="/citizen/my-reports" className="text-emerald-600 hover:underline">
            ← Back to My Reports
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/citizen/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <span className="text-xl font-bold text-emerald-600">CityWatch</span>
            </Link>
            <Link
              href="/citizen/my-reports"
              className="text-gray-600 hover:text-emerald-600"
            >
              ← Back to Reports
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">⭐</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rate This Service</h1>
            <p className="text-gray-600">Your feedback helps us improve</p>
          </div>

          {/* Report Summary */}
          <div className="bg-green-50 p-4 rounded-xl mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">✅</span>
              <span className="font-medium text-green-700">Resolved Report</span>
            </div>
            <h3 className="font-bold text-gray-900">{report.title}</h3>
            <p className="text-gray-600 text-sm">{report.location}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div className="text-center">
              <label className="block text-lg font-medium mb-4 text-gray-700">
                How would you rate the service?
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="text-5xl transition-transform hover:scale-110"
                  >
                    {star <= (hoverRating || rating) ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-gray-600">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            </div>

            {/* Feedback Text */}
            <div>
              <label className="block text-lg font-medium mb-2 text-gray-700">
                Share your experience (optional)
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                placeholder="Tell us about your experience..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            {/* Quick Feedback Options */}
            <div className="flex flex-wrap gap-2">
              {[
                "Quick response",
                "Professional service",
                "Problem fully fixed",
                "Friendly staff",
                "Could be better",
              ].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFeedback((prev) => prev ? `${prev}, ${option}` : option)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-emerald-100 hover:text-emerald-700 transition"
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg font-medium rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition"
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}