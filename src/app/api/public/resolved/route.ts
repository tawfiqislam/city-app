import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      where: { status: "resolved" },
      select: {
        id: true,
        title: true,
        category: true,
        location: true,
        city: true,
        resolvedAt: true,
        rating: true,
        feedback: true,
        department: { select: { name: true } },
      },
      orderBy: { resolvedAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Fetch resolved reports error:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
}