import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]

    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      )
    }

    if (payload.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    let body: any
    try {
      body = await request.json()
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    const { reportId, departmentId, officerId } = body

    if (!reportId || !departmentId) {
      return NextResponse.json(
        { error: "Report ID and Department ID are required" },
        { status: 400 }
      )
    }

    // Verify report exists
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    })

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    })

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      )
    }

    // If officer selected, verify officer exists
    if (officerId) {
      const officer = await prisma.user.findUnique({
        where: { id: officerId },
      })

      if (!officer) {
        return NextResponse.json(
          { error: "Officer not found" },
          { status: 404 }
        )
      }
    }

    // Update report department and status
    await prisma.report.update({
      where: { id: reportId },
      data: {
        departmentId: departmentId,
        status: officerId ? "in-progress" : "pending",
      },
    })

    // If officer is selected, handle assignment
    if (officerId) {
      // Remove old assignments for this report
      await prisma.assignment.deleteMany({
        where: { reportId },
      })

      // Create new assignment
      await prisma.assignment.create({
        data: {
          reportId,
          officerId,
          claimedAt: new Date(),
          notes: "Assigned by admin from department page",
        },
      })
    }

    console.log(
      `Report ${reportId} assigned to dept ${departmentId}${
        officerId ? ` and officer ${officerId}` : ""
      }`
    )

    return NextResponse.json({
      success: true,
      message: "Report assigned successfully",
    })
  } catch (error: any) {
    console.error("Assign report error:", error)
    return NextResponse.json(
      { error: "Failed to assign report: " + (error.message || "Unknown error") },
      { status: 500 }
    )
  }
}