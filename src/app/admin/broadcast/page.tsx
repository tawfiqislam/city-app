"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface BroadcastResult {
  totalCitizens: number
  tokensFound: number
  notificationsSent: number
  notificationsFailed: number
  message: string
}

export default function BroadcastPage() {
  const router = useRouter()

  const [authChecked, setAuthChecked] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    severity: "warning",
    targetCity: "",
    targetAll: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [result, setResult] = useState<BroadcastResult | null>(null)

  const cities = [
    "Dhaka",
    "Chattogram",
    "Rajshahi",
    "Khulna",
    "Sylhet",
    "Rangpur",
    "Barishal",
    "Mymensingh",
  ]

  // Auth check — runs once on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem("user")
        const token = localStorage.getItem("token")

        if (!userData || !token) {
          router.push("/login")
          return
        }

        let user: any
        try {
          user = JSON.parse(userData)
        } catch {
          router.push("/login")
          return
        }

        if (!user || user.role !== "admin") {
          router.push("/login")
          return
        }

        setAuthChecked(true)
      } catch (err) {
        console.error("Auth check error:", err)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setError("Title is required")
      return
    }

    if (!formData.message.trim()) {
      setError("Message is required")
      return
    }

    if (!formData.targetAll && !formData.targetCity) {
      setError("Please select a city or choose nationwide")
      return
    }

    const confirmed = window.confirm(
      "This will send a push notification to all citizens. Are you sure?"
    )
    if (!confirmed) return

    setLoading(true)
    setError("")
    setSuccess("")
    setResult(null)

    try {
      // Always read fresh token from localStorage
      const token = localStorage.getItem("token")
      const userData = localStorage.getItem("user")

      if (!token || !userData) {
        setError("Session expired. Please login again.")
        setLoading(false)
        setTimeout(() => router.push("/login"), 2000)
        return
      }

      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const contentType = res.headers.get("content-type") || ""

      if (!contentType.includes("application/json")) {
        throw new Error(
          "Server returned an unexpected response. Please try again."
        )
      }

      const data = await res.json()

      if (res.status === 401) {
        setError("Session expired. Please login again.")
        setTimeout(() => {
          localStorage.clear()
          router.push("/login")
        }, 2000)
        return
      }

      if (res.status === 403) {
        setError(
          "Access denied. Make sure you are logged in as admin."
        )
        return
      }

      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`)
      }

      if (data.success) {
        setSuccess("Broadcast sent and recorded successfully!")
        setResult({
          totalCitizens: data.totalCitizens ?? 0,
          tokensFound: data.tokensFound ?? 0,
          notificationsSent: data.notificationsSent ?? 0,
          notificationsFailed: data.notificationsFailed ?? 0,
          message: data.message ?? "",
        })
        setFormData({
          title: "",
          message: "",
          severity: "warning",
          targetCity: "",
          targetAll: true,
        })
      } else {
        throw new Error(data.error || "Broadcast failed")
      }
    } catch (err: any) {
      console.error("Broadcast submit error:", err)
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Show spinner while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Checking authorization...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">🏛️</span>
                <span className="text-xl font-bold text-emerald-600">
                  CityWatch
                </span>
              </Link>
              <div className="hidden md:block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                🚨 Emergency Broadcast
              </div>
            </div>
            <Link
              href="/admin/dashboard"
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
            🚨 Emergency Broadcast
          </h1>
          <p className="text-gray-600 mt-1">
            Send a push notification to all registered citizens via Firebase
            Cloud Messaging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ===== FORM ===== */}
          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">❌</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Success + Result */}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl mb-6 overflow-hidden">
                  <div className="px-4 py-3 flex items-center gap-2 border-b border-green-100">
                    <span>✅</span>
                    <span className="font-bold text-green-700">{success}</span>
                  </div>

                  {result && (
                    <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white rounded-xl p-3 border border-green-100">
                        <p className="text-gray-400 text-xs mb-1">
                          Total Citizens
                        </p>
                        <p className="font-bold text-gray-900 text-xl">
                          {result.totalCitizens.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-green-100">
                        <p className="text-gray-400 text-xs mb-1">
                          Push Enabled
                        </p>
                        <p className="font-bold text-blue-700 text-xl">
                          {result.tokensFound.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-green-100">
                        <p className="text-gray-400 text-xs mb-1">
                          Sent Successfully
                        </p>
                        <p className="font-bold text-green-700 text-xl">
                          {result.notificationsSent.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-green-100">
                        <p className="text-gray-400 text-xs mb-1">Failed</p>
                        <p className="font-bold text-red-700 text-xl">
                          {result.notificationsFailed.toLocaleString()}
                        </p>
                      </div>

                      {result.message && (
                        <div className="col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs">
                          {result.message}
                        </div>
                      )}

                      {result.tokensFound === 0 && (
                        <div className="col-span-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-xs">
                          <strong>No push tokens found.</strong> Citizens must
                          login to their dashboard and allow browser
                          notifications to receive push alerts.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Alert Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-gray-50"
                    placeholder="e.g., Severe Storm Warning for Dhaka"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 resize-none text-gray-900 bg-gray-50"
                    placeholder="Enter the full emergency message. Be clear and concise."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {formData.message.length} characters
                  </p>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Severity Level <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        id: "info",
                        label: "Info",
                        icon: "ℹ️",
                        active:
                          "bg-blue-100 border-blue-400 text-blue-700 ring-2 ring-blue-300",
                        inactive:
                          "bg-blue-50 border-blue-200 text-blue-600 hover:shadow-sm",
                      },
                      {
                        id: "warning",
                        label: "Warning",
                        icon: "⚠️",
                        active:
                          "bg-yellow-100 border-yellow-400 text-yellow-700 ring-2 ring-yellow-300",
                        inactive:
                          "bg-yellow-50 border-yellow-200 text-yellow-600 hover:shadow-sm",
                      },
                      {
                        id: "critical",
                        label: "Critical",
                        icon: "🚨",
                        active:
                          "bg-red-100 border-red-400 text-red-700 ring-2 ring-red-300",
                        inactive:
                          "bg-red-50 border-red-200 text-red-600 hover:shadow-sm",
                      },
                    ].map((sev) => (
                      <button
                        key={sev.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, severity: sev.id })
                        }
                        className={`p-3 rounded-xl border-2 text-center font-semibold transition ${
                          formData.severity === sev.id
                            ? sev.active
                            : sev.inactive
                        }`}
                      >
                        <div className="text-2xl mb-1">{sev.icon}</div>
                        <div className="text-sm">{sev.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Target Audience <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition">
                      <input
                        type="radio"
                        name="target"
                        checked={formData.targetAll}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            targetAll: true,
                            targetCity: "",
                          })
                        }
                        className="w-5 h-5 text-red-600"
                      />
                      <div>
                        <span className="font-medium text-gray-800">
                          All Citizens (Nationwide)
                        </span>
                        <p className="text-xs text-gray-500">
                          Send to every registered citizen in Bangladesh
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition">
                      <input
                        type="radio"
                        name="target"
                        checked={!formData.targetAll}
                        onChange={() =>
                          setFormData({ ...formData, targetAll: false })
                        }
                        className="w-5 h-5 text-red-600"
                      />
                      <div>
                        <span className="font-medium text-gray-800">
                          Specific City Only
                        </span>
                        <p className="text-xs text-gray-500">
                          Target citizens in a specific city
                        </p>
                      </div>
                    </label>

                    {!formData.targetAll && (
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-gray-900 mt-1"
                        value={formData.targetCity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            targetCity: e.target.value,
                          })
                        }
                        required={!formData.targetAll}
                      >
                        <option value="">-- Select a city --</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Preview */}
                {formData.title && formData.message && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Notification Preview
                    </div>
                    <div className="p-4">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                          {formData.severity === "critical"
                            ? "🚨"
                            : formData.severity === "warning"
                            ? "⚠️"
                            : "ℹ️"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">
                            {formData.title}
                          </p>
                          <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                            {formData.message}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            CityWatch Bangladesh • Just now
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 font-bold rounded-xl transition text-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                    formData.severity === "critical"
                      ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
                      : formData.severity === "warning"
                      ? "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white"
                      : "bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        viewBox="0 0 24 24"
                      >
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
                      Sending Broadcast...
                    </>
                  ) : (
                    <>🚨 Send Emergency Broadcast</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ===== SIDE PANEL ===== */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-3">
                Important Notes
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                This sends a real push notification to every citizen who has
                enabled notifications on their device.
              </p>
              <p className="text-sm font-medium text-red-600 mb-2">
                Use only for genuine emergencies:
              </p>
              <ul className="text-sm text-gray-700 list-disc list-inside space-y-1.5">
                <li>Severe weather warnings</li>
                <li>Public health emergencies</li>
                <li>Major utility disruptions</li>
                <li>Security alerts</li>
              </ul>
              <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded-r-lg">
                <strong>Warning:</strong> All broadcasts are permanently logged.
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">How It Works</h3>
              <div className="space-y-3 text-sm text-gray-600">
                {[
                  "Admin writes the emergency message",
                  "System finds all citizens with push tokens",
                  "Firebase sends push to all devices",
                  "Citizens see notification on screen",
                  "Broadcast saved in history",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-200">
              <h3 className="font-bold text-yellow-800 mb-2">
                Citizen Requirements
              </h3>
              <p className="text-sm text-yellow-700 mb-2">
                For push notifications to work:
              </p>
              <ol className="text-sm text-yellow-800 list-decimal list-inside space-y-1">
                <li>Citizen logs into CityWatch</li>
                <li>Allows browser notifications when asked</li>
                <li>Keeps browser running</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}