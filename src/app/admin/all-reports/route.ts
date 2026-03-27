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

    const payload = jwt.verify(token, JWT_SECRET) as { role: string }

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const reports = await prisma.report.findMany({
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
        department: {
          select: { id: true, name: true },
        },
        assignments: {
          include: {
            officer: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: [
        { isEmergency: "desc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Fetch all reports error:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
}