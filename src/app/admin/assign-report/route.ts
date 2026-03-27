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

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { reportId, departmentId, officerId } = await request.json()

    if (!reportId || !departmentId) {
      return NextResponse.json(
        { error: "Report ID and Department ID are required" },
        { status: 400 }
      )
    }

    // Update report department
    await prisma.report.update({
      where: { id: reportId },
      data: {
        departmentId: departmentId,
        status: officerId ? "in-progress" : "pending",
      },
    })

    // If officer is selected, create assignment
    if (officerId) {
      // Delete old assignments for this report
      await prisma.assignment.deleteMany({
        where: { reportId },
      })

      // Create new assignment
      await prisma.assignment.create({
        data: {
          reportId,
          officerId,
          notes: "Assigned by admin",
        },
      })
    }

    console.log(`Report ${reportId} assigned to department ${departmentId}${officerId ? ` and officer ${officerId}` : ""}`)

    return NextResponse.json({
      success: true,
      message: "Report assigned successfully",
    })
  } catch (error) {
    console.error("Assign report error:", error)
    return NextResponse.json(
      { error: "Failed to assign report" },
      { status: 500 }
    )
  }
}