import type { Metadata, Viewport } from "next"
import "./globals.css"
import InstallPrompt from "@/components/InstallPrompt"
import MobileBottomNav from "@/components/MobileBottomNav"

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "CityWatch Bangladesh - Unified Citizen Reporting System",
  description:
    "Report city issues like water, roads, electricity and waste problems. Track progress and rate city services across all 64 districts of Bangladesh.",
  keywords:
    "CityWatch, Bangladesh, citizen reporting, city issues, complaints, government services, Dhaka",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CityWatch",
  },
  openGraph: {
    title: "CityWatch Bangladesh - Unified Citizen Reporting System",
    description:
      "Report and track city issues in real-time across Bangladesh",
    type: "website",
    locale: "en_BD",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <meta name="apple-mobile-web-app-title" content="CityWatch" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#059669" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) {
                      console.log('CityWatch SW registered:', reg.scope);
                    })
                    .catch(function(err) {
                      console.log('CityWatch SW failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <InstallPrompt />
        <MobileBottomNav />
      </body>
    </html>
  )
}