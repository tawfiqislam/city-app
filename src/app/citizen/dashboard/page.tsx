"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"

// Lazy load heavy chart component for better performance
const StatisticsCharts = dynamic(
  () => import("@/components/StatisticsCharts"),
  {
    loading: () => (
      <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500 text-sm">Loading statistics...</p>
      </div>
    ),
    ssr: false,
  }
)

interface Notice {
  id: string
  title: string
  message: string
  severity: string
  targetCity: string | null
  targetAll: boolean
  sentAt: string
  recipients: number
}

const SEVERITY_CONFIG: Record<
  string,
  {
    label: string
    color: string
    bg: string
    border: string
    icon: string
  }
> = {
  critical: {
    label: "Critical",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-400",
    icon: "🚨",
  },
  warning: {
    label: "Warning",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    icon: "⚠️",
  },
  info: {
    label: "Information",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-400",
    icon: "ℹ️",
  },
}

function getTimeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  if (minutes > 0) return `${minutes} min ago`
  return "Just now"
}

export default function CitizenDashboard() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)

  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    inProgress: 0,
  })
  const [allReports, setAllReports] = useState<any[]>([])
  const [recentReports, setRecentReports] = useState<any[]>([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [dbError, setDbError] = useState(false)

  const [notices, setNotices] = useState<Notice[]>([])
  const [noticesLoading, setNoticesLoading] = useState(true)
  const [noticesError, setNoticesError] = useState("")
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  const [noticeFilter, setNoticeFilter] = useState("all")
  const [showAllNotices, setShowAllNotices] = useState(false)

  const [pushPopup, setPushPopup] = useState<{
    title: string
    body: string
  } | null>(null)

  const [fcmSetupDone, setFcmSetupDone] = useState(false)

  // =============================================
  // STEP 1: AUTH CHECK
  // =============================================
  useEffect(() => {
    try {
      const userData = localStorage.getItem("user")
      const token = localStorage.getItem("token")

      if (!userData || !token) {
        router.push("/login")
        return
      }

      let parsedUser: any
      try {
        parsedUser = JSON.parse(userData)
      } catch {
        localStorage.clear()
        router.push("/login")
        return
      }

      if (!parsedUser || parsedUser.role !== "citizen") {
        router.push("/login")
        return
      }

      setUser(parsedUser)
      setAuthChecked(true)
    } catch (err) {
      console.error("Auth check error:", err)
      router.push("/login")
    }
  }, [router])

  // =============================================
  // STEP 2: FETCH DATA after auth confirmed
  // =============================================
  useEffect(() => {
    if (!authChecked) return

    fetchReports()
    fetchNotices()

    const interval = setInterval(() => {
      fetchNotices()
    }, 60000)

    return () => clearInterval(interval)
  }, [authChecked])

  // =============================================
  // STEP 3: FCM SETUP after auth, once only
  // =============================================
  useEffect(() => {
    if (!authChecked || fcmSetupDone) return
    setFcmSetupDone(true)

    const timer = setTimeout(() => {
      setupFCM()
    }, 2000)

    return () => clearTimeout(timer)
  }, [authChecked, fcmSetupDone])

  // =============================================
  // FCM PUSH NOTIFICATION SETUP
  // =============================================
  const setupFCM = async () => {
    try {
      if (typeof window === "undefined") return

      const token = localStorage.getItem("token")
      if (!token) return

      if (!("Notification" in window)) {
        console.log("Notifications not supported in this browser")
        return
      }

      if (!("serviceWorker" in navigator)) {
        console.log("Service workers not supported")
        return
      }

      console.log("Setting up FCM push notifications...")

      const firebaseModule = await import("@/lib/firebase-client")

      const requestFn = firebaseModule.requestNotificationPermission
      const listenFn = firebaseModule.listenForForegroundMessages

      if (typeof requestFn !== "function") {
        console.error(
          "requestNotificationPermission is not exported correctly"
        )
        return
      }

      if (typeof listenFn !== "function") {
        console.error(
          "listenForForegroundMessages is not exported correctly"
        )
        return
      }

      const fcmToken = await requestFn()

      if (fcmToken) {
        console.log("Saving FCM token to database...")
        const res = await fetch("/api/user/fcm-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fcmToken }),
        })

        if (res.ok) {
          console.log("FCM token saved successfully")
        } else {
          const errData = await res.json().catch(() => ({}))
          console.warn("Failed to save FCM token:", errData.error)
        }
      } else {
        console.log(
          "FCM token not obtained. User may have denied notifications."
        )
      }

      await listenFn((payload: any) => {
        console.log("Push notification received in foreground:", payload)

        setPushPopup({
          title: payload.notification?.title || "Emergency Alert",
          body: payload.notification?.body || "",
        })

        setTimeout(() => setPushPopup(null), 10000)

        fetchNotices()
      })

      console.log("FCM setup complete")
    } catch (err) {
      console.error("FCM setup error:", err)
    }
  }

  // =============================================
  // FETCH REPORTS
  // =============================================
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const res = await fetch("/api/citizen/reports", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })

      const contentType = res.headers.get("content-type") || ""
      if (!contentType.includes("application/json")) {
        setDbError(true)
        return
      }

      const data = await res.json()

      if (!res.ok) {
        console.error("Reports API error:", data.error)
        setDbError(true)
        return
      }

      const reports = data.reports || []
      setAllReports(reports)
      setRecentReports(reports.slice(0, 5))
      setStats({
        total: reports.length,
        resolved: reports.filter((r: any) => r.status === "resolved").length,
        pending: reports.filter((r: any) => r.status === "pending").length,
        inProgress: reports.filter(
          (r: any) => r.status === "in-progress"
        ).length,
      })
      setDbError(false)
    } catch (error) {
      console.error("Error fetching reports:", error)
      setDbError(true)
    } finally {
      setReportsLoading(false)
    }
  }

  // =============================================
  // FETCH EMERGENCY NOTICES
  // =============================================
  const fetchNotices = async () => {
    try {
      setNoticesError("")

      const res = await fetch("/api/public/emergency-notices", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })

      console.log("Notices API status:", res.status)

      const contentType = res.headers.get("content-type") || ""
      if (!contentType.includes("application/json")) {
        console.error(
          "Emergency notices API returned non-JSON. Make sure the route file exists."
        )
        setNoticesLoading(false)
        return
      }

      const data = await res.json()
      console.log("Notices loaded:", data.notices?.length ?? 0, "items")

      if (res.ok && data.notices) {
        setNotices(data.notices)
      } else {
        console.error("Notices API error:", data)
      }
    } catch (error) {
      console.error("Error fetching notices:", error)
      setNoticesError("Network error fetching notices")
    } finally {
      setNoticesLoading(false)
    }
  }

  const logout = () => {
    localStorage.clear()
    router.push("/login")
  }

  const filteredNotices = notices.filter((n) => {
    if (noticeFilter === "all") return true
    return n.severity === noticeFilter
  })

  const displayedNotices = showAllNotices
    ? filteredNotices
    : filteredNotices.slice(0, 3)

  const latestCritical = notices.find((n) => n.severity === "critical")

  // =============================================
  // SHOW SPINNER WHILE AUTH IS BEING CHECKED
  // =============================================
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==================== HEADER ==================== */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">🏛️</span>
                <span className="text-xl font-bold text-emerald-600">
                  CityWatch
                </span>
              </Link>
              <div className="hidden md:block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Citizen Dashboard
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:inline text-gray-600 text-sm font-medium">
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ==================== WELCOME BANNER ==================== */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome, {user?.name}! 👋
              </h1>
              <p className="text-emerald-100">
                Report issues and help improve your city
              </p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-emerald-200 text-sm">Today</p>
              <p className="text-lg font-semibold">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* ==================== EMERGENCY NOTICES ==================== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-xl">🚨</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Emergency Notices
                  {notices.length > 0 && (
                    <span
                      className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold animate-pulse"
                      aria-label={`${notices.length} emergency notices`}
                    >
                      {notices.length}
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-500">
                  City-wide alerts from administration • Auto-updates every 60s
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setNoticesLoading(true)
                fetchNotices()
              }}
              className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-sm flex items-center gap-1"
              aria-label="Refresh emergency notices"
            >
              <span aria-hidden="true">🔄</span>
              <span className="hidden md:inline">Refresh</span>
            </button>
          </div>

          {/* Critical banner */}
          {latestCritical && (
            <div
              className="bg-red-600 text-white rounded-2xl p-4 mb-4 cursor-pointer hover:bg-red-700 transition"
              onClick={() => setSelectedNotice(latestCritical)}
              role="button"
              aria-label={`Critical alert: ${latestCritical.title}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="text-3xl animate-bounce flex-shrink-0"
                  aria-hidden="true"
                >
                  🚨
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full font-bold">
                      CRITICAL ALERT
                    </span>
                    <span className="text-red-200 text-xs">
                      {getTimeAgo(latestCritical.sentAt)}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg truncate">
                    {latestCritical.title}
                  </h3>
                  <p className="text-red-100 text-sm line-clamp-1">
                    {latestCritical.message}
                  </p>
                </div>
                <span
                  className="text-white/70 flex-shrink-0 text-xl"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </div>
          )}

          {/* Filter tabs */}
          <div
            className="flex gap-2 flex-wrap mb-4"
            role="tablist"
            aria-label="Filter emergency notices"
          >
            {[
              { id: "all", label: "All", count: notices.length },
              {
                id: "critical",
                label: "🚨 Critical",
                count: notices.filter((n) => n.severity === "critical").length,
              },
              {
                id: "warning",
                label: "⚠️ Warning",
                count: notices.filter((n) => n.severity === "warning").length,
              },
              {
                id: "info",
                label: "ℹ️ Info",
                count: notices.filter((n) => n.severity === "info").length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={noticeFilter === tab.id}
                onClick={() => {
                  setNoticeFilter(tab.id)
                  setShowAllNotices(false)
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  noticeFilter === tab.id
                    ? "bg-red-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Notices list */}
          {noticesLoading ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">
                Loading emergency notices...
              </p>
            </div>
          ) : noticesError ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2" aria-hidden="true">⚠️</div>
              <p className="text-red-700 text-sm font-medium mb-3">
                {noticesError}
              </p>
              <button
                onClick={() => {
                  setNoticesLoading(true)
                  fetchNotices()
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm"
              >
                Try Again
              </button>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
              <div className="text-5xl mb-3" aria-hidden="true">✅</div>
              <h3 className="font-bold text-gray-900 mb-1">
                No Emergency Notices
              </h3>
              <p className="text-gray-500 text-sm">
                {noticeFilter === "all"
                  ? "No emergency broadcasts sent. Your city is safe!"
                  : `No ${noticeFilter} level notices at this time.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedNotices.map((notice) => {
                const config =
                  SEVERITY_CONFIG[notice.severity] || SEVERITY_CONFIG.info
                return (
                  <div
                    key={notice.id}
                    className={`bg-white rounded-2xl shadow-sm border-l-4 ${config.border} hover:shadow-md transition cursor-pointer`}
                    onClick={() => setSelectedNotice(notice)}
                    role="button"
                    aria-label={`${config.label}: ${notice.title}`}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}
                          aria-hidden="true"
                        >
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-gray-900 text-sm">
                              {notice.title}
                            </h3>
                            <span
                              className={`px-2 py-0.5 ${config.bg} ${config.color} text-xs rounded-full font-semibold`}
                            >
                              {config.label}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                            {notice.message}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                            <span>🕐 {getTimeAgo(notice.sentAt)}</span>
                            <span>
                              📅{" "}
                              {new Date(notice.sentAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            <span>
                              📍{" "}
                              {notice.targetAll
                                ? "Nationwide"
                                : notice.targetCity || "Specific area"}
                            </span>
                            <span>
                              👥 {notice.recipients.toLocaleString()} citizens
                            </span>
                          </div>
                        </div>
                        <span
                          className="text-gray-300 flex-shrink-0 text-lg"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {filteredNotices.length > 3 && (
                <button
                  onClick={() => setShowAllNotices(!showAllNotices)}
                  className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl hover:bg-gray-50 transition text-sm font-medium"
                >
                  {showAllNotices
                    ? "Show Less ▲"
                    : `Show All ${filteredNotices.length} Notices ▼`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ==================== DB ERROR ==================== */}
        {dbError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0" aria-hidden="true">
                ⚠️
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-700 mb-1">
                  Database Connection Issue
                </h3>
                <p className="text-red-600 text-sm mb-3">
                  Cannot connect to the database right now.
                </p>
                <button
                  onClick={() => {
                    setReportsLoading(true)
                    setDbError(false)
                    fetchReports()
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== QUICK ACTIONS ==================== */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/citizen/report"
            className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-2xl text-left transition shadow-lg group"
            aria-label="Submit a new city report"
          >
            <div
              className="text-4xl mb-3 group-hover:scale-110 transition-transform"
              aria-hidden="true"
            >
              📝
            </div>
            <h3 className="text-xl font-bold mb-1">Submit Report</h3>
            <p className="text-blue-100 text-sm">Report a new city issue</p>
          </Link>

          <Link
            href="/citizen/my-reports"
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white p-6 rounded-2xl text-left transition shadow-lg group"
            aria-label="View my submitted reports"
          >
            <div
              className="text-4xl mb-3 group-hover:scale-110 transition-transform"
              aria-hidden="true"
            >
              📋
            </div>
            <h3 className="text-xl font-bold mb-1">My Reports</h3>
            <p className="text-emerald-100 text-sm">
              Track your submitted reports
            </p>
          </Link>

          <Link
            href="/public/resolved"
            className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-2xl text-left transition shadow-lg group"
            aria-label="View resolved city issues"
          >
            <div
              className="text-4xl mb-3 group-hover:scale-110 transition-transform"
              aria-hidden="true"
            >
              ✅
            </div>
            <h3 className="text-xl font-bold mb-1">Resolved Issues</h3>
            <p className="text-purple-100 text-sm">
              View public resolved issues
            </p>
          </Link>
        </div>

        {/* ==================== STATS ==================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
            <div className="text-3xl mb-2" aria-hidden="true">📝</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-gray-600 text-sm">Total Reports</div>
          </div>
          <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm text-center">
            <div className="text-3xl mb-2" aria-hidden="true">✅</div>
            <div className="text-3xl font-bold text-green-700">
              {stats.resolved}
            </div>
            <div className="text-green-600 text-sm">Resolved</div>
          </div>
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 shadow-sm text-center">
            <div className="text-3xl mb-2" aria-hidden="true">⏳</div>
            <div className="text-3xl font-bold text-yellow-700">
              {stats.pending}
            </div>
            <div className="text-yellow-600 text-sm">Pending</div>
          </div>
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm text-center">
            <div className="text-3xl mb-2" aria-hidden="true">🔄</div>
            <div className="text-3xl font-bold text-blue-700">
              {stats.inProgress}
            </div>
            <div className="text-blue-600 text-sm">In Progress</div>
          </div>
        </div>

        {/* ==================== RECENT REPORTS ==================== */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Your Recent Reports
            </h2>
            <Link
              href="/citizen/my-reports"
              className="text-emerald-600 hover:underline text-sm font-medium"
            >
              View All →
            </Link>
          </div>

          {reportsLoading ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Loading reports...</p>
            </div>
          ) : dbError ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2" aria-hidden="true">⚠️</div>
              <p className="text-gray-500 text-sm">
                Reports unavailable — database connection error
              </p>
            </div>
          ) : recentReports.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4" aria-hidden="true">📭</div>
              <p className="text-gray-600 mb-4">
                No reports yet. Start by submitting one!
              </p>
              <Link
                href="/citizen/report"
                className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium"
              >
                Submit First Report
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="text-2xl" aria-hidden="true">
                    {report.category === "Water"
                      ? "💧"
                      : report.category === "Waste"
                      ? "🗑️"
                      : report.category === "Roads"
                      ? "🛣️"
                      : report.category === "Electricity"
                      ? "⚡"
                      : report.category === "Health"
                      ? "🏥"
                      : "📋"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {report.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {report.category} •{" "}
                      {new Date(report.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium flex-shrink-0 ${
                      report.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : report.status === "in-progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {report.status === "pending"
                      ? "⏳ Pending"
                      : report.status === "in-progress"
                      ? "🔄 In Progress"
                      : "✅ Resolved"}
                  </span>
                </div>
              ))}
              <div className="pt-2">
                <Link
                  href="/citizen/my-reports"
                  className="inline-block text-emerald-600 font-medium hover:underline text-sm"
                >
                  View all reports →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ==================== QUICK LINKS ==================== */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/public/activity"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-4"
            aria-label="View Public Activity Feed"
          >
            <div
              className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl"
              aria-hidden="true"
            >
              📢
            </div>
            <div>
              <p className="font-bold text-gray-900">Public Activity Feed</p>
              <p className="text-sm text-gray-500">
                See all resolved city issues
              </p>
            </div>
          </Link>

          <Link
            href="/public/resolved"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex items-center gap-4"
            aria-label="Rate resolved city issues"
          >
            <div
              className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl"
              aria-hidden="true"
            >
              ⭐
            </div>
            <div>
              <p className="font-bold text-gray-900">Rate Resolved Issues</p>
              <p className="text-sm text-gray-500">
                Give feedback on city services
              </p>
            </div>
          </Link>
        </div>

        {/* ==================== STATISTICS ==================== */}
        {!dbError && allReports.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  My Report Statistics
                </h2>
                <p className="text-gray-600 text-sm">
                  Visual breakdown of all your submitted reports
                </p>
              </div>
            </div>
            <StatisticsCharts
              role="citizen"
              reports={allReports}
              userName={user?.name}
            />
          </div>
        )}

        {!dbError && allReports.length === 0 && !reportsLoading && (
          <div className="bg-white rounded-2xl shadow-sm p-10 border border-gray-100 text-center">
            <div className="text-6xl mb-4" aria-hidden="true">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Statistics Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Submit your first report and your stats will appear here.
            </p>
            <Link
              href="/citizen/report"
              className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium"
            >
              Submit a Report
            </Link>
          </div>
        )}
      </main>

      {/* ==================== NOTICE DETAIL MODAL ==================== */}
      {selectedNotice && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedNotice(null)
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Emergency notice: ${selectedNotice.title}`}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            {(() => {
              const config =
                SEVERITY_CONFIG[selectedNotice.severity] ||
                SEVERITY_CONFIG.info
              return (
                <>
                  <div
                    className={`p-6 ${config.bg} border-b ${config.border}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl" aria-hidden="true">
                          {config.icon}
                        </div>
                        <div>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full font-bold ${config.color}`}
                          >
                            {config.label}
                          </span>
                          <h2
                            className={`text-xl font-bold mt-1 ${config.color}`}
                          >
                            {selectedNotice.title}
                          </h2>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedNotice(null)}
                        className="w-8 h-8 bg-white/60 rounded-full flex items-center justify-center hover:bg-white transition text-gray-600 font-bold flex-shrink-0"
                        aria-label="Close notice"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Message
                      </h3>
                      <p className="text-gray-800 leading-relaxed bg-gray-50 rounded-xl p-4">
                        {selectedNotice.message}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">Sent On</p>
                        <p className="font-semibold text-gray-800 text-sm">
                          {new Date(selectedNotice.sentAt).toLocaleString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">Time Ago</p>
                        <p className="font-semibold text-gray-800 text-sm">
                          {getTimeAgo(selectedNotice.sentAt)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">
                          Target Area
                        </p>
                        <p className="font-semibold text-gray-800 text-sm">
                          {selectedNotice.targetAll
                            ? "🇧🇩 Nationwide"
                            : `📍 ${
                                selectedNotice.targetCity || "Specific area"
                              }`}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-1">
                          Recipients
                        </p>
                        <p className="font-semibold text-gray-800 text-sm">
                          👥 {selectedNotice.recipients.toLocaleString()}{" "}
                          citizens
                        </p>
                      </div>
                    </div>

                    {selectedNotice.severity === "critical" && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-red-700 text-sm font-semibold mb-1">
                          ⚠️ Critical Emergency
                        </p>
                        <p className="text-red-600 text-xs">
                          Please follow instructions from local authorities and
                          stay safe.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={() => setSelectedNotice(null)}
                      className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                    >
                      Close
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* ==================== PUSH NOTIFICATION POPUP ==================== */}
      {pushPopup && (
        <div
          className="fixed top-4 right-4 z-[9999] max-w-sm w-full"
          role="alert"
          aria-live="assertive"
        >
          <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-red-500 p-4">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                aria-hidden="true"
              >
                🚨
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-red-700 text-sm">
                  {pushPopup.title}
                </h4>
                <p className="text-gray-600 text-xs mt-1 line-clamp-3">
                  {pushPopup.body}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  CityWatch Bangladesh • Just now
                </p>
              </div>
              <button
                onClick={() => setPushPopup(null)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 font-bold text-lg leading-none"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}