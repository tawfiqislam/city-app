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
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    const { rating, feedback } = await request.json()

    const report = await prisma.report.findUnique({
      where: { id: params.id },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    if (report.userId !== payload.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (report.status !== "resolved") {
      return NextResponse.json(
        { error: "Can only rate resolved reports" },
        { status: 400 }
      )
    }

    const updatedReport = await prisma.report.update({
      where: { id: params.id },
      data: { rating, feedback },
    })

    return NextResponse.json({ success: true, report: updatedReport })
  } catch (error) {
    console.error("Feedback error:", error)
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    )
  }
}