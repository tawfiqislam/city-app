import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
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

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, phone, password, departmentId, city } = body

    if (!name || !email || !password || !departmentId) {
      return NextResponse.json(
        { error: "Name, email, password and department are required" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    // Check department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    })
    if (!department) {
      return NextResponse.json(
        { error: "Selected department not found" },
        { status: 404 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const officer = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        city: city || "Dhaka",
        role: "officer",
        departmentId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        role: true,
        department: {
          select: { id: true, name: true, icon: true },
        },
        createdAt: true,
      },
    })

    console.log(
      `New officer created: ${officer.name} (${officer.email}) → ${department.name}`
    )

    return NextResponse.json({
      success: true,
      message: `Officer ${officer.name} added to ${department.name} successfully`,
      officer,
    })
  } catch (error: any) {
    console.error("Add officer error:", error)
    return NextResponse.json(
      { error: "Failed to add officer: " + (error.message || "Unknown error") },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const officers = await prisma.user.findMany({
      where: { role: "officer" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        role: true,
        createdAt: true,
        department: {
          select: { id: true, name: true, icon: true, color: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ success: true, officers })
  } catch (error: any) {
    console.error("Fetch officers error:", error)
    return NextResponse.json(
      { error: "Failed to fetch officers" },
      { status: 500 }
    )
  }
}