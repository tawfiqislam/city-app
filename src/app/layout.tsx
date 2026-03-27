import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "CityWatch - Unified Citizen Reporting System",
  description: "Report and track city issues in real-time",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}