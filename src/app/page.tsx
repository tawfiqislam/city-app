import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "CityWatch Bangladesh - Unified Citizen Reporting System",
  description:
    "Report city issues like water, roads, electricity and waste problems. Track progress and rate city services across all 64 districts of Bangladesh.",
  keywords:
    "CityWatch Bangladesh, citizen reporting, city complaints, government services, Dhaka, Bangladesh",
  openGraph: {
    title: "CityWatch Bangladesh - Unified Citizen Reporting System",
    description:
      "Report and track city issues in real-time across Bangladesh",
    type: "website",
    locale: "en_BD",
  },
}

export default function HomePage() {
  const stats = [
    { label: "Total Reports", value: "12,345", icon: "📝" },
    { label: "Resolved", value: "9,856", icon: "✅" },
    { label: "In Progress", value: "1,890", icon: "🔄" },
    { label: "Avg Rating", value: "4.5", icon: "⭐" },
  ]

  const divisions = [
    "Dhaka", "Chattogram", "Rajshahi", "Khulna",
    "Barishal", "Sylhet", "Rangpur", "Mymensingh",
  ]

  const categories = [
    { name: "Water Supply", icon: "💧", color: "bg-blue-500", count: "3,245" },
    { name: "Waste Management", icon: "🗑️", color: "bg-green-500", count: "2,156" },
    { name: "Roads & Highways", icon: "🛣️", color: "bg-yellow-500", count: "4,567" },
    { name: "Electricity", icon: "⚡", color: "bg-orange-500", count: "1,890" },
    { name: "Public Health", icon: "🏥", color: "bg-red-500", count: "987" },
  ]

  const howItWorks = [
    { step: "1", title: "Create Account", desc: "Register easily with mobile or email", icon: "👤" },
    { step: "2", title: "Submit Report", desc: "Describe your issue with photos and details", icon: "📝" },
    { step: "3", title: "Track Progress", desc: "Get real-time status updates", icon: "📊" },
    { step: "4", title: "Give Feedback", desc: "Rate the service after resolution", icon: "⭐" },
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
      {/* HEADER */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 md:w-11 md:h-11 bg-white rounded-full flex items-center justify-center text-lg md:text-2xl">
                🏛️
              </div>
              <div>
                <h1 className="text-base md:text-xl font-bold leading-tight">
                  CityWatch Bangladesh
                </h1>
                <p className="text-xs text-emerald-100 hidden sm:block">
                  Citizen Complaint &amp; Service Management
                </p>
              </div>
            </div>

            <nav className="flex items-center gap-1.5 md:gap-2" aria-label="Main navigation">
              <Link
                href="/weather"
                className="hidden md:flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition"
              >
                <span aria-hidden="true">🌦️</span>
                <span>Weather</span>
              </Link>
              <Link
                href="/public/activity"
                className="hidden md:flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition"
              >
                <span aria-hidden="true">📢</span>
                <span>Activity</span>
              </Link>
              <Link
                href="/public/resolved"
                className="hidden md:flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition"
              >
                <span aria-hidden="true">✅</span>
                <span>Resolved</span>
              </Link>
              <Link
                href="/login"
                className="px-3 py-1.5 md:px-5 md:py-2 bg-white text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 transition text-sm shadow-md"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 md:px-5 md:py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-400 transition border border-emerald-400 text-sm"
              >
                Register
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block mb-5 px-4 py-2 bg-emerald-100 rounded-full">
            <span className="text-emerald-700 font-medium text-sm">
              Bangladesh&apos;s First Digital Civic Platform
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-5">
            Your City,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              Your Responsibility
            </span>
          </h2>

          <p className="text-base md:text-xl text-gray-600 mb-7 max-w-3xl mx-auto leading-relaxed">
            From potholes to water issues — report any civic problem and track
            the progress of its resolution. Together, let&apos;s build a Smart
            Bangladesh.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link
              href="/register"
              className="px-7 py-3.5 md:px-8 md:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-base md:text-lg rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition shadow-lg shadow-emerald-500/30"
            >
              Submit a Complaint
            </Link>
            <Link
              href="/login"
              className="px-7 py-3.5 md:px-8 md:py-4 bg-white text-emerald-600 text-base md:text-lg rounded-xl font-medium border-2 border-emerald-200 hover:bg-emerald-50 transition"
            >
              Track Your Report
            </Link>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link
              href="/weather"
              className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-blue-50 hover:border-blue-300 transition shadow-sm"
              aria-label="Check Bangladesh Weather for all 64 districts"
            >
              <span className="text-xl" aria-hidden="true">🌦️</span>
              <div className="text-left">
                <p className="font-semibold text-sm">Bangladesh Weather</p>
                <p className="text-xs text-gray-500">All 64 districts live</p>
              </div>
            </Link>

            <Link
              href="/public/activity"
              className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-emerald-300 transition shadow-sm"
              aria-label="View Public Activity Feed"
            >
              <span className="text-xl" aria-hidden="true">📢</span>
              <div className="text-left">
                <p className="font-semibold text-sm">Public Activity Feed</p>
                <p className="text-xs text-gray-500">See resolved issues</p>
              </div>
            </Link>

            <Link
              href="/public/resolved"
              className="inline-flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-emerald-300 transition shadow-sm"
              aria-label="View Resolved Issues and rate city services"
            >
              <span className="text-xl" aria-hidden="true">⭐</span>
              <div className="text-left">
                <p className="font-semibold text-sm">Resolved Issues</p>
                <p className="text-xs text-gray-500">Rate city services</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-10 bg-white/80 backdrop-blur-sm border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-5 md:p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm"
              >
                <div className="text-3xl mb-1" aria-hidden="true">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PUBLIC SERVICES */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Public Services
            </h3>
            <p className="text-gray-600 max-w-xl mx-auto text-sm md:text-base">
              Access these pages without logging in. Full transparency in city
              governance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {[
              {
                href: "/weather",
                icon: "🌦️",
                bg: "bg-blue-100",
                title: "Bangladesh Weather",
                desc: "Live weather for all 64 districts with storm alerts.",
                chips: ["64 Districts", "Live Data", "Alerts"],
                chipColors: [
                  "bg-blue-100 text-blue-700",
                  "bg-sky-100 text-sky-700",
                  "bg-indigo-100 text-indigo-700",
                ],
                cta: "Check Weather →",
                ctaColor: "text-blue-600",
              },
              {
                href: "/public/activity",
                icon: "📢",
                bg: "bg-emerald-100",
                title: "Public Activity History",
                desc: "A live timeline of all resolved city issues.",
                chips: ["Timeline", "Departments", "Resolution Time"],
                chipColors: [
                  "bg-emerald-100 text-emerald-700",
                  "bg-teal-100 text-teal-700",
                  "bg-green-100 text-green-700",
                ],
                cta: "View Activity →",
                ctaColor: "text-emerald-600",
              },
              {
                href: "/public/resolved",
                icon: "⭐",
                bg: "bg-yellow-100",
                title: "Resolved Issues",
                desc: "See all resolved issues with citizen star ratings.",
                chips: ["Ratings", "Comments", "Filters"],
                chipColors: [
                  "bg-yellow-100 text-yellow-700",
                  "bg-orange-100 text-orange-700",
                  "bg-red-100 text-red-700",
                ],
                cta: "View Resolved →",
                ctaColor: "text-emerald-600",
              },
            ].map((item, i) => (
              <Link key={i} href={item.href}>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full">
                  <div
                    className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center text-2xl mb-3`}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </div>
                  <h4 className="text-base md:text-lg font-bold text-gray-900 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">{item.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {item.chips.map((chip, ci) => (
                      <span
                        key={ci}
                        className={`px-2 py-0.5 text-xs rounded-full ${item.chipColors[ci]}`}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                  <span className={`${item.ctaColor} font-medium text-sm`}>
                    {item.cta}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Report Categories
            </h3>
            <p className="text-gray-600 text-sm md:text-base">
              Submit complaints under various city departments
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {categories.map((cat, index) => (
              <div
                key={index}
                className="group p-4 md:p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center"
              >
                <div
                  className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center text-2xl mb-3 mx-auto group-hover:scale-110 transition-transform`}
                  aria-hidden="true"
                >
                  {cat.icon}
                </div>
                <h4 className="font-bold text-gray-900 mb-1 text-sm md:text-base">
                  {cat.name}
                </h4>
                <p className="text-xs md:text-sm text-gray-500">
                  {cat.count} reports
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIVISIONS */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">
              Serving Across Bangladesh
            </h3>
            <p className="text-emerald-100 text-sm md:text-base">
              Our services are available in all 8 divisions
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {divisions.map((division, index) => (
              <div
                key={index}
                className="px-4 py-2 md:px-6 md:py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition cursor-pointer flex items-center gap-1.5 text-sm md:text-base"
              >
                <span aria-hidden="true">📍</span>
                <span>{division}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              How It Works
            </h3>
            <p className="text-gray-600 text-sm md:text-base">
              Simple steps to report and track city issues
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-2xl md:text-3xl mx-auto mb-3 md:mb-4 shadow-lg shadow-emerald-500/30"
                  aria-hidden="true"
                >
                  {item.icon}
                </div>
                <h4 className="text-sm md:text-lg font-bold text-gray-900 mb-1 md:mb-2">
                  {item.title}
                </h4>
                <p className="text-gray-600 text-xs md:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAJOR CITIES */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Major Cities We Cover
            </h3>
            <p className="text-gray-600 text-sm md:text-base">
              Serving citizens across Bangladesh
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {majorCities.map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 md:p-6 rounded-xl shadow-sm hover:shadow-md transition text-center"
              >
                <div className="text-3xl md:text-4xl mb-2" aria-hidden="true">
                  {item.icon}
                </div>
                <h4 className="font-bold text-gray-900 text-sm md:text-base">
                  {item.city}
                </h4>
                <p className="text-xs md:text-sm text-gray-500">
                  Pop: {item.pop}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            Get Started Today
          </h3>
          <p className="text-gray-400 mb-6 md:mb-8 text-sm md:text-base">
            Join thousands of citizens making their city better
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link
              href="/register"
              className="px-7 py-3.5 md:px-8 md:py-4 bg-emerald-500 text-white text-base md:text-lg rounded-xl font-medium hover:bg-emerald-400 transition"
            >
              Register for Free
            </Link>
            <Link
              href="/login"
              className="px-7 py-3.5 md:px-8 md:py-4 bg-gray-800 text-white text-base md:text-lg rounded-xl font-medium border border-gray-700 hover:bg-gray-700 transition"
            >
              Sign In
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center flex-wrap">
            <Link
              href="/weather"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700 transition text-sm"
            >
              <span aria-hidden="true">🌦️</span>
              <span>Bangladesh Weather</span>
            </Link>
            <Link
              href="/public/activity"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700 transition text-sm"
            >
              <span aria-hidden="true">📢</span>
              <span>Public Activity Feed</span>
            </Link>
            <Link
              href="/public/resolved"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700 transition text-sm"
            >
              <span aria-hidden="true">✅</span>
              <span>Resolved Issues</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-10 md:py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl" aria-hidden="true">🏛️</span>
                <span className="font-bold text-lg">CityWatch Bangladesh</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                A Unified Citizen Reporting and Smart Management System for
                efficient city governance and citizen engagement.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                {[
                  ["/login", "Login"],
                  ["/register", "Register"],
                  ["/weather", "Bangladesh Weather"],
                  ["/public/activity", "Public Activity Feed"],
                  ["/public/resolved", "Resolved Issues"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="hover:text-white transition">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white">Public Pages</h4>
              <ul className="space-y-3 text-sm">
                {[
                  ["/weather", "🌦️", "Bangladesh Weather", "All 64 districts live"],
                  ["/public/activity", "📢", "Activity Feed", "Timeline of resolved issues"],
                  ["/public/resolved", "⭐", "Resolved Issues", "Rate city services"],
                ].map(([href, icon, title, sub]) => (
                  <li key={href as string}>
                    <Link
                      href={href as string}
                      className="text-gray-400 hover:text-white transition flex items-center gap-2"
                    >
                      <span className="text-lg" aria-hidden="true">{icon}</span>
                      <div>
                        <p className="font-medium text-gray-300">{title}</p>
                        <p className="text-xs text-gray-500">{sub}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="bg-gray-800 rounded-xl p-5 md:p-6 mb-6">
              <div className="text-center mb-4">
                <h4 className="font-bold text-base md:text-lg text-emerald-400">
                  CSE471 - System Analysis and Design
                </h4>
                <p className="text-gray-400 text-sm">
                  Lab Section: 10 | Spring 2026 | Group No: 04
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full max-w-2xl mx-auto text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-2 px-3 text-left text-gray-400 font-medium">
                        Student ID
                      </th>
                      <th className="py-2 px-3 text-left text-gray-400 font-medium">
                        Name
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["22299503", "Moumita Das Pritha"],
                      ["22299482", "Humayra Mahmud Neha"],
                      ["23101183", "Md. Tawfiq Islam"],
                      ["22299486", "Faria Mahamud Prity"],
                    ].map(([id, name]) => (
                      <tr
                        key={id}
                        className="border-b border-gray-700/50 last:border-0"
                      >
                        <td className="py-2.5 px-3 text-emerald-400 font-mono text-xs md:text-sm">
                          {id}
                        </td>
                        <td className="py-2.5 px-3 text-white text-xs md:text-sm">
                          {name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center text-gray-500 text-xs md:text-sm">
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