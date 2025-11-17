"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ChevronDown, Grip, Menu, X, Users, Clock, LayoutDashboard, User, CircleUserRound, Building2 } from "lucide-react"
import { roleStyles } from "@/_constants/roleConstants"
import clsx from "clsx"

const subLinkBase = "block my-0.5 text-sm px-3 py-1.5 transition-colors font-medium rounded-md"

function SidebarLink({ href, icon: Icon, children, minimized }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={clsx(
        "text-sm flex items-center rounded-lg transition-all duration-200",
        minimized ? "justify-center h-12 w-12 mx-auto" : "gap-3 px-3 py-2 w-full",
        isActive
          ? "bg-slate-50 ring ring-slate-200 text-slate-800 font-medium border-b-2 border-0 border-slate-200"
          : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
      )}
    >
      <Icon className="text-sky-500 shrink-0" size={18} />
      {!minimized && <span className="truncate">{children}</span>}
    </Link>
  )
}

function SidebarSubLink({ href, children, minimized }) {
  const pathname = usePathname()
  const isActive = pathname === href
  if (minimized) return null

  return (
    <Link href={href} className={clsx(subLinkBase,
      isActive
        ? "text-sky-600 font-semibold bg-sky-500/10"
        : "text-slate-400 hover:text-slate-600 transition-colors"
    )}
    >
      {children}
    </Link>
  )
}

function SidebarCollapsible({ title, items, icon: Icon, minimized }) {
  const router = useRouter()
  const pathname = usePathname()
  const isParentActive = items.some((item) => pathname === item.href)
  const [open, setOpen] = useState(isParentActive)
  const contentRef = useRef(null)
  const [height, setHeight] = useState(0)
  const defaultHref = items[0]?.href

  useEffect(() => setOpen(isParentActive), [pathname])
  useEffect(() => {
    if (contentRef.current)
      setHeight(open ? contentRef.current.scrollHeight : 0)
  }, [open])

  const handleClick = () => {
    if (minimized && defaultHref) router.push(defaultHref)
    else setOpen(!open)
  }

  return (
    <div className="flex flex-col px-2">
      <button onClick={handleClick}
        className={clsx("group w-full flex items-center transition-all duration-200 rounded-lg",
          minimized ? "justify-center h-12 w-12 mx-auto" : "justify-between py-2 px-2.5",
          isParentActive ? "bg-slate-50 ring ring-slate-200 text-slate-800 font-medium border-b-2 border-0 border-slate-200" : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
        )}
      >
        <div className="flex items-center gap-x-3">
          <Icon size={18} className="text-sky-500" />
          {!minimized && <span className="text-sm">{title}</span>}
        </div>
        {!minimized && (
          <ChevronDown size={18}
            className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""
              }`}
          />
        )}
      </button>

      {!minimized && (
        <div className="overflow-hidden transition-all duration-300" style={{ height: `${height}px` }}>
          <div ref={contentRef}
            className="ml-4.5 flex flex-col space-y-1.5 border-l-2 border-dashed border-slate-300"
          >
            <div className="p-2">
              {items.map((item) => (
                <SidebarSubLink key={item.href} href={item.href} minimized={minimized}>
                  {item.label}
                </SidebarSubLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function Sidebar({ user }) {
  const [minimized, setMinimized] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const formattedRole =
    user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1).toLowerCase()

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 w-full bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4 py-3">
        <div className="text-xl font-bold text-sky-800">
          Live<span className="text-sky-600">system.</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-700 hover:text-slate-900">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/30 z-40 md:hidden"></div>
      )}

      {/* Sidebar */}
      <aside className={clsx("fixed md:static top-0 left-0 h-screen bg-white border-r border-slate-200 flex flex-col z-50 transition-all duration-300 ease-in-out",
        minimized ? "w-[80px]" : "w-64",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
      >
        {/* Header */}
        <div className={clsx("flex items-center justify-between border-b border-slate-200 px-5 py-4",
          minimized && "justify-center px-0"
        )}
        >
          {!minimized && (
            <div className="text-2xl font-bold text-sky-800">
              Live<span className="text-sky-600">system.</span>
            </div>
          )}
          <button onClick={() => setMinimized(!minimized)}
            className="text-slate-400 hover:text-slate-500 transition-all bg-slate-50 border border-slate-200 rounded-md p-2"
          >
            {minimized
              ? (<Grip size={20} className="rotate-90 transition-transform" />)
              : (<ChevronDown size={20} className="-rotate-90 transition-transform" />)
            }
          </button>
        </div>

        {/* Nav */}
        <nav className={clsx("flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400",
          minimized ? "px-2 py-4 space-y-2" : "px-4 py-5 space-y-3"
        )}
        >
          <SidebarLink href="/admin/dashboard" icon={LayoutDashboard} minimized={minimized}>
            Dashboard
          </SidebarLink>

          <SidebarCollapsible title="Users" icon={Users}
            items={[
              { label: "Users", href: "/admin/dashboard/users" },
              { label: "Add Users", href: "/admin/dashboard/users/create" },
            ]}
            minimized={minimized}
          />

          <SidebarCollapsible title="Division" icon={Building2}
            items={[
              { label: "Divisions", href: "/admin/dashboard/users/divisions" },
              { label: "Add Divisions", href: "/admin/dashboard/users/divisions/create" },
              { label: "Employees", href: "/admin/dashboard/users/employees" },
              { label: "Attendances", href: "/admin/dashboard/users/attendances" },
              { label: "Work Hours", href: "/admin/dashboard/users/work-hours" },
            ]}
            minimized={minimized}
          />

          <SidebarCollapsible title="Shift" icon={Clock}
            items={[
              { label: "Shifts", href: "/admin/dashboard/shifts" },
              { label: "Add Shifts", href: "/admin/dashboard/shifts/create" },
              { label: "Schedules", href: "/admin/dashboard/schedules" },
              { label: "Add Schedules", href: "/admin/dashboard/schedules/create" },
            ]}
            minimized={minimized}
          />

          <SidebarLink href="/admin/dashboard/profiles" icon={User} minimized={minimized}>
            Profile
          </SidebarLink>
        </nav>

        <div className={clsx("p-4 border-t border-slate-200 bg-gradient-to-t from-slate-200/60 via-slate-100 to-white",
          minimized ? "flex justify-center" : ""
        )}
        >
          <div className={clsx("flex items-center bg-white border border-slate-300 p-2 rounded-xl shadow-sm",
            minimized ? "justify-center h-12 w-12" : "space-x-3 w-full cursor-pointer"
          )}
          >
            <div className={`${roleStyles[formattedRole]} p-2 rounded-lg flex items-center justify-center`}>
              <CircleUserRound size={22} strokeWidth={1.5} />
            </div>
            {!minimized && (
              <div className="flex flex-col text-sm leading-tight">
                <span className="font-semibold">{user?.name || "Guest"}</span>
                <span className="text-xs text-slate-500 truncate">
                  {user?.email || ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
