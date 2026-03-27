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

export default function DepartmentsPage() {
  const router = useRouter()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDept, setSelectedDept] = useState<Department | null>(null)
  const [error, setError] = useState("")

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
    try {
      const res = await fetch("/api/admin/departments")

      console.log("Response status:", res.status)

      const text = await res.text()
      console.log("Response text:", text)

      let data
      try {
        data = JSON.parse(text)
      } catch {
        setError("Server returned invalid response")
        return
      }

      if (data.departments) {
        setDepartments(data.departments)
      } else if (data.error) {
        setError(data.error)
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Failed to load departments")
    } finally {
      setLoading(false)
    }
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
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError("")
              setLoading(true)
              fetchDepartments()
            }}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
          >
            Try Again
          </button>
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
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                🏢 Departments & Staff
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-emerald-600 font-medium">
                ← Dashboard
              </Link>
              <Link href="/admin/reports" className="text-gray-600 hover:text-emerald-600 font-medium">
                📊 Reports
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏢 Department & Staff Directory</h1>
          <p className="text-gray-600 mt-2">View all city departments and their officers</p>
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">{departments.length}</div>
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
                {departments.reduce((sum, d) => sum + (d._count?.reports || 0), 0)}
              </div>
              <div className="text-sm text-purple-700">Total Reports</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="text-3xl font-bold text-orange-600">
                {departments.length > 0
                  ? Math.round(
                      departments.reduce((sum, d) => sum + (d._count?.reports || 0), 0) /
                      Math.max(departments.reduce((sum, d) => sum + d.officers.length, 0), 1)
                    )
                  : 0}
              </div>
              <div className="text-sm text-orange-700">Avg Reports/Officer</div>
            </div>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Departments Found</h3>
              <p className="text-gray-600">Run the database seed to create departments</p>
              <p className="text-gray-500 text-sm mt-2">npm run prisma:seed</p>
            </div>
          ) : (
            departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition cursor-pointer"
                onClick={() => setSelectedDept(dept)}
              >
                {/* Color Bar */}
                <div className="h-2" style={{ backgroundColor: dept.color || "#10B981" }} />

                <div className="p-6">
                  {/* Department Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ backgroundColor: `${dept.color || "#10B981"}20` }}
                    >
                      {dept.icon || "🏢"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{dept.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{dept.description}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-blue-700">{dept.officers.length}</div>
                      <div className="text-xs text-blue-600">Officers</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-green-700">{dept._count?.reports || 0}</div>
                      <div className="text-xs text-green-600">Reports</div>
                    </div>
                  </div>

                  {/* Officers Avatars */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {dept.officers.slice(0, 4).map((officer) => (
                        <div
                          key={officer.id}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white"
                          style={{ backgroundColor: dept.color || "#10B981" }}
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
                        {dept.officers.map(o => o.name.split(" ")[0]).slice(0, 2).join(", ")}
                        {dept.officers.length > 2 ? "..." : ""}
                      </span>
                    )}
                  </div>

                  {/* View Button */}
                  <button className="mt-4 w-full py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 text-sm font-medium transition border border-gray-200">
                    View Officers & Details →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Department Detail Modal */}
      {selectedDept && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDept(null)
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div
              className="p-6 border-b"
              style={{ backgroundColor: `${selectedDept.color || "#10B981"}10` }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                    style={{ backgroundColor: `${selectedDept.color || "#10B981"}30` }}
                  >
                    {selectedDept.icon || "🏢"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedDept.name}</h2>
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

            {/* Stats */}
            <div className="p-6 border-b border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-blue-700">{selectedDept.officers.length}</div>
                  <div className="text-sm text-blue-600">Officers</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-green-700">{selectedDept._count?.reports || 0}</div>
                  <div className="text-sm text-green-600">Reports</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-purple-700">
                    {selectedDept.officers.length > 0
                      ? Math.round((selectedDept._count?.reports || 0) / selectedDept.officers.length)
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
                  <p className="text-gray-600">No officers assigned to this department</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDept.officers.map((officer, index) => (
                    <div
                      key={officer.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                    >
                      <div className="w-10 h-10 flex items-center justify-center text-lg font-bold text-gray-500">
                        #{index + 1}
                      </div>
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                        style={{ backgroundColor: selectedDept.color || "#10B981" }}
                      >
                        {officer.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{officer.name}</p>
                        <p className="text-sm text-gray-500 truncate">{officer.email}</p>
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

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => setSelectedDept(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                Close
              </button>
              <Link
                href="/admin/reports"
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition text-center"
                onClick={() => setSelectedDept(null)}
              >
                View Reports →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}