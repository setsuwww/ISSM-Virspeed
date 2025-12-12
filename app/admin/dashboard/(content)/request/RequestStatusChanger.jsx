"use client";

import { useState, useTransition } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/_components/ui/Dropdown-menu";
import { Button } from "@/_components/ui/Button";
import { ChevronDown, Loader2 } from "lucide-react";

import { dotStatusColor, getDisplayStatus } from "@/_constants/attendanceConstants";

export default function RequestStatusChangerToggle({
  requestId,
  status,
  disabled,
  onReject,
  onStatusChange,
}) {
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();

  const handleChange = (newStatus) => {
    if (newStatus === current) return;

    if (newStatus === "REJECTED") {
      onReject?.();
      return;
    }

    startTransition(() => {
      onStatusChange?.(newStatus);
      setCurrent(newStatus);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm"
          disabled={disabled || isPending}
          className="
            px-8 py-0.5 rounded-full text-xs font-base
            border-slate-200 text-slate-600
            shadow-xs hover:border-slate-300 transition-all duration-200
            bg-white hover:bg-slate-50
            flex items-center gap-x-2
            data-[state=open]:bg-slate-100
          "
        >
          <span className={`ml-1 w-2.5 h-2.5 rounded-full transition-all ${dotStatusColor[current]}`}/>
          <span className="tracking-wide">
            {getDisplayStatus(current)}
          </span>

          {isPending 
            ? (<Loader2 className="w-3 h-3 animate-spin" />) 
            : (<ChevronDown className="w-4 h-4 text-slate-400 transition-transform data-[state=open]:rotate-180" />)
          }
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="
          w-36 p-1.5 rounded-md
          border border-slate-200 bg-white
          shadow-lg animate-in fade-in slide-in-from-top-2
        "
      >
        <DropdownMenuItem onClick={() => handleChange("APPROVED")}
          className="flex items-center
            text-teal-600 text-xs py-2 rounded-md cursor-pointer
            hover:bg-teal-100/60 focus:bg-teal-100/60 transition-all hover:text-teal-700 focus:text-teal-700 
          "
        >
          <span className={`w-2.5 h-2.5 rounded-full transition-all bg-teal-500/50 ring ring-offset-2 ring-teal-200`} />
          Approve
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleChange("REJECTED")}
          className="flex items-center
            text-rose-600 text-xs py-2 rounded-md cursor-pointer
            hover:bg-rose-50 focus:bg-rose-50 transition-all hover:text-rose-700 focus:text-rose-700 
          "
        >
          <span className={`w-2.5 h-2.5 rounded-full transition-all bg-rose-500 ring ring-offset-2 ring-rose-200`} />
          Reject
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
