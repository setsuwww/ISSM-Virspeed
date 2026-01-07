"use client"

import { useEffect, useState } from "react"

export function OfflineGuard({ children }) {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    update()

    window.addEventListener("online", update)
    window.addEventListener("offline", update)

    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  if (!online) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            You are offline
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Please check your internet connection or start the local server.
          </p>
        </div>
      </div>
    )
  }

  return children
}
