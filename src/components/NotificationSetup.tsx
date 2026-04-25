"use client"

import { useEffect, useState } from "react"

export default function NotificationSetup() {
  const [notification, setNotification] = useState<any>(null)
  const [showNotification, setShowNotification] = useState(false)
  const [setupDone, setSetupDone] = useState(false)

  useEffect(() => {
    const setup = async () => {
      try {
        if (setupDone) return
        if (typeof window === "undefined") return
        if (!("Notification" in window)) return

        const token = localStorage.getItem("token")
        const userData = localStorage.getItem("user")
        if (!token || !userData) return

        // Dynamically import firebase to avoid SSR issues
        const { requestNotificationPermission, onForegroundMessage } =
          await import("@/lib/firebase-client")

        // Request permission
        const fcmToken = await requestNotificationPermission()

        if (fcmToken) {
          // Save token to database
          const res = await fetch("/api/user/fcm-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ fcmToken }),
          })

          if (res.ok) {
            console.log("Push notifications enabled successfully")
          } else {
            console.error("Failed to save FCM token")
          }
        }

        // Listen for foreground messages
        onForegroundMessage((payload: any) => {
          console.log("Push notification received:", payload)
          setNotification({
            title: payload.notification?.title || "CityWatch Alert",
            body: payload.notification?.body || "New notification",
          })
          setShowNotification(true)
          setTimeout(() => setShowNotification(false), 10000)
        })

        setSetupDone(true)
      } catch (error) {
        console.error("Notification setup error:", error)
      }
    }

    // Delay setup to let the page load first
    const timer = setTimeout(setup, 2000)
    return () => clearTimeout(timer)
  }, [setupDone])

  if (!showNotification || !notification) return null

  return (
    <div className="fixed top-4 right-4 z-[9999]" style={{ animation: "slideIn 0.3s ease-out" }}>
      <div className="bg-white rounded-2xl shadow-2xl border border-red-200 p-5 max-w-sm min-w-[300px]">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
            🚨
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-red-700">{notification.title}</h4>
            <p className="text-gray-600 text-sm mt-1">{notification.body}</p>
            <p className="text-gray-400 text-xs mt-2">CityWatch Bangladesh</p>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold flex-shrink-0"
          >
            x
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}