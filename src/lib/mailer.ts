import nodemailer from "nodemailer"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// ================================================
// CREATE TRANSPORTER
// ================================================
function getTransporter() {
  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailPass) {
    throw new Error(
      "GMAIL_USER or GMAIL_APP_PASSWORD is missing in your .env file"
    )
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  })
}

const FROM_EMAIL =
  process.env.EMAIL_FROM ||
  `CityWatch Bangladesh <${process.env.GMAIL_USER}>`

// ================================================
// VERIFY CONNECTION
// ================================================
export async function verifyEmailConnection(): Promise<{
  ok: boolean
  message: string
}> {
  try {
    const transporter = getTransporter()
    await transporter.verify()
    console.log("Gmail SMTP connection verified successfully")
    return {
      ok: true,
      message: "Gmail SMTP connected successfully",
    }
  } catch (error: any) {
    console.error("Gmail SMTP connection failed:", error.message)
    return {
      ok: false,
      message: `Gmail SMTP failed: ${error.message}`,
    }
  }
}

// ================================================
// REGISTRATION WELCOME EMAIL
// Sent when citizen creates an account
// ================================================
export async function sendRegistrationWelcomeEmail(params: {
  email: string
  name?: string | null
}): Promise<{ success: boolean; error?: string }> {
  const { email, name } = params

  if (!email) {
    return { success: false, error: "No email address provided" }
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to CityWatch</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#059669,#0d9488);border-radius:16px 16px 0 0;padding:36px;text-align:center;">
              <div style="font-size:52px;line-height:1;margin-bottom:14px;">&#127963;</div>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:bold;">
                Welcome to CityWatch!
              </h1>
              <p style="margin:10px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">
                Bangladesh's First Digital Civic Platform
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#ffffff;padding:36px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">

              <h2 style="margin:0 0 12px;color:#111827;font-size:20px;">
                Hello, ${name || "Citizen"}! &#128075;
              </h2>

              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.7;">
                Your account has been successfully created on
                <strong style="color:#059669;">CityWatch Bangladesh</strong>.
                You can now report city issues and track their progress in real-time.
              </p>

              <!-- FEATURES BOX -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:22px;">
                    <p style="margin:0 0 16px;color:#15803d;font-size:15px;font-weight:bold;">
                      What you can do with CityWatch:
                    </p>
                    ${[
                      ["&#128221;", "Submit reports for water, road, and electricity issues"],
                      ["&#128205;", "Track the real-time status of your reports"],
                      ["&#127970;", "Get connected to the right city department"],
                      ["&#11088;", "Rate and review resolved issues"],
                      ["&#128680;", "Receive emergency alerts from the city administration"],
                    ].map(([icon, text]) => `
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                      <tr>
                        <td width="30" style="font-size:18px;vertical-align:middle;">${icon}</td>
                        <td style="color:#374151;font-size:14px;padding-left:10px;vertical-align:middle;line-height:1.5;">
                          ${text}
                        </td>
                      </tr>
                    </table>
                    `).join("")}
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTONS -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}/citizen/dashboard"
                       style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:bold;font-size:15px;margin:6px;">
                      &#127968; Go to Dashboard
                    </a>
                    <a href="${APP_URL}/citizen/report"
                       style="display:inline-block;background:#ffffff;color:#059669;text-decoration:none;padding:14px 30px;border-radius:10px;font-weight:bold;font-size:15px;border:2px solid #059669;margin:6px;">
                      &#128221; Submit First Report
                    </a>
                  </td>
                </tr>
              </table>

              <p style="text-align:center;margin-top:24px;color:#9ca3af;font-size:13px;line-height:1.5;">
                Thank you for joining us in making Bangladesh a better place. &#128591;
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:22px;text-align:center;">
              <p style="margin:0 0 4px;color:#6b7280;font-size:13px;font-weight:bold;">
                CityWatch Bangladesh
              </p>
              <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">
                Unified Citizen Complaint &amp; Service Management System
              </p>
              <p style="margin:0;color:#9ca3af;font-size:11px;">
                This email was sent to ${email} because you created an account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const transporter = getTransporter()
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to CityWatch Bangladesh!",
      html,
    })
    console.log(
      `Registration welcome email sent to: ${email} | ID: ${info.messageId}`
    )
    return { success: true }
  } catch (error: any) {
    console.error(
      `Registration email failed for ${email}:`,
      error.message
    )
    return { success: false, error: error.message }
  }
}

