"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Role = "citizen" | "officer" | "admin"

const roleConfig = {
  citizen: {
    label: "Citizen",
    icon: "👤",
    color: "emerald",
    description: "Report and track city issues",
    bgSelected: "bg-emerald-600 text-white border-emerald-600",
    bgHover: "hover:bg-emerald-50 hover:border-emerald-400",
    accounts: [
      { label: "Citizen", email: "citizen@gmail.com", password: "citizen123" },
    ],
  },
  officer: {
    label: "Officer",
    icon: "👮",
    color: "blue",
    description: "Manage and resolve city tickets",
    bgSelected: "bg-blue-600 text-white border-blue-600",
    bgHover: "hover:bg-blue-50 hover:border-blue-400",
    accounts: [
      { label: "💧 Water", email: "water.officer@wasa.gov.bd", password: "officer123" },
      { label: "🗑️ Waste", email: "waste.officer@dncc.gov.bd", password: "officer123" },
      { label: "🛣️ Roads", email: "roads.officer@rhd.gov.bd", password: "officer123" },
      { label: "⚡ Electric", email: "electric.officer@bpdb.gov.bd", password: "officer123" },
      { label: "❤️ Health", email: "health.officer@dncc.gov.bd", password: "officer123" },
    ],
  },
  admin: {
    label: "Admin",
    icon: "👑",
    color: "purple",
    description: "Manage departments and staff",
    bgSelected: "bg-purple-600 text-white border-purple-600",
    bgHover: "hover:bg-purple-50 hover:border-purple-400",
    accounts: [
      { label: "👑 Admin", email: "admin@citywatch.gov.bd", password: "admin123" },
    ],
  },
}

