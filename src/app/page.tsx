import Link from "next/link"

export default function HomePage() {
  const stats = [
    { label: "Total Reports", value: "12,345", icon: "📝" },
    { label: "Resolved", value: "9,856", icon: "✅" },
    { label: "In Progress", value: "1,890", icon: "🔄" },
    { label: "Avg Rating", value: "4.5", icon: "⭐" },
  ]

  const divisions = [
    "Dhaka",
    "Chattogram",
    "Rajshahi",
    "Khulna",
    "Barishal",
    "Sylhet",
    "Rangpur",
    "Mymensingh",
  ]

  const categories = [
    { name: "Water Supply", icon: "💧", color: "bg-blue-500", count: "3,245" },
    { name: "Waste Management", icon: "🗑️", color: "bg-green-500", count: "2,156" },
    { name: "Roads & Highways", icon: "🛣️", color: "bg-yellow-500", count: "4,567" },
    { name: "Electricity", icon: "⚡", color: "bg-orange-500", count: "1,890" },
    { name: "Public Health", icon: "🏥", color: "bg-red-500", count: "987" },
  ]

  const howItWorks = [
    {
      step: "1",
      title: "Create Account",
      desc: "Register easily with mobile or email",
      icon: "👤",
    },
    {
      step: "2",
      title: "Submit Report",
      desc: "Describe your issue with photos and details",
      icon: "📝",
    },
    {
      step: "3",
      title: "Track Progress",
      desc: "Get real-time status updates from departments",
      icon: "📊",
    },
    {
      step: "4",
      title: "Give Feedback",
      desc: "Rate the service after issue resolution",
      icon: "⭐",
    },
  ]

  const majorCities = [
    { city: "Dhaka", pop: "21M+", icon: "🏙️" },
    { city: "Chattogram", pop: "5M+", icon: "🚢" },
    { city: "Khulna", pop: "1.5M+", icon: "🌿" },
    { city: "Rajshahi", pop: "1M+", icon: "🥭" },
    { city: "Sylhet", pop: "700K+", icon: "🍵" },
    { city: "Rangpur", pop: "400K+", icon: "🌾" },
    { city: "Barishal", pop: "350K+", icon: "⛵" },
    { city: "Comilla", pop: "500K+", icon: "🏛️" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* ================= HEADER ================= */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl">
                🏛️
              </div>
              <div>
                <h1 className="text-2xl font-bold">CityWatch Bangladesh</h1>
                <p className="text-sm text-emerald-100">
                  Citizen Complaint &amp; Service Management
                </p>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              <Link
                href="/weather"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition"
              >
                <span>🌦️</span>
                <span>Weather</span>
              </Link>
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
              <Link
                href="/login"
                className="px-5 py-2 bg-white text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition shadow-md text-sm"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-400 transition border border-emerald-400 text-sm"
              >
                Register
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center relative">
          <div className="inline-block mb-6 px-4 py-2 bg-emerald-100 rounded-full">
            <span className="text-emerald-700 font-medium">
              Bangladesh&apos;s First Digital Civic Platform
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your City,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              Your Responsibility
            </span>
          </h2>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            From potholes to water issues — report any civic problem and track
            the progress of its resolution. Together, let&apos;s build a Smart
            Bangladesh.
          </p>

          {/* Main CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition shadow-lg shadow-emerald-500/30"
            >
              Submit a Complaint
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-emerald-600 text-lg rounded-xl font-medium border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 transition"
            >
              Track Your Report
            </Link>
          </div>

          {/* Secondary Links Row */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link
              href="/weather"
              className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition shadow-sm group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                🌦️
              </span>
              <div className="text-left">
                <p className="font-semibold text-sm">Bangladesh Weather</p>
                <p className="text-xs text-gray-500">
                  All 64 districts live
                </p>
              </div>
            </Link>

            <Link
              href="/public/activity"
              className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-emerald-300 transition shadow-sm"
            >
              <span className="text-2xl">📢</span>
              <div className="text-left">
                <p className="font-semibold text-sm">Public Activity Feed</p>
                <p className="text-xs text-gray-500">See all resolved issues</p>
              </div>
            </Link>

            <Link
              href="/public/resolved"
              className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-emerald-300 transition shadow-sm"
            >
              <span className="text-2xl">⭐</span>
              <div className="text-left">
                <p className="font-semibold text-sm">Resolved Issues</p>
                <p className="text-xs text-gray-500">Rate city services</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="py-12 bg-white/80 backdrop-blur-sm border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm"
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PUBLIC TRANSPARENCY ================= */}
      <section className="py-16 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Public Services
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Anyone can access these public pages without logging in. Full
              transparency in city governance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Weather Card */}
            <Link href="/weather">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mb-4">
                  🌦️
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Bangladesh Weather
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  Live weather for all 64 districts. Search any district and get
                  temperature, humidity, wind, alerts and more.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    64 Districts
                  </span>
                  <span className="px-2 py-1 bg-sky-100 text-sky-700 text-xs rounded-full">
                    Live Data
                  </span>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                    Alerts
                  </span>
                </div>
                <span className="text-blue-600 font-medium text-sm">
                  Check Weather →
                </span>
              </div>
            </Link>

            {/* Activity Feed Card */}
            <Link href="/public/activity">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-3xl mb-4">
                  📢
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Public Activity History
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  A live timeline feed of all city issues that have been
                  successfully resolved by government departments.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                    Timeline
                  </span>
                  <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                    Departments
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Resolution Time
                  </span>
                </div>
                <span className="text-emerald-600 font-medium text-sm">
                  View Activity →
                </span>
              </div>
            </Link>

            {/* Resolved Card */}
            <Link href="/public/resolved">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center text-3xl mb-4">
                  ⭐
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Resolved Issues
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  See all resolved city issues along with citizen star ratings
                  and feedback comments.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    Ratings
                  </span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    Comments
                  </span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                    Filters
                  </span>
                </div>
                <span className="text-emerald-600 font-medium text-sm">
                  View Resolved →
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Report Categories
            </h3>
            <p className="text-gray-600">
              Submit your complaints under various departments
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center"
              >
                <div
                  className={`w-14 h-14 ${cat.color} rounded-xl flex items-center justify-center text-2xl mb-4 mx-auto group-hover:scale-110 transition-transform`}
                >
                  {cat.icon}
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{cat.name}</h4>
                <p className="text-sm text-gray-500">{cat.count} reports</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= DIVISIONS ================= */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Serving Across Bangladesh
            </h3>
            <p className="text-emerald-100">
              Our services are available in all divisions
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {divisions.map((division, index) => (
              <div
                key={index}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition cursor-pointer flex items-center gap-2"
              >
                <span>📍</span>
                <span>{division}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                  {item.icon}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MAJOR CITIES ================= */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Major Cities We Cover
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {majorCities.map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition text-center"
              >
                <div className="text-4xl mb-2">{item.icon}</div>
                <h4 className="font-bold text-gray-900">{item.city}</h4>
                <p className="text-sm text-gray-500">
                  Population: {item.pop}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Get Started Today</h3>
          <p className="text-gray-400 mb-8">
            Join thousands of citizens and make your city a better place
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/register"
              className="px-8 py-4 bg-emerald-500 text-white text-lg rounded-xl font-medium hover:bg-emerald-400 transition"
            >
              Register for Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-gray-800 text-white text-lg rounded-xl font-medium border border-gray-700 hover:bg-gray-700 transition"
            >
              Sign In
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link
              href="/weather"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700 transition text-sm"
            >
              <span>🌦️</span>
              <span>Bangladesh Weather</span>
            </Link>
            <Link
              href="/public/activity"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700 transition text-sm"
            >
              <span>📢</span>
              <span>Public Activity Feed</span>
            </Link>
            <Link
              href="/public/resolved"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700 transition text-sm"
            >
              <span>✅</span>
              <span>Resolved Issues</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Logo */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏛️</span>
                <span className="font-bold text-xl">CityWatch Bangladesh</span>
              </div>
              <p className="text-gray-400 text-sm">
                A Unified Citizen Reporting and Smart Management System for
                efficient city governance and citizen engagement.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-white transition"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    href="/weather"
                    className="hover:text-white transition"
                  >
                    Bangladesh Weather
                  </Link>
                </li>
                <li>
                  <Link
                    href="/public/activity"
                    className="hover:text-white transition"
                  >
                    Public Activity Feed
                  </Link>
                </li>
                <li>
                  <Link
                    href="/public/resolved"
                    className="hover:text-white transition"
                  >
                    Resolved Issues
                  </Link>
                </li>
              </ul>
            </div>

            {/* Public Pages */}
            <div>
              <h4 className="font-bold mb-4 text-white">Public Pages</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/weather"
                    className="text-gray-400 hover:text-white transition flex items-center gap-2"
                  >
                    <span className="text-lg">🌦️</span>
                    <div>
                      <p className="font-medium text-gray-300">
                        Bangladesh Weather
                      </p>
                      <p className="text-xs text-gray-500">
                        All 64 districts live
                      </p>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/public/activity"
                    className="text-gray-400 hover:text-white transition flex items-center gap-2"
                  >
                    <span className="text-lg">📢</span>
                    <div>
                      <p className="font-medium text-gray-300">
                        Activity Feed
                      </p>
                      <p className="text-xs text-gray-500">
                        Timeline of resolved issues
                      </p>
                    </div>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/public/resolved"
                    className="text-gray-400 hover:text-white transition flex items-center gap-2"
                  >
                    <span className="text-lg">⭐</span>
                    <div>
                      <p className="font-medium text-gray-300">
                        Resolved Issues
                      </p>
                      <p className="text-xs text-gray-500">
                        Rate city services
                      </p>
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Project Info */}
          <div className="border-t border-gray-800 pt-8">
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <div className="text-center mb-4">
                <h4 className="font-bold text-lg text-emerald-400">
                  CSE471 - System Analysis and Design
                </h4>
                <p className="text-gray-400">Lab Section: 10 | Spring 2026</p>
                <p className="text-gray-400">Group No: 04</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full max-w-2xl mx-auto text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-2 px-4 text-left text-gray-400 font-medium">
                        Student ID
                      </th>
                      <th className="py-2 px-4 text-left text-gray-400 font-medium">
                        Name
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700/50">
                      <td className="py-3 px-4 text-emerald-400 font-mono">
                        22299503
                      </td>
                      <td className="py-3 px-4 text-white">
                        Moumita Das Pritha
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/50">
                      <td className="py-3 px-4 text-emerald-400 font-mono">
                        22299482
                      </td>
                      <td className="py-3 px-4 text-white">
                        Humayra Mahmud Neha
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700/50">
                      <td className="py-3 px-4 text-emerald-400 font-mono">
                        23101183
                      </td>
                      <td className="py-3 px-4 text-white">
                        Md. Tawfiq Islam
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-emerald-400 font-mono">
                        22299486
                      </td>
                      <td className="py-3 px-4 text-white">
                        Faria Mahamud Prity
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center text-gray-500 text-sm">
              <p>&copy; 2026 CityWatch Bangladesh. All rights reserved.</p>
              <p className="mt-1">
                Developed with care by Group 04 | CSE471 Lab Section 10
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}