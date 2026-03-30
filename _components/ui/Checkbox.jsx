"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/_lib/utils"

function Checkbox({
  className,
  ...props
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer bg-slate-500/10 border-slate-500/50 ring ring-slate-300/30 data-[state=checked]:ring-indigo-600 data-[state=checked]:bg-indigo-500 border-0 data-[state=checked]:border-t data-[state=checked]:border-indigo-300 data-[state=checked]:text-white focus-visible:border-indigo-300 focus-visible:ring-indigo-300 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 size-4 shrink-0 rounded-[4px] outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:animate-bouncy",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current data-[state=checked]:animate-bouncy"
      >
        <Check className="size-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
