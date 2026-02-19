import * as React from "react"

import { cn } from "@/_lib/utils"

function Textarea({ className, ...props }) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-slate-300 focus-visible:border-slate-300 focus-visible:ring-slate-100 bg-white focus-visible:ring-[4px] shadow-xs focus:placeholder:text-slate-400 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-lg border px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
