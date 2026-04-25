import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const activities = await prisma.report.findMany({
      where: { status: "resolved" },
      select: {
        id: true,
        title: true,
        category: true,
        location: true,
        city: true,
        status: true,
        priority: true,
        isEmergency: true,
        createdAt: true,
        resolvedAt: true,
        rating: true,
        feedback: true,
        department: { select: { name: true } },
        user: { select: { name: true } },
      },
      orderBy: { resolvedAt: "desc" },
      take: 100,
    })

    return NextResponse.json({ activities })
  } catch (error) {
    console.error("Public activity error:", error)
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    )
  }
}