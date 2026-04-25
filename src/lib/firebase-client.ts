import { initializeApp, getApps } from "firebase/app"
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let firebaseApp: any = null

function getFirebaseApp() {
  if (firebaseApp) return firebaseApp
  try {
    firebaseApp =
      getApps().length === 0
        ? initializeApp(firebaseConfig)
        : getApps()[0]
    return firebaseApp
  } catch (e) {
    console.error("Firebase init error:", e)
    return null
  }
}

export { getFirebaseApp as app }

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    if (typeof window === "undefined") return null

    const supported = await isSupported()
    if (!supported) {
      console.log("FCM not supported in this browser")
      return null
    }

    if (!("Notification" in window)) {
      console.log("Browser does not support notifications")
      return null
    }

    if (!("serviceWorker" in navigator)) {
      console.log("Browser does not support service workers")
      return null
    }

    // Register service worker
    let registration: ServiceWorkerRegistration
    try {
      registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      )
      console.log("SW registered:", registration.scope)
    } catch (swErr) {
      console.error("SW registration failed:", swErr)
      return null
    }

    // Request permission
    let permission = Notification.permission
    if (permission === "default") {
      permission = await Notification.requestPermission()
    }

    console.log("Notification permission:", permission)

    if (permission !== "granted") {
      console.log("Permission denied by user")
      return null
    }

    const app = getFirebaseApp()
    if (!app) {
      console.error("Firebase app not initialized")
      return null
    }

    const messaging = getMessaging(app)

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    if (!vapidKey) {
      console.error("NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing in .env")
      return null
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    })

    if (token) {
      console.log("FCM Token obtained:", token.substring(0, 25) + "...")
      return token
    }

    console.warn("No FCM token received")
    return null
  } catch (error) {
    console.error("Error getting FCM token:", error)
    return null
  }
}

// Main export used in citizen dashboard
export async function listenForForegroundMessages(
  callback: (payload: any) => void
): Promise<void> {
  try {
    if (typeof window === "undefined") return

    const supported = await isSupported()
    if (!supported) {
      console.log("FCM not supported, skipping listener")
      return
    }

    const app = getFirebaseApp()
    if (!app) {
      console.error("Firebase app not initialized")
      return
    }

    const messaging = getMessaging(app)

    onMessage(messaging, (payload) => {
      console.log("Foreground push notification:", payload)
      callback(payload)
    })

    console.log("Foreground message listener registered")
  } catch (error) {
    console.error("Error setting up foreground listener:", error)
  }
}

// Backward compatibility alias
export const onForegroundMessage = listenForForegroundMessages