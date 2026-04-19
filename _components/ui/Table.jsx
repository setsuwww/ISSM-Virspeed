"use client"

import * as React from "react"
import { cn } from "@/_lib/utils"

function Table({
  className,
  ...props
}) {
  return (
    <div data-slot="table-container" className="bg-white relative w-full overflow-x-auto border-y border-slate-200/60">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm text-slate-700", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({
  className,
  ...props
}) {
  return (
    <thead data-slot="table-header" className={cn(
      "[&_tr]:border-b border-slate-100/50 bg-slate-50",
      className
    )}
      {...props}
    />
  )
}

function TableBody({
  className,
  ...props
}) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0 border-slate-200", className)}
      {...props}
    />
  )
}

function TableFooter({
  className,
  ...props
}) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-slate-50 border-t border-slate-200 font-medium [&>tr]:last:border-b-0 text-slate-600",
        className
      )}
      {...props}
    />
  )
}

function TableRow({
  className,
  ...props
}) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "data-[state=selected]:bg-slate-100 border-b border-slate-200/70 transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({
  className,
  ...props
}) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-3 text-left align-middle whitespace-nowrap tracking-tight text-slate-500/80 text-sm font-semibold",
        className
      )}
      {...props}
    />
  )
}

function TableCell({
  className,
  ...props
}) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-3 align-middle whitespace-nowrap text-sm text-slate-700",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-slate-400 mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
