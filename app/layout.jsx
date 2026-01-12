import { ToastProvider } from "@/_context/Toast-Provider"
import "../_styles/admin.css"

import { OfflineGuard } from "./offline"

export const metadata = {
  title: "Beefast",
  description: "ISSM B-Fast Application",
  icons: {
    icon: "/icons/liveon.png"
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0070f3" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="relative">
        <ToastProvider>
          <OfflineGuard>{children}</OfflineGuard>
        </ToastProvider>
      </body>
    </html>
  )
}
