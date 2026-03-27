"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
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
  imageUrl: string | null
  resolvedImageUrl: string | null
  rating: number | null
  feedback: string | null
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  department: { name: string } | null
  user: { name: string; email: string }
  assignments: {
    id: string
    officer: { name: string; email: string }
    assignedAt: string
    claimedAt: string | null
    completedAt: string | null
    notes: string | null
  }[]
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
  "in-progress": "bg-blue-100 text-blue-700 border-blue-300",
  resolved: "bg-green-100 text-green-700 border-green-300",
}

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
}

const categoryIcons: Record<string, string> = {
  Water: "💧",
  Waste: "🗑️",
  Roads: "🛣️",
  Electricity: "⚡",
  Health: "🏥",
}

export default function ReportDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

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

  const getStatusStep = (status: string) => {
    if (status === "pending") return 1
    if (status === "in-progress") return 2
    if (status === "resolved") return 3
    return 0
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report details...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h2>
          <p className="text-gray-600 mb-4">This report doesn't exist or has been deleted.</p>
          <Link
            href="/citizen/my-reports"
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
          >
            Back to My Reports
          </Link>
        </div>
      </div>
    )
  }

  const statusStep = getStatusStep(report.status)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <span className="text-xl font-bold text-emerald-600">CityWatch</span>
            </Link>
            <Link
              href="/citizen/my-reports"
              className="text-gray-600 hover:text-emerald-600 font-medium"
            >
              ← Back to My Reports
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Report Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl">
              {categoryIcons[report.category] || "📋"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
                {report.isEmergency && (
                  <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full animate-pulse">
                    🚨 Emergency
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 text-sm rounded-full border ${statusColors[report.status]}`}>
                  {report.status === "pending"
                    ? "⏳ Pending"
                    : report.status === "in-progress"
                    ? "🔄 In Progress"
                    : "✅ Resolved"}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${priorityColors[report.priority]}`}>
                  {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)} Priority
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {report.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Progress Tracker</h2>
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-12 right-12 h-1 bg-gray-200">
              <div
                className={`h-full transition-all duration-500 ${
                  statusStep >= 3 ? "bg-green-500 w-full" :
                  statusStep >= 2 ? "bg-blue-500 w-2/3" :
                  "bg-yellow-500 w-0"
                }`}
              />
            </div>

            {/* Steps */}
            <div className="relative z-10 flex-1 text-center">
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl ${
                statusStep >= 1 ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-400"
              }`}>
                📝
              </div>
              <p className="mt-2 text-sm font-medium text-gray-700">Submitted</p>
              <p className="text-xs text-gray-500">
                {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="relative z-10 flex-1 text-center">
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl ${
                statusStep >= 2 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-400"
              }`}>
                🔧
              </div>
              <p className="mt-2 text-sm font-medium text-gray-700">In Progress</p>
              <p className="text-xs text-gray-500">
                {statusStep >= 2 ? "Working on it" : "Waiting"}
              </p>
            </div>

            <div className="relative z-10 flex-1 text-center">
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl ${
                statusStep >= 3 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
              }`}>
                ✅
              </div>
              <p className="mt-2 text-sm font-medium text-gray-700">Resolved</p>
              <p className="text-xs text-gray-500">
                {report.resolvedAt
                  ? new Date(report.resolvedAt).toLocaleDateString()
                  : "Pending"}
              </p>
            </div>
          </div>
        </div>

        {/* Report Details */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Report Details</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Description</label>
              <p className="text-gray-900 mt-1">{report.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Location</label>
                <p className="text-gray-900 mt-1">📍 {report.location}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">City</label>
                <p className="text-gray-900 mt-1">🏙️ {report.city}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Category</label>
                <p className="text-gray-900 mt-1">
                  {categoryIcons[report.category]} {report.category}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Department</label>
                <p className="text-gray-900 mt-1">
                  🏢 {report.department?.name || "Not Assigned"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Submitted On</label>
                <p className="text-gray-900 mt-1">
                  📅 {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Priority</label>
                <p className={`mt-1 inline-block px-3 py-1 text-sm rounded-full ${priorityColors[report.priority]}`}>
                  {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Photos */}
        {(report.imageUrl || report.resolvedImageUrl) && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Photos</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {report.imageUrl && (
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">Before Photo</label>
                  <div className="bg-gray-100 rounded-xl p-4 text-center">
                    <img
                      src={report.imageUrl}
                      alt="Before"
                      className="w-full max-h-64 object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}
              {report.resolvedImageUrl && (
                <div>
                  <label className="text-sm text-gray-500 mb-2 block">After Photo (Resolution Proof)</label>
                  <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
                    <img
                      src={report.resolvedImageUrl}
                      alt="After"
                      className="w-full max-h-64 object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assigned Officer */}
        {report.assignments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Assigned Officer</h2>
            {report.assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {assignment.officer.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{assignment.officer.name}</p>
                  <p className="text-sm text-gray-600">{assignment.officer.email}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}</p>
                  {assignment.completedAt && (
                    <p>Completed: {new Date(assignment.completedAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feedback Section */}
        {report.status === "resolved" && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Feedback</h2>
            {report.rating ? (
              <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⭐</span>
                  <span className="text-2xl font-bold text-gray-900">{report.rating}/5</span>
                </div>
                {report.feedback && (
                  <p className="text-gray-700 italic">"{report.feedback}"</p>
                )}
              </div>
            ) : (
              <div className="text-center p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="text-4xl mb-3">⭐</div>
                <p className="text-gray-700 mb-4">This report has been resolved. Please rate the service!</p>
                <Link
                  href={`/citizen/feedback/${report.id}`}
                  className="inline-block px-6 py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition"
                >
                  Rate This Service
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/citizen/my-reports"
            className="flex-1 text-center py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            ← Back to My Reports
          </Link>
          <Link
            href="/citizen/report"
            className="flex-1 text-center py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
          >
            Submit New Report
          </Link>
        </div>
      </main>
    </div>
  )
}