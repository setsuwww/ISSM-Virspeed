"use client"

import clsx from "clsx"
import { profilesRoleStyles } from "@/_components/_constants/theme/userTheme"
import { CircleUserRound } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SidebarUserFooter({ user, minimized }) {
  const router = useRouter()

  const formattedRole =
    user?.role?.charAt(0).toUpperCase() +
    user?.role?.slice(1).toLowerCase()

  return (
    <div
      className={clsx(
        "p-4 border-t border-slate-200 transition-all duration-300",
        minimized && "flex justify-center"
      )}
      onClick={() =>
        router.push(`/${user?.role?.toLowerCase()}/dashboard/profiles`)
      }
    >
      <div
        className={clsx(
          "group flex items-center bg-white border border-slate-300 hover:bg-slate-50 rounded-full shadow-sm cursor-pointer overflow-hidden",
          "transition-all duration-300 ease-in-out",
          minimized
            ? "h-12 w-12 justify-center"
            : "p-2 space-x-3 w-full"
        )}
      >
        <div
          className={clsx(
            profilesRoleStyles[formattedRole],
            "text-white rounded-full flex items-center justify-center transition-all duration-300",
            minimized ? "w-8 h-8" : "p-2"
          )}
        >
          <CircleUserRound
            className="transition-all duration-300"
            strokeWidth={minimized ? 1 : 1.5}
          />
        </div>

        <div
          className={clsx(
            "flex flex-col text-sm leading-tight transition-all duration-300",
            minimized
              ? "opacity-0 translate-x-2 w-0"
              : "opacity-100 translate-x-0 w-auto"
          )}
        >
          <span className="font-semibold whitespace-nowrap">
            {user?.name || "Guest"}
          </span>
          <span className="text-xs text-slate-500 truncate">
            {user?.email || ""}
          </span>
        </div>
      </div>
    </div>
  )
}
