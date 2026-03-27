import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

const emergencyKeywords = [
  "urgent", "emergency", "danger", "dangerous",
  "fire", "flood", "accident", "injured", "critical", "immediate"
]

function checkEmergencyKeywords(text: string): boolean {
  const lowerText = text.toLowerCase()
  return emergencyKeywords.some((keyword) => lowerText.includes(keyword))
}

async function getDepartmentByCategory(category: string) {
  const mapping: Record<string, string> = {
    Water: "Water Supply & Sewerage (WASA)",
    Waste: "Waste Management",
    Roads: "Roads & Highways Department",
    Electricity: "Power Development Board (BPDB)",
    Health: "Public Health Department",
  }

  const deptName = mapping[category]
  if (!deptName) return null

  return await prisma.department.findUnique({
    where: { name: deptName },
  })
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }

    const body = await request.json()
    const { title, description, category, location, city, imageUrl, priority, isEmergency } = body

    if (!title || !description || !category || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const hasEmergencyKeywords = checkEmergencyKeywords(title + " " + description)
    const finalIsEmergency = isEmergency || hasEmergencyKeywords
    const finalPriority = hasEmergencyKeywords ? "urgent" : (priority || "medium")

    const department = await getDepartmentByCategory(category)

    const report = await prisma.report.create({
      data: {
        title,
        description,
        category,
        location,
        city: city || "Dhaka",
        imageUrl,
        priority: finalPriority,
        isEmergency: finalIsEmergency,
        userId: payload.userId,
        departmentId: department?.id,
      },
      include: {
        user: { select: { name: true, email: true } },
        department: { select: { name: true } },
      },
    })

    return NextResponse.json({
      success: true,
      report,
      emergencyFlagged: hasEmergencyKeywords,
    })
  } catch (error) {
    console.error("Create report error:", error)
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const city = searchParams.get("city")

    const where: any = {}
    if (category) where.category = category
    if (status) where.status = status
    if (city) where.city = city

    const reports = await prisma.report.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        department: { select: { name: true } },
      },
      orderBy: [{ isEmergency: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Fetch reports error:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
}