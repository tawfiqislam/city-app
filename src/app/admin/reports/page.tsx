"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Report {
  id: string
  title: string
  description: string
  category: string
  location: string
  city: string
  status: string
  priority: string
  isEmergency: boolean
  imageUrl: string | null
  createdAt: string
  user: { name: string; email: string; phone: string }
  department: { id: string; name: string } | null
  assignments: {
    id: string
    officer: { id: string; name: string; email: string }
    claimedAt: string | null
  }[]
}

interface Department {
  id: string
  name: string
  icon: string
  officers: { id: string; name: string; email: string }[]
  _count: { reports: number }
}

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  "in-progress": "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
}

const categoryIcons: Record<string, string> = {
  Water: "💧",
  Waste: "🗑️",
  Roads: "🛣️",
  Electricity: "⚡",
  Health: "🏥",
}

export default function AdminReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignData, setAssignData] = useState({
    reportId: "",
    departmentId: "",
    officerId: "",
  })
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    const user = JSON.parse(userData)
    if (user.role !== "admin") {
      router.push("/login")
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch all reports
      const reportsRes = await fetch("/api/admin/all-reports", {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Fetch departments with officers
      const deptsRes = await fetch("/api/admin/departments", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (reportsRes.ok) {
        const data = await reportsRes.json()
        setReports(data.reports || [])
      }

      if (deptsRes.ok) {
        const data = await deptsRes.json()
        setDepartments(data.departments || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Open assign modal
  const openAssignModal = (report: Report) => {
    setAssignData({
      reportId: report.id,
      departmentId: report.department?.id || "",
      officerId: "",
    })
    setShowAssignModal(true)
  }

  // Get officers for selected department
  const getOfficersForDepartment = () => {
    const dept = departments.find((d) => d.id === assignData.departmentId)
    return dept?.officers || []
  }

  // Assign report to department and officer
  const handleAssign = async () => {
    if (!assignData.departmentId) {
      alert("Please select a department")
      return
    }

    setAssigning(true)

    try {
      const token = localStorage.getItem("token")

      const res = await fetch("/api/admin/assign-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assignData),
      })

      const data = await res.json()

      if (res.ok) {
        alert("✅ Report assigned successfully!")
        setShowAssignModal(false)
        fetchData()
      } else {
        alert("❌ " + (data.error || "Failed to assign"))
      }
    } catch (error) {
      alert("❌ Failed to assign report")
    } finally {
      setAssigning(false)
    }
  }

  // Filter reports
  const filteredReports = reports.filter((report) => {
    if (activeTab === "pending" && report.status !== "pending") return false
    if (activeTab === "in-progress" && report.status !== "in-progress") return false
    if (activeTab === "resolved" && report.status !== "resolved") return false
    if (activeTab === "unassigned" && report.department) return false
    if (activeTab === "emergency" && !report.isEmergency) return false

    if (categoryFilter && report.category !== categoryFilter) return false

    if (search) {
      const s = search.toLowerCase()
      return (
        report.title.toLowerCase().includes(s) ||
        report.location.toLowerCase().includes(s) ||
        report.user.name.toLowerCase().includes(s) ||
        report.description.toLowerCase().includes(s)
      )
    }

    return true
  })

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    inProgress: reports.filter((r) => r.status === "in-progress").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    unassigned: reports.filter((r) => !r.department).length,
    emergency: reports.filter((r) => r.isEmergency).length,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
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
                📊 Report Management
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-emerald-600">
                ← Dashboard
              </Link>
              <Link href="/admin/departments" className="text-gray-600 hover:text-emerald-600">
                🏢 Departments
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 All Reports</h1>
          <p className="text-gray-600 mt-2">View, manage and assign reports to departments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
          {[
            { label: "Total", value: stats.total, icon: "📝", color: "bg-gray-100" },
            { label: "Pending", value: stats.pending, icon: "⏳", color: "bg-yellow-100" },
            { label: "In Progress", value: stats.inProgress, icon: "🔄", color: "bg-blue-100" },
            { label: "Resolved", value: stats.resolved, icon: "✅", color: "bg-green-100" },
            { label: "Unassigned", value: stats.unassigned, icon: "❗", color: "bg-orange-100" },
            { label: "Emergency", value: stats.emergency, icon: "🚨", color: "bg-red-100" },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} p-4 rounded-xl text-center`}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "all", label: "All" },
                { id: "unassigned", label: "❗ Unassigned" },
                { id: "pending", label: "Pending" },
                { id: "in-progress", label: "In Progress" },
                { id: "resolved", label: "Resolved" },
                { id: "emergency", label: "🚨 Emergency" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search and Category */}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="🔍 Search reports..."
                className="px-4 py-2 border border-gray-200 rounded-lg w-48"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Water">💧 Water</option>
                <option value="Waste">🗑️ Waste</option>
                <option value="Roads">🛣️ Roads</option>
                <option value="Electricity">⚡ Electricity</option>
                <option value="Health">🏥 Health</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports Found</h3>
              <p className="text-gray-600">Try changing your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Report</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Priority</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Department</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Officer</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className={`hover:bg-gray-50 ${
                        report.isEmergency ? "bg-red-50" : ""
                      }`}
                    >
                      {/* Report Info */}
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2 max-w-xs">
                          {report.isEmergency && (
                            <span className="text-red-500 animate-pulse">🚨</span>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">
                              {report.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              📍 {report.location}
                            </p>
                            <p className="text-xs text-gray-500">
                              👤 {report.user.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-1 text-sm">
                          {categoryIcons[report.category]} {report.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[report.status]}`}>
                          {report.status === "pending"
                            ? "Pending"
                            : report.status === "in-progress"
                            ? "In Progress"
                            : "Resolved"}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[report.priority]}`}>
                          {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-4">
                        {report.department ? (
                          <span className="text-sm text-gray-700">
                            {report.department.name}
                          </span>
                        ) : (
                          <span className="text-sm text-red-500 font-medium">
                            ❗ Not Assigned
                          </span>
                        )}
                      </td>

                      {/* Assigned Officer */}
                      <td className="px-4 py-4">
                        {report.assignments.length > 0 ? (
                          <span className="text-sm text-gray-700">
                            👮 {report.assignments[0].officer.name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">
                            No officer
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => openAssignModal(report)}
                            className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200"
                          >
                            🔄 Assign
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Department Summary */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🏢 Department Report Summary</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const deptReports = reports.filter((r) => r.department?.id === dept.id)
              const pending = deptReports.filter((r) => r.status === "pending").length
              const inProgress = deptReports.filter((r) => r.status === "in-progress").length
              const resolved = deptReports.filter((r) => r.status === "resolved").length

              return (
                <div key={dept.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{dept.icon || "🏢"}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{dept.name}</h3>
                      <p className="text-sm text-gray-500">
                        {dept.officers.length} officers
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-yellow-50 p-2 rounded-lg">
                      <div className="text-lg font-bold text-yellow-700">{pending}</div>
                      <div className="text-xs text-yellow-600">Pending</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <div className="text-lg font-bold text-blue-700">{inProgress}</div>
                      <div className="text-xs text-blue-600">Active</div>
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg">
                      <div className="text-lg font-bold text-green-700">{resolved}</div>
                      <div className="text-xs text-green-600">Done</div>
                    </div>
                  </div>

                  {/* Officers in department */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Officers:</p>
                    <div className="flex flex-wrap gap-1">
                      {dept.officers.map((officer) => (
                        <span
                          key={officer.id}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {officer.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* View Report Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReport(null)
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className={`p-6 border-b sticky top-0 z-10 ${
              selectedReport.isEmergency ? "bg-red-50" : "bg-gray-50"
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{categoryIcons[selectedReport.category]}</span>
                    {selectedReport.isEmergency && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">🚨 Emergency</span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedReport.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-2 flex-wrap">
                <span className={`px-3 py-1 text-sm rounded-full ${statusColors[selectedReport.status]}`}>
                  {selectedReport.status}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${priorityColors[selectedReport.priority]}`}>
                  {selectedReport.priority}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-1">Description</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">{selectedReport.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">📍 {selectedReport.location}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">🏙️ {selectedReport.city}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">🏢 {selectedReport.department?.name || "Not Assigned"}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">📅 {new Date(selectedReport.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h3 className="font-bold mb-2">👤 Reported By</h3>
                <p>{selectedReport.user.name} | {selectedReport.user.email} | {selectedReport.user.phone}</p>
              </div>

              {selectedReport.assignments.length > 0 && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h3 className="font-bold mb-2">👮 Assigned Officer</h3>
                  {selectedReport.assignments.map((a, i) => (
                    <p key={i}>{a.officer.name} - {a.officer.email}</p>
                  ))}
                </div>
              )}

              {selectedReport.imageUrl && (
                <div>
                  <h3 className="font-bold mb-2">📷 Photo</h3>
                  <img src={selectedReport.imageUrl} alt="Report" className="w-full max-h-64 object-contain rounded-xl bg-gray-100" />
                </div>
              )}
            </div>

            <div className="p-6 border-t flex gap-4 sticky bottom-0 bg-white">
              <button
                onClick={() => setSelectedReport(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  openAssignModal(selectedReport)
                  setSelectedReport(null)
                }}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
              >
                🔄 Assign to Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAssignModal(false)
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">🔄 Assign Report</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Select Department */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Select Department *
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900"
                  value={assignData.departmentId}
                  onChange={(e) =>
                    setAssignData({
                      ...assignData,
                      departmentId: e.target.value,
                      officerId: "",
                    })
                  }
                >
                  <option value="">Choose a department...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.icon} {dept.name} ({dept.officers.length} officers)
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Officer (optional) */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Assign Officer (Optional)
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900"
                  value={assignData.officerId}
                  onChange={(e) =>
                    setAssignData({ ...assignData, officerId: e.target.value })
                  }
                  disabled={!assignData.departmentId}
                >
                  <option value="">Choose an officer (optional)...</option>
                  {getOfficersForDepartment().map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      👮 {officer.name} - {officer.email}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  If no officer is selected, the report will be visible to all officers in the department
                </p>
              </div>

              {/* Department Officers Preview */}
              {assignData.departmentId && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Officers in this department:
                  </p>
                  <div className="space-y-2">
                    {getOfficersForDepartment().map((officer) => (
                      <div key={officer.id} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-sm">
                          {officer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{officer.name}</p>
                          <p className="text-xs text-gray-500">{officer.email}</p>
                        </div>
                      </div>
                    ))}
                    {getOfficersForDepartment().length === 0 && (
                      <p className="text-sm text-gray-500">No officers in this department</p>
                    )}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assigning || !assignData.departmentId}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50"
                >
                  {assigning ? "Assigning..." : "Assign Report"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}