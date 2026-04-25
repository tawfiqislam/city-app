import { NextResponse } from "next/server"
import { sendTestEmail, verifyEmailConnection } from "@/lib/mailer"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const to = searchParams.get("to")

    if (!to) {
      const result = await verifyEmailConnection()
      return NextResponse.json({
        connected: result.ok,
        message: result.message,
        hint: "Add ?to=any@gmail.com to send a test email",
        config: {
          user: process.env.GMAIL_USER || "NOT SET",
          from: process.env.EMAIL_FROM || "NOT SET",
          passwordSet: !!process.env.GMAIL_APP_PASSWORD,
        },
      })
    }

    const result = await sendTestEmail(to)

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Test email sent successfully to ${to}`
        : `Failed: ${result.error}`,
      sentTo: result.success ? to : null,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}