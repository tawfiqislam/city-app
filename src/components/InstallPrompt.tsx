"use client"

import { useEffect, useState } from "react"

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Check iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as any).MSStream
    setIsIOS(isIOSDevice)

    if (isIOSDevice) {
      const dismissed = localStorage.getItem("pwa-ios-dismissed")
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000)
      }
      return
    }

    // Android / Chrome
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      const dismissed = localStorage.getItem("pwa-dismissed")
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000)
      }
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === "accepted") {
        setShowPrompt(false)
        setDeferredPrompt(null)
      }
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem(
      isIOS ? "pwa-ios-dismissed" : "pwa-dismissed",
      "true"
    )
  }

  if (!showPrompt || isInstalled) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Top bar */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
              🏛️
            </div>
            <div>
              <p className="text-white font-bold text-sm">
                Install CityWatch
              </p>
              <p className="text-emerald-100 text-xs">
                Add to your home screen
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isIOS ? (
            <div className="space-y-3">
              <p className="text-gray-700 text-sm font-medium">
                Install CityWatch on your iPhone:
              </p>
              <div className="space-y-2">
                {[
                  ["1️⃣", "Tap the", "Share button", "at the bottom of Safari"],
                  ["2️⃣", "Scroll down and tap", "Add to Home Screen", ""],
                  ["3️⃣", "Tap", "Add", "to confirm"],
                ].map(([step, before, highlight, after], i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl p-3"
                  >
                    <span className="text-xl flex-shrink-0">{step}</span>
                    <p className="text-sm text-gray-600">
                      {before}{" "}
                      <strong className="text-emerald-600">{highlight}</strong>{" "}
                      {after}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium"
                >
                  Maybe Later
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium"
                >
                  Got it!
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  ["📱", "Works offline"],
                  ["🚀", "Fast & native"],
                  ["🔔", "Push alerts"],
                ].map(([icon, label]) => (
                  <div
                    key={label}
                    className="text-center p-2 bg-emerald-50 rounded-xl"
                  >
                    <div className="text-2xl mb-1">{icon}</div>
                    <p className="text-xs text-emerald-700 font-medium">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium"
                >
                  Not Now
                </button>
                <button
                  onClick={handleInstall}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-bold shadow-lg"
                >
                  Install App
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}