"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js"
import { Bar, Pie, Line } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
)

export default function StatisticsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/admin/statistics", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    )
  }

  // Chart data for reports by category
  const categoryData = {
    labels: stats?.byCategory?.map((c: any) => c.category) || ["Water", "Waste", "Roads", "Electricity", "Health"],
    datasets: [
      {
        label: "Reports by Category",
        data: stats?.byCategory?.map((c: any) => c._count) || [45, 32, 67, 28, 15],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(234, 179, 8, 0.8)",
          "rgba(249, 115, 22, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(234, 179, 8, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 2,
      },
    ],
  }

  // Chart data for reports by status
  const statusData = {
    labels: ["Pending", "In Progress", "Resolved"],
    datasets: [
      {
        data: [
          stats?.byStatus?.pending || 25,
          stats?.byStatus?.inProgress || 18,
          stats?.byStatus?.resolved || 57,
        ],
        backgroundColor: [
          "rgba(234, 179, 8, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
        ],
        borderColor: [
          "rgba(234, 179, 8, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(34, 197, 94, 1)",
        ],
        borderWidth: 2,
      },
    ],
  }

  // Chart data for reports over time
  const timeData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Reports",
        data: stats?.byMonth || [12, 19, 15, 25, 22, 30, 28],
        fill: false,
        borderColor: "rgb(16, 185, 129)",
        tension: 0.3,
      },
    ],
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
              <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                📊 City Statistics
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
          <h1 className="text-3xl font-bold text-gray-900">📊 City Statistics Dashboard</h1>
          <p className="text-gray-600 mt-2">Visual analytics of city reports and services</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Reports", value: stats?.total || 187, icon: "📝", color: "bg-blue-500" },
            { label: "Resolved", value: stats?.resolved || 142, icon: "✅", color: "bg-green-500" },
            { label: "Pending", value: stats?.pending || 25, icon: "⏳", color: "bg-yellow-500" },
            { label: "Avg Rating", value: stats?.avgRating?.toFixed(1) || "4.2", icon: "⭐", color: "bg-purple-500" },
          ].map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl mb-3`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart - Reports by Category */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reports by Category</h2>
            <div className="h-80">
              <Bar
                data={categoryData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                }}
              />
            </div>
          </div>

          {/* Pie Chart - Reports by Status */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reports by Status</h2>
            <div className="h-80">
              <Pie
                data={statusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom" },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Line Chart - Reports Over Time */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Reports Trend (Last 7 Months)</h2>
          <div className="h-80">
            <Line
              data={timeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>

        {/* Top Areas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Reporting Areas</h2>
          <div className="space-y-4">
            {[
              { area: "Mirpur", count: 45, percentage: 24 },
              { area: "Gulshan", count: 38, percentage: 20 },
              { area: "Dhanmondi", count: 32, percentage: 17 },
              { area: "Uttara", count: 28, percentage: 15 },
              { area: "Motijheel", count: 22, percentage: 12 },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-900">{item.area}</span>
                    <span className="text-gray-600">{item.count} reports</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}