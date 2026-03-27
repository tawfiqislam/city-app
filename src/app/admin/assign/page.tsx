"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Report {
  id: string
  title: string
  category: string
  location: string
  status: string
  priority: string
  isEmergency: boolean
  department: { id: string; name: string } | null
  assignments: any[]
}

interface Officer {
  id: string
  name: string
  email: string
  department: { name: string } | null
}

export default function AssignPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [officers, setOfficers] = useState<Officer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<string>("")
  const [selectedOfficer, setSelectedOfficer] = useState<string>("")
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

      // Fetch unassigned reports
      const reportsRes = await fetch("/api/admin/unassigned-reports", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const reportsData = await reportsRes.json()

      // Fetch officers
      const officersRes = await fetch("/api/admin/officers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const officersData = await officersRes.json()

      if (reportsRes.ok) setReports(reportsData.reports)
      if (officersRes.ok) setOfficers(officersData.officers)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedReport || !selectedOfficer) {
      alert("Please select both a report and an officer")
      return
    }

    setAssigning(true)

    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/admin/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportId: selectedReport,
          officerId: selectedOfficer,
        }),
      })

      if (res.ok) {
        alert("Officer assigned successfully!")
        setSelectedReport("")
        setSelectedOfficer("")
        fetchData()
      } else {
        throw new Error("Assignment failed")
      }
    } catch (error) {
      alert("Failed to assign officer")
    } finally {
      setAssigning(false)
    }
  }

  // Get officers for selected report's department
  const getAvailableOfficers = () => {
    const report = reports.find((r) => r.id === selectedReport)
    if (!report || !report.department) return officers

    return officers.filter(
      (o) => o.department?.name === report.department?.name
    )
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
                👮 Staff Assignment
              </div>
            </div>
            <Link
              href="/admin/dashboard"
              className="text-gray-600 hover:text-emerald-600"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">👮 Assign Staff to Reports</h1>
          <p className="text-gray-600 mt-2">Select a report and assign an officer</p>
        </div>

        {/* Assignment Panel */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Assignment</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Select Report */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Select Report *
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                value={selectedReport}
                onChange={(e) => {
                  setSelectedReport(e.target.value)
                  setSelectedOfficer("")
                }}
              >
                <option value="">Choose a report...</option>
                {reports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.isEmergency ? "🚨 " : ""}
                    {report.title} - {report.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Officer */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Select Officer *
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-gray-900"
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                disabled={!selectedReport}
              >
                <option value="">Choose an officer...</option>
                {getAvailableOfficers().map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.name} - {officer.department?.name || "No Dept"}
                  </option>
                ))}
              </select>
            </div>

            {/* Assign Button */}
            <div className="flex items-end">
              <button
                onClick={handleAssign}
                disabled={assigning || !selectedReport || !selectedOfficer}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {assigning ? "Assigning..." : "Assign Officer"}
              </button>
            </div>
          </div>
        </div>

        {/* Pending Reports Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              Unassigned Reports ({reports.length})
            </h2>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">All reports have been assigned to officers.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Report</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Priority</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Department</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {report.isEmergency && <span className="text-red-500">🚨</span>}
                          <div>
                            <p className="font-medium text-gray-900">{report.title}</p>
                            <p className="text-sm text-gray-500">{report.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{report.category}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          report.priority === "urgent" ? "bg-red-100 text-red-700" :
                          report.priority === "high" ? "bg-orange-100 text-orange-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {report.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {report.department?.name || "Unassigned"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedReport(report.id)}
                          className="text-emerald-600 hover:underline"
                        >
                          Assign
                        </button>
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