// ================================================
// REPORT SUBMITTED EMAIL
// Sent when citizen submits a report
// ================================================
export async function sendWelcomeReportEmail(params: {
  email: string
  name?: string | null
  reportTitle: string
  reportCategory: string
  location: string
  city?: string | null
  reportId: string
  priority: string
  isEmergency: boolean
}): Promise<{ success: boolean; error?: string }> {
  const {
    email,
    name,
    reportTitle,
    reportCategory,
    location,
    city,
    reportId,
    priority,
    isEmergency,
  } = params

  if (!email) {
    return { success: false, error: "No email address provided" }
  }

  const priorityColors: Record<string, string> = {
    low: "#6b7280",
    medium: "#3b82f6",
    high: "#f97316",
    urgent: "#ef4444",
  }

  const priorityColor = priorityColors[priority] || "#3b82f6"
  const cardBg = isEmergency ? "#fef2f2" : "#f0fdf4"
  const cardBorder = isEmergency ? "#ef4444" : "#22c55e"

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Report Received - CityWatch</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#059669,#0d9488);border-radius:16px 16px 0 0;padding:36px;text-align:center;">
              <div style="font-size:52px;line-height:1;margin-bottom:14px;">&#127963;</div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">
                CityWatch Bangladesh
              </h1>
              <p style="margin:10px 0 0;color:rgba(255,255,255,0.8);font-size:15px;font-weight:500;">
                ${isEmergency
                  ? "&#128680; Emergency Report Received"
                  : "&#9989; Report Successfully Submitted"}
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#ffffff;padding:36px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">

              <h2 style="margin:0 0 12px;color:#111827;font-size:20px;">
                Hello, ${name || "Citizen"}! &#128075;
              </h2>

              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.7;">
                Your report has been successfully submitted to
                <strong style="color:#059669;">CityWatch Bangladesh</strong>.
                Our team will review it and assign it to the appropriate department.
              </p>

              ${isEmergency ? `
              <!-- EMERGENCY BANNER -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#fef2f2;border:1px solid #ef4444;border-left:4px solid #ef4444;border-radius:10px;margin-bottom:20px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0 0 5px;color:#b91c1c;font-weight:bold;font-size:14px;">
                      &#128680; Emergency Alert Flagged
                    </p>
                    <p style="margin:0;color:#dc2626;font-size:13px;line-height:1.5;">
                      Your report has been marked as urgent and will be prioritized
                      for immediate attention from city officers.
                    </p>
                  </td>
                </tr>
              </table>
              ` : ""}

              <!-- REPORT DETAILS CARD -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:${cardBg};border:1px solid ${cardBorder};border-left:4px solid ${cardBorder};border-radius:12px;margin-bottom:26px;">
                <tr>
                  <td style="padding:22px;">
                    <p style="margin:0 0 18px;color:#111827;font-size:15px;font-weight:bold;">
                      &#128203; Report Details
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${[
                        ["Title", reportTitle],
                        ["Category", reportCategory],
                        ["Location", location],
                        ["City", city || "Dhaka"],
                      ].map(([label, value]) => `
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:13px;width:35%;vertical-align:top;border-bottom:1px solid rgba(0,0,0,0.06);">
                          ${label}
                        </td>
                        <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:600;vertical-align:top;border-bottom:1px solid rgba(0,0,0,0.06);">
                          ${value}
                        </td>
                      </tr>
                      `).join("")}
                      <tr>
                        <td style="padding:10px 0 6px;color:#6b7280;font-size:13px;vertical-align:middle;">
                          Priority
                        </td>
                        <td style="padding:10px 0 6px;vertical-align:middle;">
                          <span style="background:${priorityColor};color:#ffffff;padding:3px 14px;border-radius:999px;font-size:12px;font-weight:bold;text-transform:uppercase;">
                            ${priority}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:13px;vertical-align:top;">
                          Report ID
                        </td>
                        <td style="padding:8px 0;color:#9ca3af;font-family:monospace;font-size:11px;vertical-align:top;">
                          ${reportId}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- WHAT HAPPENS NEXT -->
              <p style="margin:0 0 16px;color:#111827;font-size:15px;font-weight:bold;">
                What Happens Next?
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${[
                  ["&#9989;", "Your issue has been recorded in our system"],
                  ["&#127970;", "It will be routed to the correct city department"],
                  ["&#128110;", "Officers will investigate and resolve the issue"],
                  ["&#128202;", "Track progress anytime from your dashboard"],
                  ["&#11088;", "Rate the service quality once the issue is resolved"],
                ].map(([icon, text]) => `
                <tr>
                  <td width="32" style="padding:10px 0;font-size:18px;vertical-align:middle;border-bottom:1px solid #f3f4f6;">
                    ${icon}
                  </td>
                  <td style="padding:10px 0 10px 10px;color:#374151;font-size:14px;vertical-align:middle;border-bottom:1px solid #f3f4f6;line-height:1.5;">
                    ${text}
                  </td>
                </tr>
                `).join("")}
              </table>

              <!-- CTA BUTTON -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:30px;">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}/citizen/my-reports"
                       style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-weight:bold;font-size:15px;">
                      &#128203; Track My Report
                    </a>
                  </td>
                </tr>
              </table>

              <p style="text-align:center;margin-top:22px;color:#9ca3af;font-size:13px;line-height:1.5;">
                Thank you for helping us improve our city. &#128591;
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:22px;text-align:center;">
              <p style="margin:0 0 4px;color:#6b7280;font-size:13px;font-weight:bold;">
                CityWatch Bangladesh
              </p>
              <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;">
                Unified Citizen Complaint &amp; Service Management System
              </p>
              <p style="margin:0;color:#9ca3af;font-size:11px;">
                Sent to ${email} because you submitted a report.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    const transporter = getTransporter()
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: isEmergency
        ? "Emergency Report Received - CityWatch Bangladesh"
        : "Your Report Has Been Received - CityWatch Bangladesh",
      html,
    })
    console.log(
      `Report email sent to: ${email} | ID: ${info.messageId}`
    )
    return { success: true }
  } catch (error: any) {
    console.error(
      `Report email failed for ${email}:`,
      error.message
    )
    return { success: false, error: error.message }
  }
}

