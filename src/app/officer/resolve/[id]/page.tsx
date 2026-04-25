"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import ImageUploader from "@/components/ImageUploader"

export default function ResolveReportPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string

  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [completionNotes, setCompletionNotes] = useState("")
  const [resolvedImageUrl, setResolvedImageUrl] = useState("")
  const [error, setError] = useState("")
  const [notesError, setNotesError] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "officer" && parsedUser.role !== "admin") {
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

      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        setError("Server returned invalid response")
        return
      }

      const data = await res.json()

      if (res.ok) {
        if (data.report?.status === "resolved") {
          setError("This report has already been resolved.")
        }
        setReport(data.report)
      } else {
        setError(data.error || "Failed to fetch report.")
      }
    } catch {
      setError("Failed to fetch report details.")
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    let isValid = true

    if (!completionNotes || completionNotes.trim().length === 0) {
      setNotesError("Completion notes are required.")
      isValid = false
    } else if (completionNotes.trim().length < 20) {
      setNotesError(
        `Please provide at least 20 characters. (${completionNotes.trim().length}/20)`
      )
      isValid = false
    } else {
      setNotesError("")
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const confirmed = window.confirm(
      "Are you sure you want to mark this report as RESOLVED? This action cannot be undone."
    )
    if (!confirmed) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/officer/reports/${reportId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "resolved",
          resolvedImageUrl: resolvedImageUrl || null,
          completionNotes: completionNotes.trim(),
        }),
      })

      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        alert("Server error: unexpected response format")
        return
      }

      const data = await res.json()

      if (res.ok && data.success) {
        alert("✅ Report has been marked as resolved successfully!")
        router.push("/officer/dashboard")
      } else {
        throw new Error(data.error || "Failed to update report.")
      }
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Report Details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">🏛️</span>
                <span className="text-xl font-bold text-emerald-600">CityWatch</span>
              </Link>
              <div className="hidden md:block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                🔧 Resolve Report
              </div>
            </div>
            <Link
              href="/officer/dashboard"
              className="text-gray-600 hover:text-emerald-600 text-sm font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🔧 Mark Report as Resolved
          </h1>
          <p className="text-gray-600 mt-1">
            Provide completion notes to close this report. A proof photo is optional but recommended.
          </p>
        </div>

        {error ? (
          <div className="bg-white p-10 rounded-2xl text-center border border-red-200 shadow-sm">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-red-700 mb-2">
              Cannot Resolve This Report
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/officer/dashboard"
              className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
            >
              ← Back to Dashboard
            </Link>
          </div>
        ) : !report ? (
          <div className="bg-white p-10 rounded-2xl text-center border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Report Not Found
            </h2>
            <Link
              href="/officer/dashboard"
              className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
            >
              ← Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="font-bold text-lg text-gray-900 mb-4">📋 Report Details</h2>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      Title
                    </p>
                    <p className="font-semibold text-gray-800">{report.title}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      Description
                    </p>
                    <p className="text-gray-600 leading-relaxed">{report.description}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      Location
                    </p>
                    <p className="text-gray-600">
                      📍 {report.location}, {report.city}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      Category
                    </p>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {report.category}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      Priority
                    </p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.priority === "urgent"
                          ? "bg-red-100 text-red-700"
                          : report.priority === "high"
                          ? "bg-orange-100 text-orange-700"
                          : report.priority === "medium"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {report.priority?.charAt(0).toUpperCase() + report.priority?.slice(1)}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      Reported By
                    </p>
                    <p className="text-gray-600">👤 {report.user?.name}</p>
                    <p className="text-gray-500 text-xs">{report.user?.email}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      Submitted On
                    </p>
                    <p className="text-gray-600">
                      📅{" "}
                      {new Date(report.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {report.imageUrl && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="font-bold text-gray-900 mb-3">
                    📷 Citizen&apos;s Photo
                  </h2>
                  <img
                    src={report.imageUrl}
                    alt="Issue"
                    className="w-full rounded-xl object-contain max-h-48 bg-gray-100 p-2"
                  />
                </div>
              )}

              <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-200">
                <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-2">
                  🤖 Auto-Rating Preview
                </p>
                <div className="space-y-1 text-xs text-yellow-800">
                  <div className="flex justify-between">
                    <span>★★★★★ Excellent</span>
                    <span className="font-medium">Within 24h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>★★★★☆ Very Good</span>
                    <span className="font-medium">3 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>★★★☆☆ Good</span>
                    <span className="font-medium">7 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>★★☆☆☆ Fair</span>
                    <span className="font-medium">14 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>★☆☆☆☆ Poor</span>
                    <span className="font-medium">14+ days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="font-bold text-xl text-gray-900 mb-2">
                  ✅ Resolution Details
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Completion notes are required. Proof photo is optional.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Completion Notes */}
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-gray-700">
                      Completion Notes <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Describe what was done to fix this issue. Minimum 20 characters.
                    </p>
                    <textarea
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-xl text-gray-900 bg-white resize-none transition outline-none focus:ring-2 ${
                        notesError
                          ? "border-red-400 focus:ring-red-300"
                          : completionNotes.trim().length >= 20
                          ? "border-green-400 focus:ring-green-300"
                          : "border-gray-200 focus:ring-blue-300"
                      }`}
                      placeholder="e.g., Road repaired and surface leveled. Area cleaned and inspected. Safe for traffic."
                      value={completionNotes}
                      onChange={(e) => {
                        setCompletionNotes(e.target.value)
                        if (e.target.value.trim().length === 0) {
                          setNotesError("Completion notes are required.")
                        } else if (e.target.value.trim().length < 20) {
                          setNotesError(
                            `At least 20 characters required. (${e.target.value.trim().length}/20)`
                          )
                        } else {
                          setNotesError("")
                        }
                      }}
                    />

                    <div className="flex justify-between items-center mt-1.5">
                      <div>
                        {notesError ? (
                          <p className="text-red-500 text-xs flex items-center gap-1">
                            ⚠️ {notesError}
                          </p>
                        ) : completionNotes.trim().length >= 20 ? (
                          <p className="text-green-600 text-xs flex items-center gap-1">
                            ✅ Looks good!
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={`text-xs font-mono ${
                          completionNotes.trim().length >= 20
                            ? "text-green-600"
                            : completionNotes.trim().length > 0
                            ? "text-orange-500"
                            : "text-gray-400"
                        }`}
                      >
                        {completionNotes.trim().length} / 20 min
                      </span>
                    </div>
                  </div>

                  {/* Proof Photo */}
                  <ImageUploader
                    label="Proof of Resolution Photo"
                    required={false}
                    value={resolvedImageUrl}
                    onChange={setResolvedImageUrl}
                    helpText="Upload a photo showing the issue has been fixed. This will be visible to the citizen and public."
                    placeholder="https://i.ibb.co/example/proof.jpg"
                    previewMaxHeight="max-h-56"
                  />

                  {/* Checklist */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                      Submission Checklist:
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            completionNotes.trim().length >= 20
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        >
                          {completionNotes.trim().length >= 20 ? "✓" : "1"}
                        </span>
                        <span
                          className={
                            completionNotes.trim().length >= 20
                              ? "text-green-700 line-through"
                              : "text-gray-600"
                          }
                        >
                          Completion notes filled (required)
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                            resolvedImageUrl ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          {resolvedImageUrl ? "✓" : "2"}
                        </span>
                        <span
                          className={
                            resolvedImageUrl
                              ? "text-green-700 line-through"
                              : "text-gray-600"
                          }
                        >
                          Proof photo provided (optional)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">⚠️</span>
                      <div>
                        <p className="font-semibold text-amber-800 text-sm">
                          Important Notice
                        </p>
                        <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                          Marking this report as resolved is permanent. A performance rating
                          will be automatically assigned based on resolution speed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4">
                    <Link
                      href="/officer/dashboard"
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition text-center text-sm"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={submitting || completionNotes.trim().length < 20}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition hover:from-blue-700 hover:to-sky-600 flex items-center justify-center gap-2"
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
                      ) : (
                        "✅ Mark as Resolved"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}