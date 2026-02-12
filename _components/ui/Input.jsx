import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/_lib/utils";

const sizeClasses = {
  sm: "h-8 px-2 text-xs md:text-sm",
  md: "h-9 px-3 text-sm",
  lg: "h-10 px-4 text-base",
};

function Input({ className, type = "text", size = "md", typeSearch = false, typeDate = false, value, onChange, ...props }) {

  const baseClasses = "file:text-slate-600 placeholder:text-slate-500 flex w-full min-w-0 rounded-lg border transition-[color,box-shadow,border] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";
  const defaultFocus = "border-slate-300/60 bg-white focus-visible:border-slate-300 focus-visible:ring-[4px] focus-visible:ring-slate-100 shadow-2xs";
  const searchFocus = "border-slate-300/90 bg-slate-100/80 focus-visible:border focus-visible:border-slate-500/50 focus-visible:ring-2 focus-visible:ring-slate-300/50 caret-slate-400";

  if (typeDate) {
    return (
      <div className="relative flex items-center w-full text-slate-500">
        <Calendar className="absolute left-3 w-4 h-4 pointer-events-none" />

        <input
          type="date"
          value={value}
          onChange={onChange}
          className={cn(
            baseClasses,
            sizeClasses[size],
            "pl-9",
            defaultFocus,
            className
          )}
          {...props}
        />

        {value && (
          <span className="absolute right-3 text-xs text-slate-400 pointer-events-none">
            {new Date(value).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      className={cn(
        baseClasses,
        sizeClasses[size],
        typeSearch ? searchFocus : defaultFocus,
        "aria-invalid:border-rose-300 aria-invalid:ring-rose-100",
        className
      )}
      {...props}
    />
  );
}

export { Input };
