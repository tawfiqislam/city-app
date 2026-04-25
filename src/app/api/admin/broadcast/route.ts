import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"
import * as admin from "firebase-admin"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Initialize Firebase Admin safely
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
    if (
      privateKey &&
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: privateKey.replace(/\\n/g, "\n"),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      })
      console.log("Firebase Admin initialized successfully")
    } else {
      console.warn(
        "Firebase Admin not initialized: missing env vars. Push notifications disabled."
      )
    }
  } catch (error: any) {
    console.error("Firebase Admin init error:", error.message)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get token from header
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header missing" },
        { status: 401 }
      )
    }

    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Invalid authorization format" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]

    if (!token || token.trim() === "") {
      return NextResponse.json(
        { error: "Token is empty" },
        { status: 401 }
      )
    }

    // Verify token
    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (jwtError: any) {
      console.error("JWT verify error:", jwtError.message)
      return NextResponse.json(
        { error: "Token expired or invalid. Please login again." },
        { status: 401 }
      )
    }

    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    // Parse body
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { title, message, severity, targetCity, targetAll } = body

    if (!title || !message || !severity) {
      return NextResponse.json(
        { error: "Title, message, and severity are required" },
        { status: 400 }
      )
    }

    // Find target citizens
    const whereClause: any = { role: "citizen" }
    if (!targetAll && targetCity) {
      whereClause.city = targetCity
    }

    const totalCitizens = await prisma.user.count({ where: whereClause })

    // Get citizens with FCM tokens
    const usersWithTokens = await prisma.user.findMany({
      where: {
        ...whereClause,
        fcmToken: { not: null },
      },
      select: { fcmToken: true },
    })

    const fcmTokens = usersWithTokens
      .map((u) => u.fcmToken)
      .filter((t): t is string => !!t && t.trim() !== "")

    console.log(
      `Broadcast: ${totalCitizens} total citizens, ${fcmTokens.length} with push tokens`
    )

    let successCount = 0
    let failureCount = 0

    if (fcmTokens.length > 0 && admin.apps.length > 0) {
      try {
        for (let i = 0; i < fcmTokens.length; i += 500) {
          const chunk = fcmTokens.slice(i, i + 500)

          const response = await admin.messaging().sendEachForMulticast({
            tokens: chunk,
            notification: {
              title,
              body: message,
            },
            webpush: {
              notification: {
                icon: "/favicon.ico",
              },
              fcmOptions: {
                link:
                  process.env.NEXT_PUBLIC_APP_URL ||
                  "http://localhost:3000",
              },
            },
          })

          successCount += response.successCount
          failureCount += response.failureCount

          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              console.warn(
                `Token ${chunk[idx]?.substring(0, 20)}... failed:`,
                resp.error?.message
              )
            }
          })
        }

        console.log(
          `FCM broadcast: ${successCount} sent, ${failureCount} failed`
        )
      } catch (fcmError: any) {
        console.error("FCM send error:", fcmError)
        failureCount = fcmTokens.length
      }
    } else if (fcmTokens.length === 0) {
      console.warn(
        "No FCM tokens found. Citizens need to allow notifications first."
      )
    } else if (!admin.apps.length) {
      console.warn(
        "Firebase Admin not initialized. Push notifications skipped."
      )
    }

    // Save broadcast to DB
    const broadcast = await prisma.emergencyBroadcast.create({
      data: {
        title,
        message,
        severity,
        targetCity: targetAll ? null : targetCity,
        targetAll,
        sentBy: payload.userId,
        recipients: totalCitizens,
      },
    })

    return NextResponse.json({
      success: true,
      broadcast,
      totalCitizens,
      tokensFound: fcmTokens.length,
      notificationsSent: successCount,
      notificationsFailed: failureCount,
      message:
        fcmTokens.length === 0
          ? "Broadcast recorded. No push tokens — citizens must allow notifications first."
          : `Sent to ${successCount} of ${fcmTokens.length} devices.`,
    })
  } catch (error: any) {
    console.error("Broadcast route error:", error)
    return NextResponse.json(
      {
        error: "Internal server error: " + (error.message || "Unknown error"),
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const broadcasts = await prisma.emergencyBroadcast.findMany({
      orderBy: { sentAt: "desc" },
      take: 50,
    })
    return NextResponse.json({ broadcasts })
  } catch (error: any) {
    console.error("Fetch broadcasts error:", error)
    return NextResponse.json(
      { error: "Failed to fetch broadcasts" },
      { status: 500 }
    )
  }
}