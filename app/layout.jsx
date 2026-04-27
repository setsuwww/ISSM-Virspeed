import { ToastProvider } from "@/_clients/_contexts/Toast-Provider"
import "../_styles/admin.css"

export const metadata = {
  title: "ISSM-Virspeed",
  description: "ISSM Virspeed Application",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/lintasarta.png"
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e0e6ed" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="relative">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
