import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (payload.role !== "officer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const reportId = body.reportId

    console.log("Claiming ticket:", reportId, "by officer:", payload.userId)

    if (!reportId) {
      return NextResponse.json({ error: "Report ID required" }, { status: 400 })
    }

    // Check if report exists
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Check if already claimed by someone
    const existingAssignment = await prisma.assignment.findFirst({
      where: { reportId },
    })

    if (existingAssignment) {
      // Update existing assignment instead
      await prisma.assignment.update({
        where: { id: existingAssignment.id },
        data: {
          officerId: payload.userId,
          claimedAt: new Date(),
        },
      })
    } else {
      // Create new assignment
      await prisma.assignment.create({
        data: {
          reportId,
          officerId: payload.userId,
          claimedAt: new Date(),
          notes: "Ticket claimed by officer",
        },
      })
    }

    // Update report status to in-progress
    await prisma.report.update({
      where: { id: reportId },
      data: { status: "in-progress" },
    })

    console.log("Ticket claimed successfully:", reportId)

    return NextResponse.json({
      success: true,
      message: "Ticket claimed successfully",
    })
  } catch (error) {
    console.error("Claim ticket error:", error)
    return NextResponse.json(
      { error: "Failed to claim ticket" },
      { status: 500 }
    )
  }
}