import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log("Fetching departments...")
    
    const departments = await prisma.department.findMany({
      include: {
        officers: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            reports: true,
            officers: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    console.log(`Found ${departments.length} departments`)

    return NextResponse.json({ departments })
  } catch (error) {
    console.error("Fetch departments error:", error)
    return NextResponse.json(
      { error: "Failed to fetch departments", details: String(error) },
      { status: 500 }
    )
  }
}