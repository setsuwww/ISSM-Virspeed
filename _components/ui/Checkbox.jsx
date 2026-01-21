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
        "peer border-slate-500/30 ring ring-slate-200 data-[state=checked]:ring-indigo-600 data-[state=checked]:bg-indigo-500 border-0 data-[state=checked]:border-t data-[state=checked]:border-indigo-300 data-[state=checked]:text-white focus-visible:border-indigo-300 focus-visible:ring-indigo-300 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 size-4 shrink-0 rounded-[4px] outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "transition-transform duration-150 ease-out active:scale-110",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-transform duration-150 ease-out data-[state=checked]:scale-100"
      >
        <Check className="size-3" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
