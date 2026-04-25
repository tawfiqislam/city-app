"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Department {
  id: string
  name: string
  icon: string
  color: string
}

interface Officer {
  id: string
  name: string
  email: string
  phone: string | null
  city: string | null
  createdAt: string
  department: {
    id: string
    name: string
    icon: string
    color: string
  } | null
}

export default function AddOfficerPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [officers, setOfficers] = useState<Officer[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    departmentId: "",
    city: "Dhaka",
  })

  const cities = [
    "Dhaka", "Chattogram", "Rajshahi", "Khulna",
    "Sylhet", "Rangpur", "Barishal", "Mymensingh",
  ]

  // Auth check
  useEffect(() => {
    const userData = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (!userData || !token) {
      router.push("/login")
      return
    }

    try {
      const user = JSON.parse(userData)
      if (user.role !== "admin") {
        router.push("/login")
        return
      }
      setAuthChecked(true)
    } catch {
      router.push("/login")
    }
  }, [router])

  // Fetch departments and officers
  useEffect(() => {
    if (!authChecked) return
    fetchDepartments()
    fetchOfficers()
  }, [authChecked])

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/admin/departments", {
        cache: "no-store",
      })
      const data = await res.json()
      if (res.ok && data.departments) {
        setDepartments(data.departments)
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err)
    }
  }

  const fetchOfficers = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/admin/add-officer", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const data = await res.json()
      if (res.ok && data.officers) {
        setOfficers(data.officers)
      }
    } catch (err) {
      console.error("Failed to fetch officers:", err)
    } finally {
      setFetchingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!formData.departmentId) {
      setError("Please select a department")
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/admin/add-officer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          departmentId: formData.departmentId,
          city: formData.city,
        }),
      })

      const contentType = res.headers.get("content-type") || ""
      if (!contentType.includes("application/json")) {
        throw new Error("Server returned invalid response")
      }

      const data = await res.json()

      if (res.ok && data.success) {
        setSuccess(data.message || "Officer added successfully!")
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          departmentId: "",
          city: "Dhaka",
        })
        setShowForm(false)
        fetchOfficers()
      } else {
        setError(data.error || "Failed to add officer")
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.clear()
    router.push("/login")
  }

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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">🏛️</span>
                <span className="text-xl font-bold text-emerald-600">
                  CityWatch
                </span>
              </Link>
              <div className="hidden md:block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                👮 Officer Management
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-emerald-600 text-sm font-medium"
              >
                ← Dashboard
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              👮 Officer Management
            </h1>
            <p className="text-gray-600 mt-1">
              Add new officers and assign them to departments
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setError("")
              setSuccess("")
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg flex items-center gap-2"
          >
            <span className="text-xl">{showForm ? "✕" : "+"}</span>
            <span>{showForm ? "Cancel" : "Add New Officer"}</span>
          </button>
        </div>

        {/* Success message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <div className="text-3xl mb-1">👮</div>
            <div className="text-3xl font-bold text-purple-600">
              {officers.length}
            </div>
            <div className="text-sm text-gray-600">Total Officers</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <div className="text-3xl mb-1">🏢</div>
            <div className="text-3xl font-bold text-blue-600">
              {departments.length}
            </div>
            <div className="text-sm text-gray-600">Departments</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <div className="text-3xl mb-1">✅</div>
            <div className="text-3xl font-bold text-green-600">
              {
                departments.filter((d) =>
                  officers.some((o) => o.department?.id === d.id)
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Staffed Depts</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <div className="text-3xl mb-1">⚠️</div>
            <div className="text-3xl font-bold text-orange-600">
              {
                departments.filter(
                  (d) => !officers.some((o) => o.department?.id === d.id)
                ).length
              }
            </div>
            <div className="text-sm text-gray-600">Unstaffed Depts</div>
          </div>
        </div>

        {/* ADD OFFICER FORM */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-lg">
                👮
              </span>
              Add New Officer
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-2">
                <span>⚠️</span>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-gray-50"
                    placeholder="e.g. Karim Uddin Ahmed"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-gray-50"
                    placeholder="officer@department.gov.bd"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-gray-50"
                    placeholder="+880 1XXXXXXXXX"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    City
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-gray-50"
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

                {/* Department */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {departments.map((dept) => (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, departmentId: dept.id })
                        }
                        className={`p-4 rounded-xl border-2 text-left transition ${
                          formData.departmentId === dept.id
                            ? "border-purple-500 bg-purple-50 shadow-md"
                            : "border-gray-200 hover:border-purple-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                            style={{
                              backgroundColor: `${dept.color || "#10B981"}20`,
                            }}
                          >
                            {dept.icon || "🏢"}
                          </div>
                          <span className="text-sm font-medium text-gray-800 leading-tight">
                            {dept.name}
                          </span>
                        </div>
                        {formData.departmentId === dept.id && (
                          <div className="mt-2">
                            <span className="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-0.5 rounded-full">
                              ✓ Selected
                            </span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-gray-50"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    className={`w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 text-gray-900 bg-gray-50 ${
                      formData.confirmPassword &&
                      formData.password !== formData.confirmPassword
                        ? "border-red-400 focus:ring-red-300"
                        : formData.confirmPassword &&
                          formData.password === formData.confirmPassword
                        ? "border-green-400 focus:ring-green-300"
                        : "border-gray-200 focus:ring-purple-500"
                    }`}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                  {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">
                        ⚠️ Passwords do not match
                      </p>
                    )}
                  {formData.confirmPassword &&
                    formData.password === formData.confirmPassword && (
                      <p className="text-green-600 text-xs mt-1">
                        ✅ Passwords match
                      </p>
                    )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setError("")
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.departmentId ||
                    formData.password !== formData.confirmPassword
                  }
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
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
                      Adding Officer...
                    </>
                  ) : (
                    <>
                      <span>👮</span>
                      <span>Add Officer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* OFFICERS LIST */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              All Officers ({officers.length})
            </h2>
            <button
              onClick={fetchOfficers}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition text-sm flex items-center gap-1"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
          </div>

          {fetchingData ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500">Loading officers...</p>
            </div>
          ) : officers.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-6xl mb-4">👮</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Officers Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Click the button above to add your first officer.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium"
              >
                Add First Officer
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Officer
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      City
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Added On
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {officers.map((officer) => (
                    <tr
                      key={officer.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{
                              backgroundColor:
                                officer.department?.color || "#8B5CF6",
                            }}
                          >
                            {officer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {officer.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Officer
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800">
                          {officer.email}
                        </p>
                        {officer.phone && (
                          <p className="text-xs text-gray-500">
                            {officer.phone}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {officer.department ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {officer.department.icon || "🏢"}
                            </span>
                            <span className="text-sm text-gray-700 font-medium">
                              {officer.department.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-red-500">
                            Not assigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {officer.city || "Dhaka"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {new Date(officer.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}