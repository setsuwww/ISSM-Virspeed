"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/_components/ui/Dialog";

const colors = [
  "bg-rose-200 text-rose-700",
  "bg-blue-200 text-blue-700",
  "bg-emerald-200 text-emerald-700",
  "bg-amber-200 text-amber-700",
  "bg-violet-200 text-violet-700",
  "bg-slate-200 text-slate-700",
];

export default function ScheduleUsersDialog({ users }) {
  const [open, setOpen] = useState(false);

  if (!users || users.length === 0) {
    return <span className="text-xs text-slate-400">No users assigned</span>;
  }

  const limitedUsers = users.slice(0, 4);
  const extraCount = users.length - 4;

  const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="flex items-center justify-between w-full mt-2">

      <div className="flex items-center gap-3">
        <div className="flex -space-x-3.5">
          {limitedUsers.map((u, i) => (
            <div key={u.user.id}
              className={`w-8 h-8 rounded-full bg-slate-200 border-2 border-white text-slate-400 shadow-xs flex items-center justify-center text-xs font-semibold`}
            >
              {getInitial(u.user.name)}
            </div>
          ))}

          {extraCount > 0 && (
            <div className="w-8 h-8 rounded-full bg-slate-200 text-xs text-slate-400 flex items-center justify-center border border-white">
              +{extraCount}
            </div>
          )}
        </div>

        {/* TEXT COUNT */}
        <span className="text-xs font-medium text-slate-600">
          {users.length} Users
        </span>
      </div>

      {/* RIGHT SIDE: View Details */}
      <button
        className="text-xs text-sky-400 hover:underline"
        onClick={() => setOpen(true)}
      >
        View details
      </button>

      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>All Assigned Users</DialogTitle>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto space-y-2 mt-2">

            {users.map((u, i) => (
              <div
                key={u.user.id}
                className="flex items-center justify-between border-b py-2"
              >
                <div className="flex items-center gap-3">

                  {/* AVATAR INSIDE MODAL */}
                  <div
                    className={`
                      w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border border-white shadow
                      ${colors[i % colors.length]}
                    `}
                  >
                    {getInitial(u.user.name)}
                  </div>

                  <span className="text-sm font-medium text-slate-700">
                    {u.user.name}
                  </span>
                </div>

                <span className="text-xs text-slate-500">{u.user.email}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
