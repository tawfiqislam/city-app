import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = jwt.verify(token, JWT_SECRET) as { role: string }

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get counts
    const total = await prisma.report.count()
    const pending = await prisma.report.count({ where: { status: "pending" } })
    const inProgress = await prisma.report.count({ where: { status: "in-progress" } })
    const resolved = await prisma.report.count({ where: { status: "resolved" } })

    // Get by category
    const byCategory = await prisma.report.groupBy({
      by: ["category"],
      _count: true,
    })

    // Get average rating
    const avgRating = await prisma.report.aggregate({
      _avg: { rating: true },
      where: { rating: { not: null } },
    })

    return NextResponse.json({
      total,
      pending,
      inProgress,
      resolved,
      byCategory,
      byStatus: { pending, inProgress, resolved },
      avgRating: avgRating._avg.rating || 0,
    })
  } catch (error) {
    console.error("Statistics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}