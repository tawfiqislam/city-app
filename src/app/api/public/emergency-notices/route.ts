import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const notices = await prisma.emergencyBroadcast.findMany({
      orderBy: { sentAt: "desc" },
      take: 100,
      select: {
        id: true,
        title: true,
        message: true,
        severity: true,
        targetCity: true,
        targetAll: true,
        sentAt: true,
        recipients: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        notices,
        count: notices.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    )
  } catch (error: any) {
    console.error("Fetch emergency notices error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch emergency notices",
        details: error.message,
      },
      { status: 500 }
    )
  }
}