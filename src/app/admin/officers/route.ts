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

    const payload = jwt.verify(token, JWT_SECRET) as { role: string }

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const officers = await prisma.user.findMany({
      where: { role: "officer" },
      select: {
        id: true,
        name: true,
        email: true,
        department: { select: { name: true } },
      },
    })

    return NextResponse.json({ officers })
  } catch (error) {
    console.error("Fetch officers error:", error)
    return NextResponse.json(
      { error: "Failed to fetch officers" },
      { status: 500 }
    )
  }
}