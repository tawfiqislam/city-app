"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const divisions = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh"
]

const cities: Record<string, string[]> = {
  "Dhaka": ["Dhaka City", "Gazipur", "Narayanganj", "Tongi", "Savar", "Keraniganj"],
  "Chattogram": ["Chattogram City", "Cox's Bazar", "Comilla", "Feni", "Brahmanbaria"],
  "Rajshahi": ["Rajshahi City", "Bogra", "Pabna", "Sirajganj", "Natore"],
  "Khulna": ["Khulna City", "Jessore", "Satkhira", "Bagerhat", "Kushtia"],
  "Barishal": ["Barishal City", "Patuakhali", "Bhola", "Jhalokati"],
  "Sylhet": ["Sylhet City", "Moulvibazar", "Habiganj", "Sunamganj"],
  "Rangpur": ["Rangpur City", "Dinajpur", "Thakurgaon", "Panchagarh"],
  "Mymensingh": ["Mymensingh City", "Jamalpur", "Netrokona", "Sherpur"]
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    division: "",
    city: "",
    address: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          city: formData.city,
          address: formData.address,
        }),
      })

      // Check if response is JSON
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error. Please try again later.")
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Registration failed")
      }

      alert("Registration successful! Please login now.")
      router.push("/login")
    } catch (err: any) {
      console.error("Registration error:", err)
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-teal-600 to-emerald-700 items-center justify-center p-12">
        <div className="max-w-lg text-white text-center">
          <div className="text-8xl mb-8">🌆</div>
          <h2 className="text-3xl font-bold mb-4">Welcome to CityWatch Family</h2>
          <p className="text-emerald-100 text-lg mb-8">
            Register and participate in making your city better.
            Every complaint matters.
          </p>

          <div className="space-y-4 text-left">
            {[
              "📝 Submit complaints easily",
              "📊 Track progress in real-time",
              "🔔 Get instant notifications",
              "⭐ Rate service quality"
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg backdrop-blur-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-3xl">🏛️</span>
              <span className="text-2xl font-bold text-emerald-600">CityWatch</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Fill in your details below</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {s}
                </div>
                {s === 1 && (
                  <div className={`w-12 h-1 ${step > 1 ? "bg-emerald-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="font-bold text-gray-900 mb-4">Personal Information</h3>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                    placeholder="+880 1XXXXXXXXX"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
                      setError("Please fill in all required fields")
                      return
                    }
                    if (formData.password !== formData.confirmPassword) {
                      setError("Passwords do not match")
                      return
                    }
                    setError("")
                    setStep(2)
                  }}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition"
                >
                  Next Step →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <h3 className="font-bold text-gray-900 mb-4">Address Information</h3>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Division *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                    value={formData.division}
                    onChange={(e) =>
                      setFormData({ ...formData, division: e.target.value, city: "" })
                    }
                  >
                    <option value="">Select Division</option>
                    {divisions.map((div) => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    City/District *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    disabled={!formData.division}
                  >
                    <option value="">Select City</option>
                    {formData.division && cities[formData.division]?.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Detailed Address (Optional)
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                    rows={3}
                    placeholder="House no, Road no, Area"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition"
                  >
                    ← Previous
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-emerald-600 font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-emerald-600">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}