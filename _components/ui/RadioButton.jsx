"use client";
import * as React from "react";
import { cn } from "@/_lib/utils";

export function RadioButton({
  options,
  value,
  onChange,
  name,
  disabled = false, // global disabled
}) {
  return (
    <div className="flex space-x-4">
      {options.map((option) => {
        const selected = value === option.value;
        const isDisabled = disabled || option.disabled;

        return (
          <label
            key={option.value}
            className={cn(
              "rounded-md border p-3 text-sm font-medium flex flex-col transition-all duration-200 ease-in-out",
              !isDisabled && "cursor-pointer active:scale-95",
              selected
                ? "border-slate-300 bg-slate-50 text-slate-700"
                : "border-slate-200 shadow-sm bg-white text-slate-700 hover:bg-slate-50",
              isDisabled && "opacity-50 cursor-not-allowed hover:bg-white active:scale-100"
            )}
          >
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                disabled={isDisabled}
                onChange={() => {
                  if (!isDisabled) onChange(option.value);
                }}
                className="sr-only"
              />

              <span
                className={cn(
                  "w-5 h-5 flex items-center justify-center rounded-full border transition-colors",
                  selected ? "border-slate-500" : "border-slate-300"
                )}
              >
                {selected && (
                  <span className="w-3 h-3 rounded-full bg-slate-700" />
                )}
              </span>

              <span>{option.label}</span>
            </div>

            {option.description && (
              <span className="ml-[28px] mt-0.5 text-xs text-slate-500">
                {option.description}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
