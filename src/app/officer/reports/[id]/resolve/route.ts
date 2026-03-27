import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }

    if (payload.role !== "officer" && payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { status, resolvedImageUrl, completionNotes } = await request.json()

    // Validate: resolved requires proof photo
    if (status === "resolved" && !resolvedImageUrl) {
      return NextResponse.json(
        { error: "Proof photo required for resolution" },
        { status: 400 }
      )
    }

    // Update report
    const updateData: any = { status }

    if (status === "resolved") {
      updateData.resolvedImageUrl = resolvedImageUrl
      updateData.resolvedAt = new Date()
    }

    const report = await prisma.report.update({
      where: { id: params.id },
      data: updateData,
    })

    // Update assignment if exists
    await prisma.assignment.updateMany({
      where: {
        reportId: params.id,
        officerId: payload.userId,
      },
      data: {
        completedAt: status === "resolved" ? new Date() : null,
        notes: completionNotes,
      },
    })

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    console.error("Resolution error:", error)
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    )
  }
}