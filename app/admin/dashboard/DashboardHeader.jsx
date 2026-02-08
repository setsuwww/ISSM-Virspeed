"use client"

import React, { useTransition } from "react"
import { LogOut, Inbox, Home } from "lucide-react"
import Link from "next/link"
import useSWR from "swr"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/_components/ui/Tooltip"
import { LogoutAuthAction } from "../../auth/login/action"

const fetcher = (url) => fetch(url).then((res) => res.json())

export const DashboardHeader = React.memo(function DashboardHeader({ title, subtitle, useColor = false }) {
  const [isPending, startTransition] = useTransition()

  const { data } = useSWR("/api/system-config/admin-notification",
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
      revalidateIfStale: true,
      dedupingInterval: 30000,
    }
  );

  const hasNotifications = data?.hasNotifications || false

  const handleLogout = () => {
    startTransition(async () => {
      LogoutAuthAction()
    })
  }

  const rightActionClass = "flex items-center text-sm font-semibold rounded-lg bg-white/50 border border-slate-300/70 text-slate-600 transition-colors py-1.5"

  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 py-1">
      <div>
        <h1 className="text-xl font-bold text-slate-700">
          {title || formatLabel(visibleSegments[visibleSegments.length - 1] || "Home")}
        </h1>
        <p className={`${useColor ? "text-sky-500" : "text-slate-500"} text-sm `}>{subtitle}</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center gap-x-2">
          <Tooltip>
            <Link href="/admin/dashboard/request" className={`hover:text-sky-600 relative px-2 ${rightActionClass} hover:bg-white hover:border-slate-300/90`}>
              <TooltipTrigger><Inbox size={20} strokeWidth={2} /></TooltipTrigger>
              <TooltipContent>
                <p>Request Inbox</p>
              </TooltipContent>
              {hasNotifications && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
                  <span className="animate-pulse relative inline-flex rounded-full h-2 w-2 bg-sky-600"></span>
                </span>
              )}
            </Link>
          </Tooltip>

          <button onClick={handleLogout} disabled={isPending}
            className={`hover:text-rose-500 px-4 gap-x-1 ${rightActionClass} hover:bg-white hover:border-slate-300/90 disabled:opacity-50`}
          >
            <LogOut strokeWidth={2.5} size={15} />
            {isPending ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  )
})
