"use client"

import { Clock, CalendarDays, Box } from "lucide-react"

export default function UpcomingStates() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="p-10 bg-white rounded-3xl shadow-lg border border-slate-200 flex flex-col items-center space-y-4">
        <CalendarDays className="w-16 h-16 text-blue-500" />
        <h2 className="text-2xl font-semibold text-slate-800">
          Upcoming Content
        </h2>
        <p className="text-slate-500 max-w-xs">
          This page is coming soon. Content will be added here in the near future.
        </p>
        <div className="flex items-center space-x-4 mt-4 text-slate-400">
          <Clock className="w-5 h-5 animate-pulse" />
          <Box className="w-5 h-5 animate-pulse" />
          <span>Stay tuned!</span>
        </div>
      </div>
    </div>
  )
}
