import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendRegistrationWelcomeEmail } from "@/lib/mailer"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, phone, city, address } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        city: city || null,
        address: address || null,
        role: "citizen",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    // Send welcome email to the new citizen's actual email
    const emailResult = await sendRegistrationWelcomeEmail({
      email: user.email,
      name: user.name,
    })

    if (emailResult.success) {
      console.log(`Welcome email sent to new citizen: ${user.email}`)
    } else {
      console.warn(
        `Welcome email failed for ${user.email}:`,
        emailResult.error
      )
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      user,
      emailSent: emailResult.success,
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    )
  }
}