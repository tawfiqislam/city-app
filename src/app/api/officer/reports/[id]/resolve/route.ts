import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (!["officer", "admin"].includes(payload.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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

    if (status === "resolved" && !resolvedImageUrl) {
      return NextResponse.json(
        { error: "Proof photo URL is required for resolution" },
        { status: 400 }
      )
    }

    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: { id: params.id },
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

    // Prepare update data
    const updateData: any = { status }
    if (status === "resolved") {
      updateData.resolvedImageUrl = resolvedImageUrl
      updateData.resolvedAt = new Date()
    }

    // Update the report
    const report = await prisma.report.update({
      where: { id: params.id },
      data: updateData,
    })

    // Update assignment if it exists
    if (payload.userId) {
      await prisma.assignment.updateMany({
        where: {
          reportId: params.id,
          officerId: payload.userId,
        },
        data: {
          completedAt: status === "resolved" ? new Date() : null,
          notes: completionNotes || "Resolved by officer",
        },
      })
    }

    console.log(`Report ${params.id} marked as ${status} by officer ${payload.userId}`)

    return NextResponse.json({
      success: true,
      message: "Report status updated successfully",
      report,
    })
  } catch (error: any) {
    console.error("Resolution error:", error)
    return NextResponse.json(
      { error: "Failed to update report: " + (error.message || "Unknown error") },
      { status: 500 }
    )
  }
}