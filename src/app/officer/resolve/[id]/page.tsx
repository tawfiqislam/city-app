"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function ResolvePage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string

  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    status: "resolved",
    resolvedImageUrl: "",
    completionNotes: "",
  })

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    fetchReport()
  }, [reportId])

  const fetchReport = async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}`)
      if (!res.ok) {
        console.error("Failed to fetch report")
        return
      }
      const data = await res.json()
      setReport(data.report)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.status === "resolved" && !formData.resolvedImageUrl) {
      alert("Please provide a proof photo URL to mark as resolved")
      return
    }

    const confirmed = window.confirm("Are you sure you want to update this report?")
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
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        alert("✅ Report updated successfully!")
        router.push("/officer/dashboard")
      } else {
        alert("❌ " + (data.error || "Failed to update report"))
      }
    } catch (error) {
      console.error("Error:", error)
      alert("❌ Failed to update report")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Not Found</h2>
          <Link href="/officer/dashboard" className="text-emerald-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/officer/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🏛️</span>
            <span className="text-xl font-bold text-emerald-600">CityWatch</span>
          </Link>
          <Link href="/officer/dashboard" className="text-gray-600 hover:text-emerald-600">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 Resolve Report</h1>
        <p className="text-gray-600 mb-8">Update the status and add resolution proof</p>

        {/* Report Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Report Info</h2>
          <div className="space-y-2">
            <p><strong>Title:</strong> {report.title}</p>
            <p><strong>Category:</strong> {report.category}</p>
            <p><strong>Location:</strong> {report.location}, {report.city}</p>
            <p><strong>Status:</strong>
              <span className={`ml-2 px-3 py-1 text-sm rounded-full ${
                report.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                report.status === "in-progress" ? "bg-blue-100 text-blue-700" :
                "bg-green-100 text-green-700"
              }`}>{report.status}</span>
            </p>
            <p className="text-gray-600 mt-2">{report.description}</p>
          </div>
        </div>

        {/* Resolution Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Update Status</h2>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-gray-700">New Status</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: "in-progress" })}
                className={`flex-1 p-4 rounded-xl border-2 transition ${
                  formData.status === "in-progress" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
              >
                <span className="text-2xl block mb-1">🔄</span>
                <span className="font-medium">In Progress</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: "resolved" })}
                className={`flex-1 p-4 rounded-xl border-2 transition ${
                  formData.status === "resolved" ? "border-green-500 bg-green-50" : "border-gray-200"
                }`}
              >
                <span className="text-2xl block mb-1">✅</span>
                <span className="font-medium">Resolved</span>
              </button>
            </div>
          </div>

          {/* Proof Photo */}
          <div className={`mb-6 ${formData.status !== "resolved" ? "opacity-50" : ""}`}>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Proof Photo URL {formData.status === "resolved" && <span className="text-red-500">*Required</span>}
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900"
              placeholder="https://i.ibb.co/your-proof-image"
              value={formData.resolvedImageUrl}
              onChange={(e) => setFormData({ ...formData, resolvedImageUrl: e.target.value })}
              required={formData.status === "resolved"}
              disabled={formData.status !== "resolved"}
            />
            <p className="text-xs text-gray-500 mt-1">Upload image to imgBB and paste the URL here</p>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">Completion Notes</label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900"
              placeholder="Describe the work done..."
              value={formData.completionNotes}
              onChange={(e) => setFormData({ ...formData, completionNotes: e.target.value })}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Link
              href="/officer/dashboard"
              className="flex-1 py-4 bg-gray-100 text-gray-700 text-center rounded-xl font-medium hover:bg-gray-200 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {submitting ? "Updating..." : "Update Report"}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}