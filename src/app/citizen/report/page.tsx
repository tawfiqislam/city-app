"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const categories = [
  { id: "Water", name: "Water Supply", icon: "💧", color: "bg-blue-500" },
  { id: "Waste", name: "Waste Management", icon: "🗑️", color: "bg-green-500" },
  { id: "Roads", name: "Roads & Highways", icon: "🛣️", color: "bg-yellow-500" },
  { id: "Electricity", name: "Electricity", icon: "⚡", color: "bg-orange-500" },
  { id: "Health", name: "Public Health", icon: "🏥", color: "bg-red-500" },
  { id: "Other", name: "Other Issues", icon: "📋", color: "bg-gray-500" },
]

const cities = [
  "Dhaka", "Chattogram", "Rajshahi", "Khulna", "Sylhet", 
  "Rangpur", "Barishal", "Mymensingh", "Comilla", "Gazipur"
]

const emergencyKeywords = ["urgent", "emergency", "danger", "dangerous", "fire", "flood", "accident", "injured", "critical", "immediate"]

export default function ReportPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    city: "Dhaka",
    imageUrl: "",
  })
  const [priority, setPriority] = useState("medium")
  const [isEmergency, setIsEmergency] = useState(false)
  const [emergencyDetected, setEmergencyDetected] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [])

  // Emergency Keyword Flagging (Pritha's Feature)
  const checkEmergencyKeywords = (text: string) => {
    const lowerText = text.toLowerCase()
    const found = emergencyKeywords.some(keyword => lowerText.includes(keyword))
    setEmergencyDetected(found)
    if (found) {
      setIsEmergency(true)
      setPriority("urgent")
    }
  }

  // Handle description change with keyword checking
  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, description: value })
    checkEmergencyKeywords(value)
  }

  // Handle title change with keyword checking
  const handleTitleChange = (value: string) => {
    setFormData({ ...formData, title: value })
    checkEmergencyKeywords(value)
  }

  // Automatic Severity Assessment using Hugging Face API (Pritha's Feature)
  const analyzeSeverity = async () => {
    if (!formData.description) return

    setAnalyzing(true)
    try {
      const res = await fetch("/api/ai/analyze-severity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: formData.description }),
      })

      const data = await res.json()
      if (data.priority) {
        setPriority(data.priority)
        if (data.priority === "urgent" || data.priority === "high") {
          setIsEmergency(true)
        }
      }
    } catch (error) {
      console.error("AI Analysis failed:", error)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          priority,
          isEmergency,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert("Report submitted successfully!")
        router.push("/citizen/my-reports")
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      alert(error.message || "Failed to submit report")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/citizen/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <span className="text-xl font-bold text-emerald-600">CityWatch</span>
            </Link>
            <Link
              href="/citizen/dashboard"
              className="text-gray-600 hover:text-emerald-600"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📝 Submit New Report</h1>
          <p className="text-gray-600 mt-2">Help us improve your city by reporting issues</p>
        </div>

        {/* Emergency Alert */}
        {emergencyDetected && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-xl animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚨</span>
              <div>
                <h3 className="font-bold text-red-700">Emergency Keywords Detected!</h3>
                <p className="text-red-600 text-sm">
                  Your report contains emergency keywords. It will be prioritized.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Select Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.category === cat.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center text-2xl mx-auto mb-2`}>
                    {cat.icon}
                  </div>
                  <p className="font-medium text-gray-900">{cat.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Report Details */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Report Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 ${
                    emergencyDetected ? "border-red-500 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="Brief title of the issue"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Description *
                </label>
                <textarea
                  required
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900 ${
                    emergencyDetected ? "border-red-500 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                />
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Be as specific as possible for faster resolution
                  </p>
                  <button
                    type="button"
                    onClick={analyzeSeverity}
                    disabled={analyzing || !formData.description}
                    className="text-sm text-emerald-600 hover:underline disabled:opacity-50"
                  >
                    {analyzing ? "Analyzing..." : "🤖 AI Analyze Severity"}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                    placeholder="Street address or landmark"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    City *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Priority & Emergency */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Priority Level</h2>

            <div className="flex flex-wrap gap-3 mb-4">
              {[
                { id: "low", label: "Low", color: "bg-gray-100 text-gray-700" },
                { id: "medium", label: "Medium", color: "bg-blue-100 text-blue-700" },
                { id: "high", label: "High", color: "bg-orange-100 text-orange-700" },
                { id: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`px-6 py-2 rounded-full font-medium transition ${
                    priority === p.id
                      ? p.color + " ring-2 ring-offset-2 ring-gray-400"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="w-5 h-5 text-red-600 rounded"
              />
              <span className="text-gray-700">
                🚨 Mark as Emergency (requires immediate attention)
              </span>
            </label>
          </div>

          {/* Image Upload */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Photo (Optional)</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-gray-600 mb-2">Upload a photo of the issue</p>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-900"
                placeholder="Enter image URL (or use imgBB upload)"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.category}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg font-medium rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition shadow-lg"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </main>
    </div>
  )
}