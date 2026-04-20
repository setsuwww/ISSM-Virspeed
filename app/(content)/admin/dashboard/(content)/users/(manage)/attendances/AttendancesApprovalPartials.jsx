"use client";

import React from "react";
import { Calendar, User } from "lucide-react";
import { capitalize } from "@/_functions/globalFunction";

function AttendancesApprovalPartials({
  status, users, approvalCounts, statusColorsClass, onClick,
}) {
  return (
    <div onClick={onClick} className="relative bg-white border-b-2 border-slate-200 ring ring-slate-200 p-4 rounded-lg shadow-xs cursor-pointer transition-all">
      {users.length > 0 && (
        <span className="absolute -top-1 -right-1 w-3 h-3 flex items-center justify-center">
          <span className={`absolute w-full h-full rounded-full animate-ping opacity-75 ${statusColorsClass[status]?.bgDot || "bg-slate-300"}`}></span>
          <span className={`relative w-3 h-3 rounded-full ${statusColorsClass[status]?.bgDot || "bg-slate-500"}`}></span>
        </span>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`flex flex-col font-semibold px-2 py-1 rounded-lg ${statusColorsClass[status]?.head || "bg-slate-100 text-slate-700"}`}>
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 flex items-center justify-center rounded-lg border ${statusColorsClass[status]?.border || "bg-slate-50 border-slate-200 text-slate-600"}`}>
                <Calendar className="w-6 h-6" strokeWidth={2} />
              </div>
              {status === "PERMISSION" && users.length > 0 && (
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-600">
                    A : {approvalCounts.accepted}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-600">
                    P : {approvalCounts.pending}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-red-50 text-red-600">
                    R : {approvalCounts.rejected}
                  </span>
                </div>
              )}
            </div>

            <span className="mt-2">Status {capitalize(status)}</span>
          </span>


        </div>
      </div>

      <footer className="flex items-center gap-2 ml-2 pb-2 text-sm text-slate-600">
        <span className="flex items-center font-semibold leading-none">
          <User className="w-4 h-4 mr-2" /> {users.length} Person
        </span>
      </footer>
    </div>
  );
}

export default React.memo(AttendancesApprovalPartials)
