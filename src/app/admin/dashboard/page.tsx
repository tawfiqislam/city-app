"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    emergency: 0,
    unassigned: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [broadcastData, setBroadcastData] = useState({
    title: "",
    message: "",
    severity: "info",
    targetCity: "",
    targetAll: true,
  })
  const [broadcastLoading, setBroadcastLoading] = useState(false)
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
      })

      if (reportsRes.ok) {
        const data = await reportsRes.json()
        const reports = data.reports || []

        setStats({
          total: reports.length,
          pending: reports.filter((r: any) => r.status === "pending").length,
          inProgress: reports.filter((r: any) => r.status === "in-progress").length,
          resolved: reports.filter((r: any) => r.status === "resolved").length,
          emergency: reports.filter((r: any) => r.isEmergency).length,
          unassigned: reports.filter((r: any) => !r.department).length,
        })

        setRecentActivity(reports.slice(0, 8))
      }
    } catch (error) {
      console.error("Dashboard data error:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()

    const confirmed = window.confirm("Are you sure you want to send this emergency broadcast?")
    if (!confirmed) return

    setBroadcastLoading(true)

    try {
      const token = localStorage.getItem("token")

      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(broadcastData),
      })

      const data = await res.json()

      if (res.ok) {
        alert(`✅ Broadcast sent successfully to ${data.recipientCount} citizens!`)
        setShowBroadcast(false)
        setBroadcastData({
          title: "",
          message: "",
          severity: "info",
          targetCity: "",
          targetAll: true,
        })
      } else {
        alert("❌ " + (data.error || "Failed to send broadcast"))
      }
    } catch (error) {
      alert("❌ Failed to send broadcast")
    } finally {
      setBroadcastLoading(false)
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
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">🏛️</span>
                <span className="text-xl font-bold text-emerald-600">CityWatch</span>
              </Link>
              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                👨‍💼 Admin Panel
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">{user?.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard 🎛️</h1>
              <p className="text-purple-100">Welcome, {user?.name}! Manage your city services.</p>
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total Reports", value: stats.total, icon: "📝", color: "bg-gray-100 border-gray-200" },
            { label: "Pending", value: stats.pending, icon: "⏳", color: "bg-yellow-50 border-yellow-200" },
            { label: "In Progress", value: stats.inProgress, icon: "🔄", color: "bg-blue-50 border-blue-200" },
            { label: "Resolved", value: stats.resolved, icon: "✅", color: "bg-green-50 border-green-200" },
            { label: "Emergency", value: stats.emergency, icon: "🚨", color: "bg-red-50 border-red-200" },
            { label: "Unassigned", value: stats.unassigned, icon: "❗", color: "bg-orange-50 border-orange-200" },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} p-5 rounded-xl border`}>
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setShowBroadcast(true)}
            className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-6 rounded-2xl text-left transition shadow-lg group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🚨</div>
            <h3 className="text-xl font-bold mb-1">Emergency Broadcast</h3>
            <p className="text-red-100 text-sm">Send urgent alerts to citizens</p>
          </button>

          <Link
            href="/admin/reports"
            className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-2xl text-left transition shadow-lg group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📊</div>
            <h3 className="text-xl font-bold mb-1">Manage Reports</h3>
            <p className="text-blue-100 text-sm">View, assign & manage all reports</p>
          </Link>

          <Link
            href="/admin/departments"
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-6 rounded-2xl text-left transition shadow-lg group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏢</div>
            <h3 className="text-xl font-bold mb-1">Departments & Staff</h3>
            <p className="text-emerald-100 text-sm">Manage departments & officers</p>
          </Link>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Reports */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">📝 Recent Reports</h2>
              <Link href="/admin/reports" className="text-purple-600 hover:underline text-sm">
                View All →
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-gray-500">No reports yet</p>
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
                    <span className="text-xl">
                      {report.isEmergency ? "🚨" :
                       report.status === "resolved" ? "✅" :
                       report.status === "in-progress" ? "🔄" : "⏳"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{report.title}</p>
                      <p className="text-xs text-gray-500">{report.user?.name} • {report.location}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        report.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        report.status === "in-progress" ? "bg-blue-100 text-blue-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {report.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">{getTimeAgo(report.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Overview */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Overview</h2>

            {/* Resolution Rate */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Resolution Rate</span>
                <span className="text-sm font-bold text-gray-900">
                  {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.total > 0 ? (stats.resolved / stats.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Status Bars */}
            <div className="space-y-4">
              {[
                { label: "Pending", value: stats.pending, total: stats.total, color: "bg-yellow-500", icon: "⏳" },
                { label: "In Progress", value: stats.inProgress, total: stats.total, color: "bg-blue-500", icon: "🔄" },
                { label: "Resolved", value: stats.resolved, total: stats.total, color: "bg-green-500", icon: "✅" },
                { label: "Emergencies", value: stats.emergency, total: stats.total, color: "bg-red-500", icon: "🚨" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">{item.icon} {item.label}</span>
                    <span className="text-sm font-medium text-gray-900">{item.value} / {item.total}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                <Link href="/admin/reports" className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <span>📋</span>
                  <span className="text-sm font-medium text-gray-700">All Reports</span>
                </Link>
                <Link href="/admin/departments" className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <span>🏢</span>
                  <span className="text-sm font-medium text-gray-700">Departments</span>
                </Link>
                <Link href="/admin/assign" className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <span>👮</span>
                  <span className="text-sm font-medium text-gray-700">Assign Staff</span>
                </Link>
                <Link href="/public/resolved" className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <span>✅</span>
                  <span className="text-sm font-medium text-gray-700">Public Feed</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {stats.unassigned > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-2xl">❗</div>
                <div>
                  <h3 className="text-lg font-bold text-orange-800">{stats.unassigned} Unassigned Reports</h3>
                  <p className="text-orange-700 text-sm">These need to be assigned to a department</p>
                </div>
              </div>
              <Link href="/admin/reports" className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition">
                Assign Now →
              </Link>
            </div>
          </div>
        )}

        {stats.emergency > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-2xl animate-pulse">🚨</div>
                <div>
                  <h3 className="text-lg font-bold text-red-800">{stats.emergency} Emergency Reports</h3>
                  <p className="text-red-700 text-sm">These need immediate attention</p>
                </div>
              </div>
              <Link href="/admin/reports" className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition">
                View Now →
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Broadcast Modal */}
      {showBroadcast && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowBroadcast(false) }}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🚨 Emergency Broadcast</h2>
              <button onClick={() => setShowBroadcast(false)} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">✕</button>
            </div>

            <form onSubmit={sendBroadcast} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Title *</label>
                <input type="text" required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900" placeholder="Emergency title" value={broadcastData.title} onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Message *</label>
                <textarea required rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900" placeholder="Emergency message..." value={broadcastData.message} onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Severity</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900" value={broadcastData.severity} onChange={(e) => setBroadcastData({ ...broadcastData, severity: e.target.value })}>
                  <option value="info">ℹ️ Information</option>
                  <option value="warning">⚠️ Warning</option>
                  <option value="critical">🚨 Critical</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={broadcastData.targetAll} onChange={(e) => setBroadcastData({ ...broadcastData, targetAll: e.target.checked })} className="w-5 h-5 text-red-600 rounded" />
                <span className="text-gray-700">Send to all citizens</span>
              </label>
              {!broadcastData.targetAll && (
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900" value={broadcastData.targetCity} onChange={(e) => setBroadcastData({ ...broadcastData, targetCity: e.target.value })}>
                  <option value="">Select city</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chattogram">Chattogram</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Sylhet">Sylhet</option>
                </select>
              )}
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowBroadcast(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={broadcastLoading} className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50">{broadcastLoading ? "Sending..." : "🚀 Send Broadcast"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}