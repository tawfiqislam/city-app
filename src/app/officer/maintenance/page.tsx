"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Schedule {
  id: string
  title: string
  description: string
  scheduledDate: string
  endDate: string
  status: string
  priority: string
  location: string
  city: string
  notes: string
  officer: { name: string }
  department: { name: string }
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  "in-progress": "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
}

export default function MaintenancePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledDate: "",
    endDate: "",
    location: "",
    city: "Dhaka",
    priority: "medium",
    notes: "",
  })

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/maintenance/schedule", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setSchedules(data.schedules)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")

      const res = await fetch("/api/maintenance/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          departmentId: user.department?.id,
          assignedTo: user.id,
        }),
      })

      if (res.ok) {
        alert("Schedule created successfully!")
        setShowForm(false)
        setFormData({
          title: "",
          description: "",
          scheduledDate: "",
          endDate: "",
          location: "",
          city: "Dhaka",
          priority: "medium",
          notes: "",
        })
        fetchSchedules()
      }
    } catch (error) {
      console.error("Submit error:", error)
    }
  }

  const logout = () => {
    localStorage.clear()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
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
              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                📅 Maintenance
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/officer/dashboard"
                className="px-4 py-2 text-gray-600 hover:text-emerald-600"
              >
                📋 Ticket Queue
              </Link>
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📅 Maintenance Schedule</h1>
            <p className="text-gray-600">Manage field maintenance activities</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
          >
            {showForm ? "Cancel" : "+ New Schedule"}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-white p-8 rounded-2xl shadow-sm mb-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Maintenance Schedule</h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Title *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                  placeholder="Maintenance task title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Priority</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                  rows={3}
                  placeholder="Detailed description of the maintenance task"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">End Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Location *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                  placeholder="Work location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">City</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                >
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chattogram">Chattogram</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rangpur">Rangpur</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">Notes</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                  rows={2}
                  placeholder="Additional notes or requirements"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
                >
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Calendar Preview */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📆 Calendar View</h2>
          <div className="grid grid-cols-7 gap-2 text-center mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2 font-medium text-gray-600">{day}</div>
            ))}
            {Array.from({ length: 35 }, (_, i) => (
              <div
                key={i}
                className={`py-4 rounded-lg ${
                  i === 15 || i === 22
                    ? "bg-emerald-100 text-emerald-700 font-bold"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                } cursor-pointer transition`}
              >
                {((i % 30) + 1)}
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-100 rounded"></div>
              <span className="text-gray-600">Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 rounded"></div>
              <span className="text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span className="text-gray-600">Completed</span>
            </div>
          </div>
        </div>

        {/* Schedules List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Activities</h2>

          {schedules.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Schedules Yet</h3>
              <p className="text-gray-600">Create a new maintenance schedule to get started</p>
            </div>
          ) : (
            schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border border-gray-100"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{schedule.title}</h3>
                      <span className={`px-3 py-1 text-xs rounded-full ${statusColors[schedule.status]}`}>
                        {schedule.status === "scheduled" ? "Scheduled" :
                         schedule.status === "in-progress" ? "In Progress" :
                         schedule.status === "completed" ? "Completed" : "Cancelled"}
                      </span>
                      <span className={`px-3 py-1 text-xs rounded-full ${priorityColors[schedule.priority]}`}>
                        {schedule.priority.charAt(0).toUpperCase() + schedule.priority.slice(1)} Priority
                      </span>
                    </div>
                    {schedule.description && (
                      <p className="text-gray-600 mb-3">{schedule.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>📅 {new Date(schedule.scheduledDate).toLocaleString()}</span>
                      <span>📍 {schedule.location}</span>
                      <span>🏙️ {schedule.city}</span>
                      {schedule.officer && <span>👤 {schedule.officer.name}</span>}
                    </div>
                    {schedule.notes && (
                      <p className="mt-2 text-sm text-gray-500 italic">Note: {schedule.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition">
                      Edit
                    </button>
                    <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">
                      Complete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}