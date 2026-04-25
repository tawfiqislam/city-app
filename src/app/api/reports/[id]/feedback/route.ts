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

    // Only citizens can submit ratings
    if (payload.role !== "citizen") {
      return NextResponse.json(
        { error: "Only citizens can submit ratings" },
        { status: 403 }
      )
    }

    const { rating, feedback } = await request.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Check report exists and is resolved
    const report = await prisma.report.findUnique({
      where: { id: params.id },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    if (report.status !== "resolved") {
      return NextResponse.json(
        { error: "Only resolved reports can be rated" },
        { status: 400 }
      )
    }

    // Update rating and feedback
    const updated = await prisma.report.update({
      where: { id: params.id },
      data: {
        rating: Number(rating),
        feedback: feedback || null,
      },
    })

    return NextResponse.json({ success: true, report: updated })
  } catch (error: any) {
    console.error("Feedback error:", error)
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    )
  }
}