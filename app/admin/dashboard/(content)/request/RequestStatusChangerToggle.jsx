"use client";

import { useState, useTransition } from "react";
import { Button } from "@/_components/ui/Button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/_components/ui/Dropdown-menu";
import { ChevronDown, Loader } from "lucide-react";
import { dotStatusColor, getDisplayStatus } from "@/_constants/attendanceConstants";

export default function RequestStatusChangerToggle({
  requestId, status,
  disabled,
  onReject, onStatusChange,
}) {
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();

  const handleChange = (newStatus) => {
    if (newStatus === current) return;
    if (newStatus === "REJECTED") {
      onReject?.();
      return;
    }

    startTransition(() => { onStatusChange?.(newStatus);
      setCurrent(newStatus);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || isPending} className="px-2 py-1 border-slate-200 text-slate-400 text-xs font-semibold rounded-full flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotStatusColor[current]}`} />
          <span>
            {getDisplayStatus(current)}
          </span>
          {isPending 
            ? (<Loader className="w-3.5 h-3.5 animate-spin" />) 
            : (<ChevronDown className="w-4 h-4 text-slate-400" />)
          }
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem onClick={() => handleChange("APPROVED")} className="text-teal-500 focus:bg-teal-50 focus:text-teal-600">
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChange("REJECTED")} className="text-rose-500 focus:bg-rose-50 focus:text-rose-700">
          Reject
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
