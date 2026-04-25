"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import StatisticsCharts from "@/components/StatisticsCharts"

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    emergency: 0,
    unassigned: 0,
  })
  const [reports, setReports] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "admin") {
      router.push("/login")
      return
    }
    setUser(parsedUser)
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")
      const reportsRes = await fetch("/api/admin/all-reports", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })

      if (reportsRes.ok) {
        const data = await reportsRes.json()
        const allReports = data.reports || []
        setReports(allReports)
        setStats({
          total: allReports.length,
          pending: allReports.filter((r: any) => r.status === "pending").length,
          inProgress: allReports.filter(
            (r: any) => r.status === "in-progress"
          ).length,
          resolved: allReports.filter((r: any) => r.status === "resolved")
            .length,
          emergency: allReports.filter((r: any) => r.isEmergency).length,
          unassigned: allReports.filter((r: any) => !r.department).length,
        })
        setRecentActivity(allReports.slice(0, 8))
      }
    } catch (error) {
      console.error("Dashboard data error:", error)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.clear()
    router.push("/login")
  }

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
    if (minutes > 0) return `${minutes} min${minutes > 1 ? "s" : ""} ago`
    return "Just now"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">🏛️</span>
                <span className="text-xl font-bold text-emerald-600">
                  CityWatch
                </span>
              </Link>
              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Admin Panel 👑
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* WELCOME BANNER */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Admin Dashboard 👑
              </h1>
              <p className="text-purple-100">
                Welcome, {user?.name}! Manage city services and monitor
                analytics.
              </p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-purple-200 text-sm">Today</p>
              <p className="text-xl font-bold">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Banner quick action buttons */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin/add-officer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-semibold transition"
            >
              <span>👮</span>
              <span>Add New Officer</span>
            </Link>
            <Link
              href="/admin/broadcast"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/80 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition"
            >
              <span>🚨</span>
              <span>Emergency Broadcast</span>
            </Link>
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-semibold transition"
            >
              <span>📋</span>
              <span>View All Reports</span>
            </Link>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            {
              label: "Total Reports",
              value: stats.total,
              icon: "📝",
              color: "bg-gray-100 border-gray-200",
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: "⏳",
              color: "bg-yellow-50 border-yellow-200",
            },
            {
              label: "In Progress",
              value: stats.inProgress,
              icon: "🔄",
              color: "bg-blue-50 border-blue-200",
            },
            {
              label: "Resolved",
              value: stats.resolved,
              icon: "✅",
              color: "bg-green-50 border-green-200",
            },
            {
              label: "Emergency",
              value: stats.emergency,
              icon: "🚨",
              color: "bg-red-50 border-red-200",
            },
            {
              label: "Unassigned",
              value: stats.unassigned,
              icon: "❗",
              color: "bg-orange-50 border-orange-200",
            },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} p-5 rounded-xl border`}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* QUICK LINKS */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/admin/reports"
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              📋
            </div>
            <div>
              <p className="font-bold text-gray-900">Manage Reports</p>
              <p className="text-sm text-gray-500">All reports</p>
            </div>
          </Link>

          <Link
            href="/admin/departments"
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🏢
            </div>
            <div>
              <p className="font-bold text-gray-900">Departments</p>
              <p className="text-sm text-gray-500">Staff & directory</p>
            </div>
          </Link>

          <Link
            href="/admin/add-officer"
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              👮
            </div>
            <div>
              <p className="font-bold text-gray-900">Add Officer</p>
              <p className="text-sm text-gray-500">Create officer accounts</p>
            </div>
          </Link>

          <Link
            href="/admin/broadcast"
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-4 group"
          >
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🚨
            </div>
            <div>
              <p className="font-bold text-gray-900">Broadcast</p>
              <p className="text-sm text-gray-500">Send city alerts</p>
            </div>
          </Link>
        </div>

        {/* ALERT BANNERS */}
        {stats.unassigned > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-xl text-white">
                  ❗
                </div>
                <div>
                  <h3 className="font-bold text-orange-800">
                    {stats.unassigned} Unassigned Reports
                  </h3>
                  <p className="text-orange-600 text-sm">
                    These reports need to be assigned to a department
                  </p>
                </div>
              </div>
              <Link
                href="/admin/reports"
                className="px-5 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition text-sm"
              >
                Assign Now →
              </Link>
            </div>
          </div>
        )}

        {stats.emergency > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-xl animate-pulse">
                  🚨
                </div>
                <div>
                  <h3 className="font-bold text-red-800">
                    {stats.emergency} Emergency Reports
                  </h3>
                  <p className="text-red-600 text-sm">
                    These require immediate attention
                  </p>
                </div>
              </div>
              <Link
                href="/admin/reports"
                className="px-5 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition text-sm"
              >
                View Now →
              </Link>
            </div>
          </div>
        )}

        {/* TWO COLUMN LAYOUT */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Reports */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                📝 Recent Reports
              </h2>
              <Link
                href="/admin/reports"
                className="text-purple-600 hover:underline text-sm font-medium"
              >
                View All →
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-gray-500 text-sm">No reports yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((report: any) => (
                  <div
                    key={report.id}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      report.isEmergency ? "bg-red-50" : "bg-gray-50"
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">
                      {report.isEmergency
                        ? "🚨"
                        : report.status === "resolved"
                        ? "✅"
                        : report.status === "in-progress"
                        ? "🔄"
                        : "⏳"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {report.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {report.user?.name} • {report.location}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          report.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : report.status === "in-progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {report.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {getTimeAgo(report.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Overview */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📊 Overview
            </h2>

            {/* Resolution Rate */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Resolution Rate</span>
                <span className="text-sm font-bold text-gray-900">
                  {stats.total > 0
                    ? Math.round((stats.resolved / stats.total) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
                  style={{
                    width: `${
                      stats.total > 0
                        ? (stats.resolved / stats.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Status Bars */}
            <div className="space-y-4">
              {[
                {
                  label: "Pending",
                  value: stats.pending,
                  total: stats.total,
                  color: "bg-yellow-500",
                  icon: "⏳",
                },
                {
                  label: "In Progress",
                  value: stats.inProgress,
                  total: stats.total,
                  color: "bg-blue-500",
                  icon: "🔄",
                },
                {
                  label: "Resolved",
                  value: stats.resolved,
                  total: stats.total,
                  color: "bg-green-500",
                  icon: "✅",
                },
                {
                  label: "Emergency",
                  value: stats.emergency,
                  total: stats.total,
                  color: "bg-red-500",
                  icon: "🚨",
                },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {item.value} / {item.total}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{
                        width: `${
                          item.total > 0
                            ? (item.value / item.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/admin/add-officer"
                  className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-100"
                >
                  <span>👮</span>
                  <span className="text-sm font-medium text-purple-700">
                    Add Officer
                  </span>
                </Link>
                <Link
                  href="/admin/departments"
                  className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition border border-emerald-100"
                >
                  <span>🏢</span>
                  <span className="text-sm font-medium text-emerald-700">
                    Departments
                  </span>
                </Link>
                <Link
                  href="/admin/reports"
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200"
                >
                  <span>📋</span>
                  <span className="text-sm font-medium text-gray-700">
                    All Reports
                  </span>
                </Link>
                <Link
                  href="/public/resolved"
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition border border-gray-200"
                >
                  <span>✅</span>
                  <span className="text-sm font-medium text-gray-700">
                    Public Feed
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* STATISTICS CHARTS */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                City Statistics Dashboard
              </h2>
              <p className="text-gray-600 text-sm">
                Real-time analytics using Chart.js
              </p>
            </div>
          </div>
          <StatisticsCharts
            role="admin"
            reports={reports}
            userName={user?.name}
          />
        </div>
      </main>
    </div>
  )
}