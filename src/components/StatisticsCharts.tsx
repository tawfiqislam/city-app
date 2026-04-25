"use client"

import { useEffect, useState } from "react"
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
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2"

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

interface StatisticsChartsProps {
  role: "admin" | "officer" | "citizen"
  reports: any[]
  userName?: string
}

export default function StatisticsCharts({
  role,
  reports,
  userName,
}: StatisticsChartsProps) {
  // ========== Calculate all stats from reports ==========

  // Reports by Category
  const categories = ["Water", "Waste", "Roads", "Electricity", "Health", "Other"]
  const categoryData = categories.map(
    (cat) => reports.filter((r) => r.category === cat).length
  )

  // Reports by Status
  const statusLabels = ["Pending", "In Progress", "Resolved"]
  const statusData = [
    reports.filter((r) => r.status === "pending").length,
    reports.filter((r) => r.status === "in-progress").length,
    reports.filter((r) => r.status === "resolved").length,
  ]

  // Reports by Priority
  const priorityLabels = ["Low", "Medium", "High", "Urgent"]
  const priorityData = [
    reports.filter((r) => r.priority === "low").length,
    reports.filter((r) => r.priority === "medium").length,
    reports.filter((r) => r.priority === "high").length,
    reports.filter((r) => r.priority === "urgent").length,
  ]

  // Reports over last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  const last7DaysLabels = last7Days.map((d) =>
    d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  )

  const last7DaysData = last7Days.map((day) => {
    return reports.filter((r) => {
      const created = new Date(r.createdAt)
      return (
        created.getDate() === day.getDate() &&
        created.getMonth() === day.getMonth() &&
        created.getFullYear() === day.getFullYear()
      )
    }).length
  })

  // Resolution rate
  const totalReports = reports.length
  const resolvedReports = reports.filter((r) => r.status === "resolved").length
  const resolutionRate =
    totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0

  // Emergency count
  const emergencyCount = reports.filter((r) => r.isEmergency).length

  // ========== Chart configurations ==========

  const barChartData = {
    labels: categories,
    datasets: [
      {
        label: "Reports per Category",
        data: categoryData,
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(234, 179, 8, 0.8)",
          "rgba(249, 115, 22, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(107, 114, 128, 0.8)",
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(234, 179, 8, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(239, 68, 68, 1)",
          "rgba(107, 114, 128, 1)",
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "📊 Reports by Category",
        font: { size: 14, weight: "bold" as const },
        color: "#374151",
      },
      tooltip: {
        callbacks: {
          label: (context: any) =>
            ` ${context.parsed.y} report${context.parsed.y !== 1 ? "s" : ""}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: "#6B7280",
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        ticks: { color: "#6B7280" },
        grid: { display: false },
      },
    },
  }

  const statusPieData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusData,
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

  const statusPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 16,
          color: "#374151",
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: "🥧 Reports by Status",
        font: { size: 14, weight: "bold" as const },
        color: "#374151",
      },
    },
  }

  const priorityDoughnutData = {
    labels: priorityLabels,
    datasets: [
      {
        data: priorityData,
        backgroundColor: [
          "rgba(107, 114, 128, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(249, 115, 22, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgba(107, 114, 128, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 2,
      },
    ],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 12,
          color: "#374151",
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: "🎯 Reports by Priority",
        font: { size: 14, weight: "bold" as const },
        color: "#374151",
      },
    },
  }

  const lineChartData = {
    labels: last7DaysLabels,
    datasets: [
      {
        label: "Reports Submitted",
        data: last7DaysData,
        fill: true,
        borderColor:
          role === "admin"
            ? "rgba(139, 92, 246, 1)"
            : role === "officer"
            ? "rgba(59, 130, 246, 1)"
            : "rgba(16, 185, 129, 1)",
        backgroundColor:
          role === "admin"
            ? "rgba(139, 92, 246, 0.1)"
            : role === "officer"
            ? "rgba(59, 130, 246, 0.1)"
            : "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        pointBackgroundColor:
          role === "admin"
            ? "rgba(139, 92, 246, 1)"
            : role === "officer"
            ? "rgba(59, 130, 246, 1)"
            : "rgba(16, 185, 129, 1)",
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "📈 Reports - Last 7 Days",
        font: { size: 14, weight: "bold" as const },
        color: "#374151",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: "#6B7280",
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        ticks: {
          color: "#6B7280",
          maxRotation: 45,
        },
        grid: { display: false },
      },
    },
  }

  // If no reports
  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          No Data Available Yet
        </h3>
        <p className="text-gray-600">
          Statistics will appear here once reports are submitted.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ===== Summary Cards ===== */}
      <div
        className={`grid grid-cols-2 gap-4 ${
          role === "admin" ? "md:grid-cols-4" : "md:grid-cols-3"
        }`}
      >
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-3xl font-bold text-gray-900">{totalReports}</div>
          <div className="text-sm text-gray-600 mt-1">Total Reports</div>
        </div>

        <div className="bg-green-50 rounded-2xl p-5 border border-green-100 shadow-sm text-center">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-3xl font-bold text-green-700">{resolvedReports}</div>
          <div className="text-sm text-green-600 mt-1">Resolved</div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 shadow-sm text-center">
          <div className="text-3xl mb-2">📈</div>
          <div className="text-3xl font-bold text-blue-700">{resolutionRate}%</div>
          <div className="text-sm text-blue-600 mt-1">Resolution Rate</div>
        </div>

        {role === "admin" && (
          <div className="bg-red-50 rounded-2xl p-5 border border-red-100 shadow-sm text-center">
            <div className="text-3xl mb-2">🚨</div>
            <div className="text-3xl font-bold text-red-700">{emergencyCount}</div>
            <div className="text-sm text-red-600 mt-1">Emergencies</div>
          </div>
        )}
      </div>

      {/* ===== Main Charts Row ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - Reports per Category (MAIN FEATURE) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="h-72">
            <Bar data={barChartData} options={barChartOptions} />
          </div>

          {/* Category breakdown table */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {categories.map((cat, i) => (
              <div
                key={cat}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs"
              >
                <span className="text-gray-600">
                  {cat === "Water" && "💧"}
                  {cat === "Waste" && "🗑️"}
                  {cat === "Roads" && "🛣️"}
                  {cat === "Electricity" && "⚡"}
                  {cat === "Health" && "🏥"}
                  {cat === "Other" && "📋"} {cat}
                </span>
                <span className="font-bold text-gray-900">{categoryData[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie Chart - Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="h-72">
            <Pie data={statusPieData} options={statusPieOptions} />
          </div>
        </div>
      </div>

      {/* ===== Second Row ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Trend */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="h-64">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Doughnut - Priority */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="h-64">
            <Doughnut data={priorityDoughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* ===== Resolution Progress Bar ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-4">📊 Overall Resolution Progress</h3>
        <div className="space-y-3">
          {[
            {
              label: "Pending",
              value: statusData[0],
              total: totalReports,
              color: "bg-yellow-500",
              icon: "⏳",
            },
            {
              label: "In Progress",
              value: statusData[1],
              total: totalReports,
              color: "bg-blue-500",
              icon: "🔄",
            },
            {
              label: "Resolved",
              value: statusData[2],
              total: totalReports,
              color: "bg-green-500",
              icon: "✅",
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  {item.icon} {item.label}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {item.value}{" "}
                  <span className="font-normal text-gray-500">
                    ({item.total > 0
                      ? Math.round((item.value / item.total) * 100)
                      : 0}%)
                  </span>
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-700`}
                  style={{
                    width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}