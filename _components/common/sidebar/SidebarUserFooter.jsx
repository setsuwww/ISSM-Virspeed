"use client"

import clsx from "clsx"
import { profilesRoleStyles } from "@/_constants/roleConstants"
import { ChevronDown, CircleUserRound } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SidebarUserFooter({ user, minimized }) {

  const router = useRouter()
  const formattedRole = user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1).toLowerCase()

  return (
    <div className={clsx("p-4 border-t border-slate-200",
      minimized && "flex justify-center"
    )} onClick={() => router.push(`/${user?.role?.toLowerCase()}/dashboard/profiles`)}
    >
      <div className={clsx("group flex items-center bg-white hover:bg-slate-50 border border-slate-300/80 p-2 rounded-lg shadow-sm transition cursor-pointer",
        minimized ? "h-12 w-12 justify-between"
          : "space-x-3 w-full"
      )}
      >
        <div className={`${profilesRoleStyles[formattedRole]} p-2 text-white rounded-lg flex items-center justify-center`}>
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

        <ChevronDown className="w-4 h-4 text-slate-600 group-hover:scale-155 transition-transform" />
      </div>
    </div>
  )
}
