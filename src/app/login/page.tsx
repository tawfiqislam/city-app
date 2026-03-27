"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-3xl">🏛️</span>
              <span className="text-2xl font-bold text-emerald-600">CityWatch</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-gray-900 bg-gray-50"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-gray-900 bg-gray-50"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="#" className="text-sm text-emerald-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition shadow-lg shadow-emerald-500/30"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-emerald-600 font-medium hover:underline">
                Register here
              </Link>
            </p>
          </div>

          {/* Test Accounts */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3 font-medium">🔑 Test Accounts</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-white rounded-lg">
                <span className="text-gray-600">👨‍💼 Admin:</span>
                <span className="text-gray-900 font-mono">admin@citywatch.gov.bd / admin123</span>
              </div>
              <div className="flex justify-between p-2 bg-white rounded-lg">
                <span className="text-gray-600">👮 Officer:</span>
                <span className="text-gray-900 font-mono">water.officer@wasa.gov.bd / officer123</span>
              </div>
              <div className="flex justify-between p-2 bg-white rounded-lg">
                <span className="text-gray-600">👤 Citizen:</span>
                <span className="text-gray-900 font-mono">citizen@gmail.com / citizen123</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-emerald-600">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-emerald-600 to-teal-700 items-center justify-center p-12">
        <div className="max-w-lg text-white text-center">
          <div className="text-8xl mb-8">🏙️</div>
          <h2 className="text-3xl font-bold mb-4">Your City, Your Voice</h2>
          <p className="text-emerald-100 text-lg">
            CityWatch Bangladesh - Digital solution for civic services.
            Report your problems, we solve them.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
              ✅ 24/7 Service
            </div>
            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
              📱 Mobile Friendly
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}