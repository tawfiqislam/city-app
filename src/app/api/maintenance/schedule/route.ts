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

    if (!["admin", "officer"].includes(payload.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      scheduledDate,
      endDate,
      departmentId,
      assignedTo,
      location,
      city,
      priority,
      notes,
    } = body

    const schedule = await prisma.maintenanceSchedule.create({
      data: {
        title,
        description,
        scheduledDate: new Date(scheduledDate),
        endDate: endDate ? new Date(endDate) : null,
        departmentId,
        assignedTo,
        location,
        city: city || "Dhaka",
        priority: priority || "medium",
        notes,
      },
      include: {
        department: true,
        officer: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json({
      success: true,
      schedule,
    })
  } catch (error) {
    console.error("Schedule creation error:", error)
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }

    const whereClause: any = {}

    // Officers see only their schedules
    if (payload.role === "officer") {
      whereClause.assignedTo = payload.userId
    }

    const schedules = await prisma.maintenanceSchedule.findMany({
      where: whereClause,
      include: {
        department: true,
        officer: { select: { name: true, email: true } },
      },
      orderBy: { scheduledDate: "asc" },
    })

    return NextResponse.json({ schedules })
  } catch (error) {
    console.error("Fetch schedules error:", error)
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    )
  }
}