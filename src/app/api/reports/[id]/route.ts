import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true } },
        department: { select: { name: true } },
        assignments: {
          include: {
            officer: { select: { name: true, email: true } },
          },
        },
      },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error("Fetch report error:", error)
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    )
  }
}