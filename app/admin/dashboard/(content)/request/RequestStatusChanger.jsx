"use client";

import { useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

import { Button } from "@/_components/ui/Button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/_components/ui/Dropdown-menu";

import {
  updateEarlyCheckoutRequestStatus,
  updateLeaveRequestStatus,
  updatePermissionRequestStatus,
  updateShiftChangeRequestStatus
} from "@/_server/admin-action/requestAction";

const statusUI = {
  PENDING: { label: "Pending", dot: "bg-yellow-400", ping: true },
  APPROVED: { label: "Approved", dot: "bg-teal-500" },
  REJECTED: { label: "Rejected", dot: "bg-rose-500" },
};

function StatusDot({ color, ping }) {
  return (
    <span className="relative flex w-2.5 h-2.5">
      {ping && (
        <span className={`absolute inset-0 rounded-full animate-ping opacity-30 ${color}`} />
      )}
      <span className={`relative w-2.5 h-2.5 rounded-full ${color}`} />
    </span>
  );
}

export default function RequestStatusChangerToggle({ id, status, type, disabled }) {
  const [isPending, startTransition] = useTransition();
  const ui = statusUI[status] ?? statusUI.PENDING;

  const isFinal = status === "APPROVED" || status === "REJECTED";

  const handleChange = (newStatus) => {
    startTransition(async () => {
      if (type === "PERMISSION") {
        await updatePermissionRequestStatus(id, newStatus);
      }
      if (type === "CHANGE-SHIFT") {
        await updateShiftChangeRequestStatus(id, newStatus);
      }
      if (type === "LEAVE") {
        await updateLeaveRequestStatus(id, newStatus);
      }
      if (type === "EARLY-CHECKOUT") {
        await updateEarlyCheckoutRequestStatus(id, newStatus);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant={isFinal ? "ghost" : "outline"} disabled={disabled || isPending}
          className={`${isFinal ? "hover:bg-slate-100 cursor-not-allowed px-4" : "px-6 py-0.5"} rounded-full text-xs flex items-center gap-2`}
        >
          <StatusDot color={ui.dot} ping={!isFinal && ui.ping} />
          {ui.label}

          {!isFinal && (isPending
            ? (<Loader2 className="w-3 h-3 animate-spin" />)
            : (<ChevronDown className="w-4 h-4 text-slate-400" />)
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36 p-1.5 font-medium text-xs">
        <DropdownMenuItem onClick={() => handleChange("APPROVED")}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-2.5 w-2.5 scale-155 rounded-full bg-teal-400 opacity-25"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-500"></span>
          </span>
          Approve
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleChange("REJECTED")}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-2.5 w-2.5 scale-155 rounded-full bg-rose-400 opacity-25"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500"></span>
          </span>
          Reject
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
