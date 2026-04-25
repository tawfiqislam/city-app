import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

function calculateAutoRating(
  createdAt: Date,
  resolvedAt: Date
): { rating: number; feedback: string } {
  const diffMs = resolvedAt.getTime() - createdAt.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const diffDays = diffHours / 24

  if (diffHours <= 24) {
    return {
      rating: 5,
      feedback:
        "Issue resolved within 24 hours. Outstanding response time! The city team acted immediately.",
    }
  } else if (diffDays <= 3) {
    return {
      rating: 4,
      feedback:
        "Issue resolved within 3 days. Very good response time from the city team.",
    }
  } else if (diffDays <= 7) {
    return {
      rating: 3,
      feedback:
        "Issue resolved within a week. Acceptable response time from city services.",
    }
  } else if (diffDays <= 14) {
    return {
      rating: 2,
      feedback:
        "Issue took about 2 weeks to resolve. Response time could be improved.",
    }
  } else {
    return {
      rating: 1,
      feedback:
        "Issue took more than 2 weeks to resolve. Significant improvement needed.",
    }
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]

    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    if (!["officer", "admin"].includes(payload.role)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { status, resolvedImageUrl, completionNotes } = body

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      )
    }

    const existingReport = await prisma.report.findUnique({
      where: { id },
    })

    if (!existingReport) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    if (existingReport.status === "resolved") {
      return NextResponse.json(
        { error: "Report is already resolved" },
        { status: 400 }
      )
    }

    const resolvedAt = new Date()
    const autoRating = calculateAutoRating(
      existingReport.createdAt,
      resolvedAt
    )

    console.log(
      `Auto rating for report ${id}: ${autoRating.rating} stars (resolved in ${Math.round(
        (resolvedAt.getTime() - existingReport.createdAt.getTime()) /
          (1000 * 60 * 60)
      )} hours)`
    )

    const report = await prisma.report.update({
      where: { id },
      data: {
        status: "resolved",
        resolvedImageUrl: resolvedImageUrl || null,
        resolvedAt,
        rating: autoRating.rating,
        feedback: autoRating.feedback,
      },
    })

    if (payload.userId) {
      await prisma.assignment.updateMany({
        where: {
          reportId: id,
          officerId: payload.userId,
        },
        data: {
          completedAt: resolvedAt,
          notes: completionNotes || "Resolved by officer",
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Report resolved successfully",
      report,
      autoRating,
    })
  } catch (error: any) {
    console.error("Resolution error:", error)
    return NextResponse.json(
      {
        error:
          "Failed to update report: " +
          (error.message || "Unknown error"),
      },
      { status: 500 }
    )
  }
}