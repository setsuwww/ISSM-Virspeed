"use client"

import React, { useEffect, useTransition } from "react"
import { LogOut, Inbox, Clock } from "lucide-react"
import Link from "next/link"
import useSWR from "swr"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/_components/ui/Tooltip"
import { LogoutAuthAction } from "../../../../_servers/auth_action"
import { TimeClock } from "../../employee/dashboard/TimeClock"
import Pusher from "pusher-js"

const fetcher = (url) => fetch(url).then((res) => res.json())

export const DashboardHeader = React.memo(function DashboardHeader({ title, subtitle, useColor = false }) {
  const [isPending, startTransition] = useTransition()

  const { data } = useSWR(
    "/api/system-config/admin-notification",
    fetcher
  )

  useEffect(() => {
    const pusher = new Pusher(
      process.env.NEXT_PUBLIC_PUSHER_KEY,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      }
    )

    const channel = pusher.subscribe("admin-channel")

    channel.bind("notification-update", () => {
      mutate("/api/system-config/admin-notification")
    })

    return () => {
      pusher.unsubscribe("admin-channel")
      pusher.disconnect()
    }
  }, [])

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
          {title}
        </h1>
        <p className={`${useColor ? "text-sky-500" : "text-slate-500"} text-sm `}>{subtitle}</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center gap-x-2">
          <div className="px-3 py-1.5 bg-slate-200 flex items-center gap-x-2 rounded-full">
            <Clock className="w-4 h-4" strokeWidth={2} />
            <TimeClock />
          </div>

          <Tooltip>
            <Link href="/admin/dashboard/requests" className={`hover:text-sky-600 relative px-2 ${rightActionClass} hover:bg-white hover:border-slate-300/90`}>
              <TooltipTrigger><Inbox size={20} strokeWidth={2} /></TooltipTrigger>
              <TooltipContent>
                <p>Request Inbox</p>
              </TooltipContent>
              {hasNotifications && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600"></span>
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