// ================================================
// TEST EMAIL
// ================================================
export async function sendTestEmail(
  toEmail: string
): Promise<{ success: boolean; error?: string }> {
  if (!toEmail) {
    return { success: false, error: "No email address provided" }
  }

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:40px;background:#f0fdf4;font-family:Arial,sans-serif;">
  <div style="max-width:500px;margin:auto;background:white;border:2px solid #22c55e;border-radius:16px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#059669,#0d9488);padding:28px;text-align:center;">
      <div style="font-size:52px;line-height:1;margin-bottom:10px;">&#9989;</div>
      <h2 style="margin:0;color:white;font-size:20px;">Gmail SMTP Working!</h2>
    </div>
    <div style="padding:28px;">
      <p style="color:#374151;font-size:15px;margin:0 0 20px;text-align:center;line-height:1.6;">
        Your Gmail SMTP is configured correctly.<br/>
        CityWatch can now send emails to any citizen.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0"
        style="background:#f9fafb;border-radius:10px;border:1px solid #e5e7eb;border-collapse:collapse;">
        <tr>
          <td style="padding:12px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;width:40%;">
            Sent To
          </td>
          <td style="padding:12px 16px;color:#111827;font-size:13px;font-weight:bold;border-bottom:1px solid #e5e7eb;">
            ${toEmail}
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:#6b7280;font-size:13px;border-bottom:1px solid #e5e7eb;">
            Sent At
          </td>
          <td style="padding:12px 16px;color:#111827;font-size:13px;font-weight:bold;border-bottom:1px solid #e5e7eb;">
            ${new Date().toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </td>
        </tr>
        <tr>
          <td style="padding:12px 16px;color:#6b7280;font-size:13px;">
            SMTP Provider
          </td>
          <td style="padding:12px 16px;color:#059669;font-size:13px;font-weight:bold;">
            Gmail SMTP &#9989;
          </td>
        </tr>
      </table>
      <p style="text-align:center;margin-top:20px;color:#9ca3af;font-size:12px;">
        Citizens will now receive emails at their own registered address.
      </p>
    </div>
  </div>
</body>
</html>
  `

  try {
    const transporter = getTransporter()
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: toEmail,
      subject: "CityWatch Email Test - Gmail SMTP Working!",
      html,
    })
    console.log(
      `Test email sent to ${toEmail} | ID: ${info.messageId}`
    )
    return { success: true }
  } catch (error: any) {
    console.error("Test email failed:", error.message)
    return { success: false, error: error.message }
  }
}