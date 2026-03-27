import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, name, reportTitle } = await request.json()

    const { data, error } = await resend.emails.send({
      from: "CityWatch <noreply@citywatch.gov.bd>",
      to: email,
      subject: "Welcome to CityWatch - Your Report Has Been Received",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(to right, #059669, #0d9488); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏛️ CityWatch Bangladesh</h1>
              <p>Thank you for being a responsible citizen!</p>
            </div>
            <div class="content">
              <h2>Hello ${name || "Citizen"}! 👋</h2>
              <p>Your report has been successfully submitted:</p>
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                <strong>${reportTitle}</strong>
              </div>
              <p>Here's what happens next:</p>
              <ul>
                <li>✅ Your report has been received and logged</li>
                <li>📋 It will be assigned to the relevant department</li>
                <li>🔔 You'll receive updates on the progress</li>
                <li>⭐ Once resolved, you can rate the service</li>
              </ul>
              <p>Thank you for helping us make our city better!</p>
              <p>
                <a href="https://citywatch.gov.bd/citizen/my-reports" class="button">
                  Track Your Report
                </a>
              </p>
            </div>
            <div class="footer">
              <p>🇧🇩 CityWatch Bangladesh - Government of Bangladesh</p>
              <p>Hotline: 333 | Email: info@citywatch.gov.bd</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Email error:", error)
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
}