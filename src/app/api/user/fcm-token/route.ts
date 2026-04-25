import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    var authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    var token = authHeader.split(" ")[1]

    var payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    var body = await request.json()
    var fcmToken = body.fcmToken

    if (!fcmToken || typeof fcmToken !== "string") {
      return NextResponse.json(
        { error: "Valid FCM token is required" },
        { status: 400 }
      )
    }

    // Clear this token from any other user first
    try {
      await prisma.user.updateMany({
        where: {
          fcmToken: fcmToken,
          id: { not: payload.userId },
        },
        data: { fcmToken: null },
      })
    } catch (e) {
      // ignore if fails
    }

    // Save token to current user
    await prisma.user.update({
      where: { id: payload.userId },
      data: { fcmToken: fcmToken },
    })

    console.log(
      "FCM token saved for user " + payload.userId +
      ": " + fcmToken.substring(0, 30) + "..."
    )

    return NextResponse.json({
      success: true,
      message: "FCM token saved successfully",
    })
  } catch (error: any) {
    console.error("FCM token save error:", error)
    return NextResponse.json(
      { error: "Failed to save FCM token: " + (error.message || "") },
      { status: 500 }
    )
  }
}