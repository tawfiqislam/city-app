import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { reportId, officerId } = await request.json()

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        reportId,
        officerId,
      },
    })

    // Update report status
    await prisma.report.update({
      where: { id: reportId },
      data: { status: "in-progress" },
    })

    return NextResponse.json({
      success: true,
      assignment,
    })
  } catch (error) {
    console.error("Assignment error:", error)
    return NextResponse.json(
      { error: "Failed to assign officer" },
      { status: 500 }
    )
  }
}