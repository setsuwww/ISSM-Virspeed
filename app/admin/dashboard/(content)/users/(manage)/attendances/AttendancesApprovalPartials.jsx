"use client";

import { Users } from "lucide-react";
import { Badge } from "@/_components/ui/Badge";
import { capitalize } from "@/_function/globalFunction";

export default function AttendancesApprovalPartials({
  status, users, approvalCounts, statusColorsClass, onClick,
}) {
  return (
    <div onClick={onClick} className="relative bg-white border border-slate-200 p-4 rounded-lg shadow-xs cursor-pointer hover:scale-105 transition-all">
      {users.length > 0 && (
        <span className="absolute -top-1 -right-1 w-3 h-3 flex items-center justify-center">
          <span className={`absolute w-full h-full rounded-full animate-ping opacity-75 ${
              statusColorsClass[status]?.bgDot || "bg-slate-300"
            }`}
          ></span>
          <span className={`relative w-3 h-3 rounded-full ${
              statusColorsClass[status]?.bgDot || "bg-slate-500"
            }`}
          ></span>
        </span>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`flex flex-col font-semibold px-2 py-1 rounded-lg ${statusColorsClass[status]?.head ||
              "bg-slate-100 text-slate-700"
            }`}
          >
            <span>{capitalize(status)}</span>
          </span>

          {status === "PERMISSION" && users.length > 0 && (
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="px-2 py-1 rounded-md bg-teal-50 text-teal-600">
                A : {approvalCounts.accepted}
              </span>
              <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-600">
                P : {approvalCounts.pending}
              </span>
              <span className="px-2 py-1 rounded-md bg-rose-50 text-rose-600">
                R : {approvalCounts.rejected}
              </span>
            </div>
          )}
        </div>

        <Badge className={`text-xs px-2 py-0.5 border ${statusColorsClass[status]?.border || "bg-slate-200"}`}>
          {users.length} Person
        </Badge>
      </div>

      <footer className="flex items-center gap-2 text-sm text-slate-600">
        <div className="p-2 bg-slate-200 rounded-full">
          <Users className="w-4 h-4" strokeWidth={2} />
        </div>
        <span className="font-semibold">{users.length} Person</span>
      </footer>
    </div>
  );
}
