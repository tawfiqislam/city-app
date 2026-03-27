"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface ResolvedReport {
  id: string
  title: string
  category: string
  location: string
  city: string
  resolvedAt: string
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

export default function PublicResolvedPage() {
  const [reports, setReports] = useState<ResolvedReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResolvedReports()
  }, [])

  const fetchResolvedReports = async () => {
    try {
      const res = await fetch("/api/public/resolved")
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
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <span className="text-xl font-bold">CityWatch</span>
            </Link>
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ✅ Recently Resolved Issues
          </h1>
          <p className="text-xl text-gray-600">
            See how we're making our city better, one issue at a time
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-green-50 p-6 rounded-xl text-center border border-green-200">
            <div className="text-4xl font-bold text-green-600">{reports.length}</div>
            <div className="text-green-700">Issues Resolved</div>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl text-center border border-blue-200">
            <div className="text-4xl font-bold text-blue-600">6</div>
            <div className="text-blue-700">Departments Active</div>
          </div>
          <div className="bg-yellow-50 p-6 rounded-xl text-center border border-yellow-200">
            <div className="text-4xl font-bold text-yellow-600">48h</div>
            <div className="text-yellow-700">Avg Resolution Time</div>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl text-center border border-purple-200">
            <div className="text-4xl font-bold text-purple-600">4.5⭐</div>
            <div className="text-purple-700">Avg Satisfaction</div>
          </div>
        </div>

        {/* Resolved Reports */}
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Resolved Reports Yet</h3>
              <p className="text-gray-600">Check back soon!</p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                      {categoryIcons[report.category] || "✅"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{report.title}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          ✅ Resolved
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <span>📍 {report.location}</span>
                        <span>🏙️ {report.city}</span>
                        <span>🏢 {report.department?.name || "City Services"}</span>
                        <span>📅 {new Date(report.resolvedAt).toLocaleDateString()}</span>
                      </div>
                      {report.feedback && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-1 mb-1">
                            {Array.from({ length: report.rating || 0 }).map((_, i) => (
                              <span key={i}>⭐</span>
                            ))}
                          </div>
                          <p className="text-gray-600 text-sm italic">"{report.feedback}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Have an Issue to Report?</h2>
          <p className="mb-6 text-emerald-100">
            Join thousands of citizens making our city better
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-white text-emerald-600 rounded-xl font-medium hover:bg-emerald-50 transition"
          >
            Get Started for Free
          </Link>
        </div>
      </main>
    </div>
  )
}