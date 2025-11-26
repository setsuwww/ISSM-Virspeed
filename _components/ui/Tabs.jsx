"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/_lib/utils"

function Tabs({ className, ...props }) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  mode = "button",
  ...props
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-mode={mode}
      className={cn(
        "inline-flex items-center w-fit",
        mode === "button" &&
          "bg-slate-50 border border-slate-200 rounded-lg h-10 py-[6px] px-[2px]",
        mode === "link" &&
          "bg-transparent border-b border-slate-200 h-auto p-0 space-x-6",

        className
      )}
      {...props}
    />
  )
}


function TabsTrigger({
  className,
  mode = "button",
  ...props
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-mode={mode}
      className={cn(
        "relative px-3 py-1 text-sm font-medium transition-colors",
        "focus:outline-none disabled:pointer-events-none disabled:opacity-50",

        mode === "button" &&
          cn(
            "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5",
            "rounded-md text-slate-700 hover:bg-slate-100",
            "data-[state=active]:bg-white data-[state=active]:text-sky-600",
            "data-[state=active]:border data-[state=active]:border-slate-300 data-[state=active]:shadow-sm",
          ),

        mode === "link" &&
          cn(
            "text-slate-500 hover:text-slate-800 bg-transparent",
            "data-[state=active]:text-yellow-600 data-[state=active]:bg-yellow-50 px-4",
            "rounded-md",

            "after:absolute after:left-0 after:right-0 after:-bottom-[1px]",
            "after:h-[1px] after:bg-yellow-500 after:scale-x-0",
            "after:transition-transform after:duration-300 after:origin-center after:rounded-full",
            "data-[state=active]:after:scale-x-100"
          ),

        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
