"use client";

import { useState } from "react";
import { CircleUserRound } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/_components/ui/Dialog";

export default function ScheduleUsersDialog({ users, schedules }) {
  const [open, setOpen] = useState(false);

  if (!users || users.length === 0) { return <span className="text-xs text-slate-400">No users assigned</span>}
  const limitedUsers = users.slice(0, 4);
  const hasMore = users.length > 4;

  return (
    <div className="flex flex-col gap-1 mt-2">
      {limitedUsers.map((u) => (
        <div key={u.user.id} className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-400 rounded-md">
            {u.user.name}
          </span>
          <span className="text-xs text-sky-400">{u.user.email}</span>
        </div>
      ))}

      {hasMore && (
        <>
          <button size="sm" className="text-left mt-2 text-xs text-blue-600" onClick={() => setOpen(true)}>
            View Details
          </button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>All Assigned Users</DialogTitle>
              </DialogHeader>

              <div className="max-h-[400px] overflow-y-auto space-y-2 mt-2">
                {users.map((u) => (
                  <div key={u.user.id} className="flex items-center justify-between text-sm border-b py-1">
                    <span className="flex items-center space-x-1 font-semibold text-slate-600">
                      <span className="text-sky-500 hover:bg-sky-100 p-1 hover:text-sky-700">
                        <CircleUserRound className="w-4 h-4" />
                      </span>
                      <span>{u.user.name}</span>
                    </span>
                    <span className="text-slate-400">{u.user.email}</span>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
