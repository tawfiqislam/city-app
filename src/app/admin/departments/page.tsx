"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Department {
  id: string
  name: string
  description: string
  icon: string
  color: string
  officers: {
    id: string
    name: string
    email: string
    phone: string
  }[]
  _count: {
    reports: number
    officers: number
  }
}

interface Report {
  id: string
  title: string
  category: string
  location: string
  status: string
  priority: string
  isEmergency: boolean
  department: { id: string; name: string } | null
  assignments: { officer: { id: string; name: string } }[]
}

export default function DepartmentsPage() {
  const router = useRouter()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDept, setSelectedDept] = useState<Department | null>(null)
  const [error, setError] = useState("")

  const [showAssignWork, setShowAssignWork] = useState(false)
  const [assigningDept, setAssigningDept] = useState<Department | null>(null)
  const [availableReports, setAvailableReports] = useState<Report[]>([])
  const [selectedOfficerId, setSelectedOfficerId] = useState("")
  const [selectedReportId, setSelectedReportId] = useState("")
  const [assignLoading, setAssignLoading] = useState(false)
  const [reportsLoading, setReportsLoading] = useState(false)
  const [assignSuccess, setAssignSuccess] = useState("")

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
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/admin/departments", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()
        console.error("Non-JSON response:", text.substring(0, 200))
        setError(`Server error: Expected JSON but got HTML. Status: ${res.status}`)
        return
      }

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || `HTTP Error: ${res.status}`)
        return
      }

      if (data.departments) {
        setDepartments(data.departments)
      } else {
        setError("No departments data received")
      }
    } catch (err: any) {
      console.error("Fetch departments error:", err)
      setError(`Failed to load departments: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartmentReports = async (deptId: string) => {
    setReportsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/admin/all-reports", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Reports API returned non-JSON")
        setAvailableReports([])
        return
      }

      const data = await res.json()
      if (res.ok) {
        const deptReports = (data.reports || []).filter(
          (r: Report) =>
            r.department?.id === deptId &&
            (r.status === "pending" || r.status === "in-progress")
        )
        setAvailableReports(deptReports)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      setAvailableReports([])
    } finally {
      setReportsLoading(false)
    }
  }

  const openAssignWork = (dept: Department) => {
    setAssigningDept(dept)
    setSelectedOfficerId("")
    setSelectedReportId("")
    setAssignSuccess("")
    setShowAssignWork(true)
    fetchDepartmentReports(dept.id)
  }

  const handleAssignWork = async () => {
    if (!selectedOfficerId || !selectedReportId) {
      alert("Please select both an officer and a report")
      return
    }

    setAssignLoading(true)
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        alert("Please login again")
        return
      }

      const res = await fetch("/api/admin/assign-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportId: selectedReportId,
          departmentId: assigningDept?.id,
          officerId: selectedOfficerId,
        }),
      })

      const contentType = res.headers.get("content-type")

      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()
        console.error("Non-JSON response from assign-report:", text.substring(0, 300))
        alert("Server error. Check if /api/admin/assign-report route exists.")
        return
      }

      const data = await res.json()

      if (res.ok && data.success) {
        const officerName =
          assigningDept?.officers.find((o) => o.id === selectedOfficerId)?.name || "Officer"
        setAssignSuccess(`Successfully assigned to ${officerName}!`)
        setSelectedOfficerId("")
        setSelectedReportId("")
        if (assigningDept?.id) {
          fetchDepartmentReports(assigningDept.id)
        }
        fetchDepartments()
      } else {
        alert(data.error || "Failed to assign")
      }
    } catch (error: any) {
      console.error("Assign error:", error)
      alert("Network error: " + error.message)
    } finally {
      setAssignLoading(false)
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
          <p className="text-gray-600">Loading departments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-2">{error}</p>
          <p className="text-sm text-gray-500 mb-6">
            Make sure you are logged in as admin and the database is connected.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchDepartments}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
            >
              Try Again
            </button>
            <Link
              href="/admin/dashboard"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 inline-flex items-center"
            >
              Back to Dashboard
            </Link>
          </div>
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
              <div className="hidden md:block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                🏢 Departments & Staff
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-emerald-600 font-medium text-sm"
              >
                ← Dashboard
              </Link>
              <Link
                href="/admin/reports"
                className="text-gray-600 hover:text-emerald-600 font-medium text-sm"
              >
                📋 Reports
              </Link>
              <Link
                href="/admin/assign"
                className="text-gray-600 hover:text-emerald-600 font-medium text-sm"
              >
                👮 Assign Staff
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🏢 Department & Staff Directory
          </h1>
          <p className="text-gray-600 mt-2">
            View all city departments, officers, and assign work directly
          </p>
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">
                {departments.length}
              </div>
              <div className="text-sm text-blue-700">Departments</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <div className="text-3xl font-bold text-emerald-600">
                {departments.reduce((sum, d) => sum + d.officers.length, 0)}
              </div>
              <div className="text-sm text-emerald-700">Total Officers</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600">
                {departments.reduce(
                  (sum, d) => sum + (d._count?.reports || 0),
                  0
                )}
              </div>
              <div className="text-sm text-purple-700">Total Reports</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="text-3xl font-bold text-orange-600">
                {departments.length > 0
                  ? Math.round(
                      departments.reduce(
                        (sum, d) => sum + (d._count?.reports || 0),
                        0
                      ) /
                        Math.max(
                          departments.reduce(
                            (sum, d) => sum + d.officers.length,
                            0
                          ),
                          1
                        )
                    )
                  : 0}
              </div>
              <div className="text-sm text-orange-700">Avg Reports/Officer</div>
            </div>
          </div>
        </div>

        {/* Quick Assign Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👮</span>
            <div>
              <h2 className="text-xl font-bold">Quick Work Assignment</h2>
              <p className="text-purple-200 text-sm">
                Click &quot;Assign Work&quot; on any department card to assign a
                pending report to an officer
              </p>
            </div>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Departments Found
              </h3>
              <p className="text-gray-600">
                Run the database seed to create departments
              </p>
              <code className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded mt-2 inline-block">
                npm run prisma:seed
              </code>
            </div>
          ) : (
            departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
              >
                {/* Color Bar */}
                <div
                  className="h-2"
                  style={{ backgroundColor: dept.color || "#10B981" }}
                />

                <div className="p-6">
                  {/* Department Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{
                        backgroundColor: `${dept.color || "#10B981"}20`,
                      }}
                    >
                      {dept.icon || "🏢"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">
                        {dept.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {dept.description}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-blue-700">
                        {dept.officers.length}
                      </div>
                      <div className="text-xs text-blue-600">Officers</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-green-700">
                        {dept._count?.reports || 0}
                      </div>
                      <div className="text-xs text-green-600">Reports</div>
                    </div>
                  </div>

                  {/* Officers Avatars */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                      {dept.officers.slice(0, 4).map((officer) => (
                        <div
                          key={officer.id}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white"
                          style={{
                            backgroundColor: dept.color || "#10B981",
                          }}
                          title={officer.name}
                        >
                          {officer.name.charAt(0)}
                        </div>
                      ))}
                      {dept.officers.length > 4 && (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 border-2 border-white">
                          +{dept.officers.length - 4}
                        </div>
                      )}
                    </div>
                    {dept.officers.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {dept.officers
                          .map((o) => o.name.split(" ")[0])
                          .slice(0, 2)
                          .join(", ")}
                        {dept.officers.length > 2 ? "..." : ""}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedDept(dept)}
                      className="flex-1 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 text-sm font-medium transition border border-gray-200"
                    >
                      View Details →
                    </button>
                    <button
                      onClick={() => openAssignWork(dept)}
                      disabled={dept.officers.length === 0}
                      className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      👮 Assign Work
                    </button>
                  </div>

                  {dept.officers.length === 0 && (
                    <p className="text-xs text-red-500 text-center mt-2">
                      No officers in this department
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* ========== Department Detail Modal ========== */}
      {selectedDept && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDept(null)
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div
              className="p-6 border-b"
              style={{
                backgroundColor: `${selectedDept.color || "#10B981"}10`,
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                    style={{
                      backgroundColor: `${selectedDept.color || "#10B981"}30`,
                    }}
                  >
                    {selectedDept.icon || "🏢"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedDept.name}
                    </h2>
                    <p className="text-gray-600">{selectedDept.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDept(null)}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Stats */}
            <div className="p-6 border-b border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-blue-700">
                    {selectedDept.officers.length}
                  </div>
                  <div className="text-sm text-blue-600">Officers</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-green-700">
                    {selectedDept._count?.reports || 0}
                  </div>
                  <div className="text-sm text-green-600">Reports</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-purple-700">
                    {selectedDept.officers.length > 0
                      ? Math.round(
                          (selectedDept._count?.reports || 0) /
                            selectedDept.officers.length
                        )
                      : 0}
                  </div>
                  <div className="text-sm text-purple-600">Per Officer</div>
                </div>
              </div>
            </div>

            {/* Officers List */}
            <div className="p-6 overflow-y-auto max-h-96">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                👮 Staff Members ({selectedDept.officers.length})
              </h3>
              {selectedDept.officers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="text-gray-600">
                    No officers assigned to this department
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDept.officers.map((officer, index) => (
                    <div
                      key={officer.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                    >
                      <div className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-500">
                        #{index + 1}
                      </div>
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        style={{
                          backgroundColor: selectedDept.color || "#10B981",
                        }}
                      >
                        {officer.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {officer.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {officer.email}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-gray-600">{officer.phone}</p>
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          Officer
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => setSelectedDept(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const deptCopy = selectedDept
                  setSelectedDept(null)
                  openAssignWork(deptCopy)
                }}
                disabled={selectedDept.officers.length === 0}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition disabled:opacity-50"
              >
                👮 Assign Work to Officer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== Assign Work Modal ========== */}
      {showAssignWork && assigningDept && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAssignWork(false)
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl">
            {/* Modal Header */}
            <div
              className="p-6 border-b rounded-t-2xl"
              style={{
                backgroundColor: `${assigningDept.color || "#10B981"}15`,
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor: `${assigningDept.color || "#10B981"}30`,
                    }}
                  >
                    {assigningDept.icon || "🏢"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Assign Work to Officer
                    </h2>
                    <p className="text-sm text-gray-600">{assigningDept.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAssignWork(false)
                    setAssignSuccess("")
                  }}
                  className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Success Message */}
              {assignSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  {assignSuccess}
                </div>
              )}

              {/* Step 1: Select Officer */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Step 1: Select an Officer *
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                >
                  <option value="">-- Choose an officer --</option>
                  {assigningDept.officers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.name} ({officer.email})
                    </option>
                  ))}
                </select>

                {/* Selected Officer Preview */}
                {selectedOfficerId && (() => {
                  const officer = assigningDept.officers.find(
                    (o) => o.id === selectedOfficerId
                  )
                  if (!officer) return null
                  return (
                    <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{
                          backgroundColor: assigningDept.color || "#10B981",
                        }}
                      >
                        {officer.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          {officer.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {officer.email}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex-shrink-0">
                        Selected
                      </span>
                    </div>
                  )
                })()}
              </div>

              {/* Step 2: Select Report */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Step 2: Select a Report to Assign *
                </label>

                {reportsLoading ? (
                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 text-sm">
                      Loading available reports...
                    </span>
                  </div>
                ) : availableReports.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                    <div className="text-3xl mb-2">📭</div>
                    <p className="text-yellow-700 text-sm font-medium">
                      No pending reports for this department
                    </p>
                    <p className="text-yellow-600 text-xs mt-1">
                      All reports may already be assigned or resolved
                    </p>
                  </div>
                ) : (
                  <>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                      value={selectedReportId}
                      onChange={(e) => setSelectedReportId(e.target.value)}
                    >
                      <option value="">-- Choose a report --</option>
                      {availableReports.map((report) => (
                        <option key={report.id} value={report.id}>
                          {report.isEmergency ? "🚨 " : "📋 "}
                          {report.title} [{report.priority.toUpperCase()}] -{" "}
                          {report.location}
                        </option>
                      ))}
                    </select>

                    {/* Selected Report Preview */}
                    {selectedReportId &&
                      (() => {
                        const report = availableReports.find(
                          (r) => r.id === selectedReportId
                        )
                        if (!report) return null
                        return (
                          <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="flex items-start gap-2">
                              <span className="text-lg mt-0.5">
                                {report.isEmergency ? "🚨" : "📋"}
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">
                                  {report.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  📍 {report.location}
                                </p>
                                <div className="flex gap-2 mt-1.5 flex-wrap">
                                  <span
                                    className={`px-2 py-0.5 text-xs rounded-full ${
                                      report.priority === "urgent"
                                        ? "bg-red-100 text-red-700"
                                        : report.priority === "high"
                                        ? "bg-orange-100 text-orange-700"
                                        : report.priority === "medium"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {report.priority}
                                  </span>
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                                    {report.category}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 text-xs rounded-full ${
                                      report.status === "pending"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {report.status}
                                  </span>
                                </div>
                                {report.assignments.length > 0 && (
                                  <p className="text-xs text-orange-600 mt-1.5">
                                    ⚠️ Currently assigned to:{" "}
                                    {report.assignments[0].officer.name} (will be
                                    reassigned)
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })()}

                    <p className="text-xs text-gray-500 mt-2">
                      {availableReports.length} report(s) available
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setShowAssignWork(false)
                  setAssignSuccess("")
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignWork}
                disabled={
                  assignLoading ||
                  !selectedOfficerId ||
                  !selectedReportId ||
                  availableReports.length === 0
                }
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {assignLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Assigning...
                  </>
                ) : (
                  "👮 Assign Work"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}