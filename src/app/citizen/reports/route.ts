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

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }

    const reports = await prisma.report.findMany({
      where: { userId: payload.userId },
      include: {
        department: { select: { name: true } },
        assignments: {
          include: {
            officer: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Fetch citizen reports error:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
}