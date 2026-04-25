"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function MobileBottomNav() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) setUser(JSON.parse(userData))
  }, [])

  // Only show when logged in as citizen
  if (!user || user.role !== "citizen") return null

  // Hide on desktop
  const navItems = [
    { href: "/citizen/dashboard", icon: "🏠", label: "Home" },
    { href: "/citizen/report", icon: "📝", label: "Report" },
    { href: "/citizen/my-reports", icon: "📋", label: "My Reports" },
    { href: "/weather", icon: "🌦️", label: "Weather" },
    { href: "/public/resolved", icon: "✅", label: "Resolved" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition min-w-[56px] ${
                isActive
                  ? "text-emerald-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span
                className={`text-2xl transition-transform ${
                  isActive ? "scale-110" : ""
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-emerald-600 rounded-full"></div>
              )}
            </Link>
          )
        })}
      </div>
      {/* Safe area for iPhone notch */}
      <div className="h-safe-area-inset-bottom bg-white"></div>
    </nav>
  )
}