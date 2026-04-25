"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import WeatherWidget from "@/components/WeatherWidget"

export default function WeatherPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl">
                🏛️
              </div>
              <div>
                <p className="font-bold text-lg">CityWatch Bangladesh</p>
                <p className="text-blue-200 text-xs">
                  Citizen Complaint &amp; Service Management
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/public/activity"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition"
              >
                <span>📢</span>
                <span>Activity</span>
              </Link>
              <Link
                href="/public/resolved"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition"
              >
                <span>✅</span>
                <span>Resolved</span>
              </Link>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm font-medium flex items-center gap-2"
              >
                <span>←</span>
                <span>Go Back</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Page Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <span>🌦️</span>
            <span>Live Weather — Powered by OpenWeatherMap API</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Bangladesh Weather Update
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Live weather conditions for all 64 districts of Bangladesh. Search
            any district to see temperature, humidity, wind speed, alerts, and
            more.
          </p>
        </div>

        {/* Weather Widget */}
        <WeatherWidget />

        {/* Info Cards */}
        <div className="mt-10 grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <div className="text-3xl mb-2">🌡️</div>
            <h3 className="font-bold text-gray-900 mb-1">
              Real-time Temperature
            </h3>
            <p className="text-sm text-gray-600">
              Live temperature data from OpenWeatherMap for all districts
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <div className="text-3xl mb-2">⚠️</div>
            <h3 className="font-bold text-gray-900 mb-1">Weather Alerts</h3>
            <p className="text-sm text-gray-600">
              Automatic alerts for storms, heavy rain, and severe conditions
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
            <div className="text-3xl mb-2">🗺️</div>
            <h3 className="font-bold text-gray-900 mb-1">All 64 Districts</h3>
            <p className="text-sm text-gray-600">
              Search and switch between every district in Bangladesh instantly
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">
            Have a City Issue to Report?
          </h2>
          <p className="text-emerald-100 mb-6 max-w-md mx-auto">
            Use CityWatch to report water, road, electricity or other city
            issues to the right department.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-6 py-3 bg-white text-emerald-700 rounded-xl font-bold hover:bg-emerald-50 transition shadow-lg"
            >
              Register and Report
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 transition border border-emerald-400"
            >
              Login to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}