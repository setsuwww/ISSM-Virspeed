"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import clsx from "clsx"

import { ChevronDown } from "lucide-react"
import { SidebarSubLink } from "./SidebarSubLink"

export function SidebarCollapsible({ title, items, icon: Icon, minimized }) {
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
    <div className="flex flex-col px-0.5">
      <button onClick={handleClick}
        className={clsx("group w-full flex items-center transition-all duration-200 rounded-lg",
          minimized ? "justify-center h-12 w-12 mx-auto" : "justify-between py-1.5 pl-1.5 pr-2.5",
          isParentActive ? "bg-slate-50 ring ring-slate-200 text-slate-600 font-bold border-b-2 border-0 border-slate-200" : "font-semibold text-slate-600 border border-transparent hover:text-slate-800 hover:bg-slate-50 hover:border hover:border-slate-200"
        )}
      >
        <div className="flex items-center gap-x-3">
          <div className="p-1.5 bg-yellow-500/10 rounded-md">
            <Icon size={18} className="text-yellow-500" />
          </div>
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
            className="ml-5 flex flex-col space-y-1.5 border-l-2 border-dashed border-slate-300"
          >
            <div className="py-2 px-[14.3px]">
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
