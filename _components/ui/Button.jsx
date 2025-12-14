import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/_lib/utils"

const buttonVariants = cva([
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-base transition-colors duration-100 ease-in",
  "disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus:ring-2",
  ].join(" "),
  {
    variants: { variant: {
        default: "bg-gradient-to-b from-slate-800 to-slate-600 text-white shadow-xs hover:from-slate-900 hover:to-slate-700 hover:inset-shadow-slate-600 focus:ring-slate-400",
        destructive:"bg-red-500 text-white shadow-xs hover:bg-red-700 focus:ring-red-300",
        positive:"bg-teal-500 text-white shadow-xs hover:bg-teal-700 focus:ring-teal-400",
        outline:"border border-slate-300/50 text-slate-500 hover:bg-slate-50 hover:text-slate-700 focus:ring-slate-200",
        primary: "bg-indigo-600 border border-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700",
        secondary:"font-medium text-indigo-600 border border-slate-300 bg-[#ffffff46] rounded-md shadow-xs hover:bg-slate-50 hover:border-indigo-200",
        ghost:"bg-slate-100 text-slate-600 hover:bg-slate-200",
        link: "p-0",
      }, 
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-8 text-indigo-700 hover:text-indigo-900",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }