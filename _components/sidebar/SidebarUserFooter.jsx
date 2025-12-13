"use client"

import clsx from "clsx"
import { roleStyles } from "@/_constants/roleConstants"
import { CircleUserRound } from "lucide-react"

export default function SidebarUserFooter({ user, minimized }) {

  const formattedRole = user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1).toLowerCase()
  
  return (
    <div className={clsx("p-4 border-t border-slate-200",
      minimized && "flex justify-center"
    )}
    >
      <div className={clsx("flex items-center bg-white border border-slate-300 p-2 rounded-xl shadow-sm transition",
          minimized ? "h-12 w-12 justify-center"
            : "space-x-3 w-full"
        )}
      >
        <div className={`${roleStyles[formattedRole]} p-2 rounded-lg flex items-center justify-center`}>
          <CircleUserRound size={22} strokeWidth={1.5} />
        </div>

        {!minimized && (
          <div className="flex flex-col text-sm leading-tight">
            <span className="font-semibold">
              {user?.name || "Guest"}
            </span>
            <span className="text-xs text-slate-500 truncate">
              {user?.email || ""}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
