"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function CitizenDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    inProgress: 0,
  })
  const [recentReports, setRecentReports] = useState<any[]>([])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "citizen") {
      router.push("/login")
      return
    }
    setUser(parsedUser)
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch("/api/citizen/reports", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        console.error("Failed to fetch reports:", res.status)
        return
      }

      const data = await res.json()
      const reports = data.reports || []

      setRecentReports(reports.slice(0, 5))

      setStats({
        total: reports.length,
        resolved: reports.filter((r: any) => r.status === "resolved").length,
        pending: reports.filter((r: any) => r.status === "pending").length,
        inProgress: reports.filter((r: any) => r.status === "in-progress").length,
      })
    } catch (error) {
      console.error("Error fetching reports:", error)
    }
  }

  const logout = () => {
    localStorage.clear()
    router.push("/login")
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
                👤 Citizen Dashboard
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{user?.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}! 👋</h1>
          <p className="text-emerald-100">Report issues and help improve your city</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/citizen/report"
            className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-2xl text-left transition shadow-lg"
          >
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-xl font-bold mb-1">Submit Report</h3>
            <p className="text-blue-100">Report a new city issue</p>
          </Link>

          <Link
            href="/citizen/my-reports"
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-6 rounded-2xl text-left transition shadow-lg"
          >
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-xl font-bold mb-1">My Reports</h3>
            <p className="text-emerald-100">Track your submitted reports</p>
          </Link>

          <Link
            href="/public/resolved"
            className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-2xl text-left transition shadow-lg"
          >
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-xl font-bold mb-1">Resolved Issues</h3>
            <p className="text-purple-100">View recent resolutions</p>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Reports", value: stats.total, icon: "📝", color: "bg-blue-100" },
            { label: "Resolved", value: stats.resolved, icon: "✅", color: "bg-green-100" },
            { label: "Pending", value: stats.pending, icon: "⏳", color: "bg-yellow-100" },
            { label: "In Progress", value: stats.inProgress, icon: "🔄", color: "bg-orange-100" },
          ].map((stat, index) => (
            <div key={index} className={`${stat.color} p-6 rounded-xl`}>
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Recent Reports</h2>
          {recentReports.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600 mb-4">No reports yet. Start by submitting one!</p>
              <Link
                href="/citizen/report"
                className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
              >
                Submit First Report
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="text-2xl">
                    {report.category === "Water" ? "💧" :
                     report.category === "Waste" ? "🗑️" :
                     report.category === "Roads" ? "🛣️" :
                     report.category === "Electricity" ? "⚡" : "📋"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{report.title}</p>
                    <p className="text-sm text-gray-500">
                      {report.category} • {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    report.status === "resolved" ? "bg-green-100 text-green-700" :
                    report.status === "in-progress" ? "bg-blue-100 text-blue-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </div>
              ))}
              <Link
                href="/citizen/my-reports"
                className="inline-block mt-2 text-emerald-600 font-medium hover:underline"
              >
                View all reports →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}