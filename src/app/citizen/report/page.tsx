"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ImageUploader from "@/components/ImageUploader"

const categories = [
  { id: "Water", name: "Water Supply", icon: "💧", color: "bg-blue-500" },
  { id: "Waste", name: "Waste Management", icon: "🗑️", color: "bg-green-500" },
  { id: "Roads", name: "Roads & Highways", icon: "🛣️", color: "bg-yellow-500" },
  { id: "Electricity", name: "Electricity", icon: "⚡", color: "bg-orange-500" },
  { id: "Health", name: "Public Health", icon: "🏥", color: "bg-red-500" },
  { id: "Other", name: "Other Issues", icon: "📋", color: "bg-gray-500" },
]

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

const emergencyKeywords = [
  "urgent",
  "emergency",
  "danger",
  "dangerous",
  "fire",
  "flood",
  "accident",
  "injured",
  "critical",
  "immediate",
]

const priorityConfig: Record<
  string,
  { label: string; color: string; bg: string; emoji: string }
> = {
  low: { label: "Low", color: "text-gray-700", bg: "bg-gray-100", emoji: "🟢" },
  medium: { label: "Medium", color: "text-blue-700", bg: "bg-blue-100", emoji: "🟡" },
  high: { label: "High", color: "text-orange-700", bg: "bg-orange-100", emoji: "🟠" },
  urgent: { label: "Urgent", color: "text-red-700", bg: "bg-red-100", emoji: "🔴" },
}

export default function ReportPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

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

  const [analyzing, setAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)
  const [aiError, setAiError] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [])

  const checkEmergencyKeywords = (text: string) => {
    const lowerText = text.toLowerCase()
    const found = emergencyKeywords.some((kw) => lowerText.includes(kw))
    setEmergencyDetected(found)
    if (found) {
      setIsEmergency(true)
      setPriority("urgent")
    }
  }

  const handleTitleChange = (value: string) => {
    setFormData({ ...formData, title: value })
    checkEmergencyKeywords(value + " " + formData.description)
  }

  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, description: value })
    checkEmergencyKeywords(formData.title + " " + value)
    setAiResult(null)
    setAiError("")
  }

  const analyzeSeverity = async () => {
    const text = `${formData.title} ${formData.description}`.trim()
    if (text.length < 10) {
      setAiError("Please write at least 10 characters first.")
      return
    }

    setAnalyzing(true)
    setAiError("")
    setAiResult(null)

    try {
      const res = await fetch("/api/ai/analyze-severity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()

      if (data.success && data.priority) {
        setPriority(data.priority)
        setAiResult(data)
        if (data.isEmergency) {
          setIsEmergency(true)
          setEmergencyDetected(true)
        }
      } else {
        setAiError(data.error || "Analysis failed.")
      }
    } catch {
      setAiError("Failed to connect to AI service.")
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
        alert("✅ Report submitted successfully!")
        router.push("/citizen/my-reports")
      } else {
        throw new Error(data.error || "Failed to submit")
      }
    } catch (error: any) {
      alert("❌ " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/citizen/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">🏛️</span>
              <span className="text-xl font-bold text-emerald-600">CityWatch</span>
            </Link>
            <Link
              href="/citizen/dashboard"
              className="text-gray-600 hover:text-emerald-600 text-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📝 Submit New Report</h1>
          <p className="text-gray-600 mt-2">
            Report a city issue with photos and AI-powered severity analysis
          </p>
        </div>

        {emergencyDetected && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-xl animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🚨</span>
              <div>
                <h3 className="font-bold text-red-700">
                  Emergency Keywords Detected!
                </h3>
                <p className="text-red-600 text-sm">
                  Auto-flagged as urgent priority.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Select Category *</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.category === cat.id
                      ? "border-emerald-500 bg-emerald-50 shadow-md"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div
                    className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center text-2xl mx-auto mb-2`}
                  >
                    {cat.icon}
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{cat.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
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
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 text-gray-900 ${
                    emergencyDetected
                      ? "border-red-500 bg-red-50 focus:ring-red-300"
                      : "border-gray-200 focus:ring-emerald-500"
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
                  className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 text-gray-900 resize-none ${
                    emergencyDetected
                      ? "border-red-500 bg-red-50 focus:ring-red-300"
                      : "border-gray-200 focus:ring-emerald-500"
                  }`}
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    {formData.description.length} characters
                  </p>
                  <button
                    type="button"
                    onClick={analyzeSeverity}
                    disabled={analyzing || formData.description.length < 10}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 disabled:opacity-50 transition flex items-center gap-2"
                  >
                    {analyzing ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                        Analyzing...
                      </>
                    ) : (
                      <>🤖 AI Analyze Severity</>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Result */}
              {aiResult && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span>🤖</span>
                    <h3 className="font-bold text-purple-800">AI Assessment</h3>
                    <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-xs rounded-full">
                      {aiResult.analysis?.method}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{priorityConfig[aiResult.priority]?.emoji}</span>
                    <span
                      className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                        priorityConfig[aiResult.priority]?.bg
                      } ${priorityConfig[aiResult.priority]?.color}`}
                    >
                      {priorityConfig[aiResult.priority]?.label?.toUpperCase()}
                    </span>
                    {aiResult.isEmergency && (
                      <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-full font-bold animate-pulse">
                        🚨 EMERGENCY
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 italic">
                    &quot;{aiResult.explanation}&quot;
                  </p>
                </div>
              )}

              {aiError && (
                <p className="text-orange-700 text-sm bg-orange-50 border border-orange-200 p-3 rounded-xl">
                  ⚠️ {aiError}
                </p>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Priority Level</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {(["low", "medium", "high", "urgent"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-6 py-2.5 rounded-full font-medium transition flex items-center gap-2 ${
                    priority === p
                      ? `${priorityConfig[p].bg} ${priorityConfig[p].color} ring-2 ring-offset-2 ring-gray-400`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {priorityConfig[p].emoji} {priorityConfig[p].label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-3 bg-red-50 rounded-xl border border-red-200">
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="w-5 h-5 text-red-600 rounded"
              />
              <div>
                <span className="text-gray-700 font-medium">🚨 Mark as Emergency</span>
                <p className="text-xs text-gray-500">
                  Requires immediate officer attention
                </p>
              </div>
            </label>
          </div>

          {/* Image uploader */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <ImageUploader
              label="Photo of the Issue"
              required={false}
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              helpText="Upload a clear photo of the problem to help officers understand the issue."
              placeholder="https://i.ibb.co/example/photo.jpg"
            />
          </div>

          {/* Submit */}
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