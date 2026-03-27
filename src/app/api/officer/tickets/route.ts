import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (payload.role !== "officer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const officer = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { department: true },
    })

    if (!officer) {
      return NextResponse.json({ error: "Officer not found" }, { status: 404 })
    }

    // Officers ONLY see tickets assigned to their department
    const whereClause: any = {
      status: { in: ["pending", "in-progress"] },
    }

    if (officer.departmentId) {
      whereClause.departmentId = officer.departmentId
    } else {
      // Officer without department sees nothing
      return NextResponse.json({
        tickets: [],
        department: null,
        message: "You are not assigned to any department",
      })
    }

    const tickets = await prisma.report.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
        assignments: {
          include: {
            officer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [
        { isEmergency: "desc" },
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    })

    console.log(
      `Officer ${officer.name} (${officer.department?.name}) sees ${tickets.length} tickets`
    )

    return NextResponse.json({
      tickets,
      department: officer.department,
    })
  } catch (error) {
    console.error("Fetch tickets error:", error)
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    )
  }
}