export default function LoginPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<Role>("citizen")
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role)
    setFormData({ email: "", password: "" })
    setError("")
  }

  const quickFill = (email: string, password: string) => {
    setFormData({ email, password })
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Login failed")
      }
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      if (data.user.role === "admin") {
        router.push("/admin/dashboard")
      } else if (data.user.role === "officer") {
        router.push("/officer/dashboard")
      } else {
        router.push("/citizen/dashboard")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const config = roleConfig[selectedRole]

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-3xl">🏛️</span>
              <span className="text-2xl font-bold text-emerald-600">
                CityWatch
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Welcome Back!
            </h1>
            <p className="text-gray-500 text-sm">
              Select your role and sign in
            </p>
          </div>

          {/* Role Selector */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">
              I am signing in as...
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(["citizen", "officer", "admin"] as Role[]).map((role) => {
                const rc = roleConfig[role]
                const isSelected = selectedRole === role
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleChange(role)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                      isSelected
                        ? rc.bgSelected + " shadow-lg scale-105"
                        : "bg-white border-gray-200 text-gray-600 " + rc.bgHover
                    }`}
                  >
                    <span className="text-3xl">{rc.icon}</span>
                    <span className="text-sm font-bold">{rc.label}</span>
                    <span
                      className={`text-xs text-center leading-tight ${
                        isSelected ? "text-white/80" : "text-gray-400"
                      }`}
                    >
                      {rc.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Role Banner */}
          <div
            className={`mb-5 p-3 rounded-xl flex items-center gap-3 ${
              selectedRole === "citizen"
                ? "bg-emerald-50 border border-emerald-200"
                : selectedRole === "officer"
                ? "bg-blue-50 border border-blue-200"
                : "bg-purple-50 border border-purple-200"
            }`}
          >
            <span className="text-2xl">{config.icon}</span>
            <div>
              <p
                className={`text-sm font-semibold ${
                  selectedRole === "citizen"
                    ? "text-emerald-800"
                    : selectedRole === "officer"
                    ? "text-blue-800"
                    : "text-purple-800"
                }`}
              >
                Signing in as {config.label}
              </p>
              <p
                className={`text-xs ${
                  selectedRole === "citizen"
                    ? "text-emerald-600"
                    : selectedRole === "officer"
                    ? "text-blue-600"
                    : "text-purple-600"
                }`}
              >
                {config.description}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 flex items-center gap-2 text-sm">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition text-gray-900 bg-gray-50 outline-none ${
                  selectedRole === "citizen"
                    ? "focus:ring-emerald-400 border-gray-200"
                    : selectedRole === "officer"
                    ? "focus:ring-blue-400 border-gray-200"
                    : "focus:ring-purple-400 border-gray-200"
                }`}
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition text-gray-900 bg-gray-50 outline-none ${
                  selectedRole === "citizen"
                    ? "focus:ring-emerald-400 border-gray-200"
                    : selectedRole === "officer"
                    ? "focus:ring-blue-400 border-gray-200"
                    : "focus:ring-purple-400 border-gray-200"
                }`}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                href="#"
                className="text-sm text-emerald-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-2 ${
                selectedRole === "citizen"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/30"
                  : selectedRole === "officer"
                  ? "bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-blue-500/30"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/30"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  {config.icon} Sign In as {config.label}
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-5 text-center">
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-emerald-600 font-medium hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>

          {/* Test Accounts */}
          <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 text-center mb-3 uppercase tracking-wide">
              🔑 Test Accounts — Click to Auto-Fill
            </p>

            {/* Password hint */}
            <div
              className={`rounded-lg p-2.5 mb-3 text-center border ${
                selectedRole === "citizen"
                  ? "bg-emerald-50 border-emerald-200"
                  : selectedRole === "officer"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-purple-50 border-purple-200"
              }`}
            >
              <p className="text-xs text-gray-500">
                Password for {config.label}:
              </p>
              <p
                className={`font-mono font-bold text-sm ${
                  selectedRole === "citizen"
                    ? "text-emerald-700"
                    : selectedRole === "officer"
                    ? "text-blue-700"
                    : "text-purple-700"
                }`}
              >
                {selectedRole === "citizen"
                  ? "citizen123"
                  : selectedRole === "officer"
                  ? "officer123"
                  : "admin123"}
              </p>
            </div>

            {/* Account buttons for selected role */}
            <div className="space-y-1.5">
              {config.accounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => quickFill(acc.email, acc.password)}
                  className={`w-full flex justify-between items-center p-2.5 bg-white rounded-lg border border-gray-100 transition group ${
                    selectedRole === "citizen"
                      ? "hover:bg-emerald-50 hover:border-emerald-300"
                      : selectedRole === "officer"
                      ? "hover:bg-blue-50 hover:border-blue-300"
                      : "hover:bg-purple-50 hover:border-purple-300"
                  }`}
                >
                  <span className="text-gray-600 text-xs font-medium">
                    {acc.label}
                  </span>
                  <span
                    className={`font-mono text-xs truncate max-w-[200px] ${
                      selectedRole === "citizen"
                        ? "text-gray-500 group-hover:text-emerald-700"
                        : selectedRole === "officer"
                        ? "text-gray-500 group-hover:text-blue-700"
                        : "text-gray-500 group-hover:text-purple-700"
                    }`}
                  >
                    {acc.email}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-400 text-center mt-2">
              Click an account to auto-fill ↑
            </p>
          </div>

          <div className="mt-5 text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-emerald-600"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-600 to-teal-700 items-center justify-center p-12">
        <div className="max-w-lg text-white text-center">
          <div className="text-8xl mb-8">🏙️</div>
          <h2 className="text-3xl font-bold mb-4">Your City, Your Voice</h2>
          <p className="text-emerald-100 text-lg mb-8">
            CityWatch Bangladesh — Digital solution for civic services. Report
            your problems, we solve them.
          </p>

          {/* Role Cards */}
          <div className="space-y-3 text-left">
            {[
              {
                icon: "👑",
                role: "Admin",
                desc: "Manages departments, assigns officers, sends alerts",
                bg: "bg-purple-500/20 border-purple-400/30",
              },
              {
                icon: "👮",
                role: "Officer",
                desc: "Claims tickets, resolves issues, submits proof photos",
                bg: "bg-blue-500/20 border-blue-400/30",
              },
              {
                icon: "👤",
                role: "Citizen",
                desc: "Reports city issues, tracks progress, rates service",
                bg: "bg-emerald-500/20 border-emerald-400/30",
              },
            ].map((item) => (
              <div
                key={item.role}
                className={`backdrop-blur-sm rounded-xl p-4 border ${item.bg}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-white">{item.role}</p>
                    <p className="text-emerald-200 text-xs">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm text-sm">
              ✅ 24/7 Service
            </div>
            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm text-sm">
              📱 Mobile Friendly
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}