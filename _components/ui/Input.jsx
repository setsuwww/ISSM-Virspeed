import * as React from "react"
import { Calendar } from "lucide-react"
import { cn } from "@/_lib/utils"

function Input({ className, type, typeSearch = false, typeDate = false, value, onChange, ...props }) {
  const baseClasses =
    "file:text-slate-600 placeholder:text-slate-500 flex h-9 w-full min-w-0 rounded-lg border px-3 py-1 text-base transition-[color,box-shadow,border] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"

  const defaultFocus =
    "border-slate-300 focus-visible:border-slate-300 focus-visible:ring-slate-100 bg-white focus-visible:ring-[4px] shadow-xs focus:placeholder:text-slate-400"
  const searchFocus =
    "border-slate-300/50 focus-visible:border-slate-300/50 bg-slate-50/90 focus-visible:ring-slate-100 placeholder:text-slate-400 caret-slate-400"

  if (typeDate) {
    return (
      <div className="relative flex items-center w-full text-slate-400">
        <Calendar className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="date"
          value={value}
          onChange={onChange}
          className={cn(
            baseClasses,
            "pl-8 text-slate-400", // space for icon
            defaultFocus,
            className
          )}
          {...props}
        />
        {value && (
          <span className="absolute right-3 text-slate-400 pointer-events-none">
            : {new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        )}
      </div>
    )
  }

  return (
    <input
      type={type}
      className={cn(baseClasses, typeSearch ? searchFocus : defaultFocus, "aria-invalid:border-rose-300 aria-invalid:ring-rose-100", className)}
      value={value}
      onChange={onChange}
      {...props}
    />
  )
}

export { Input }
