"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/_components/ui/Dialog";
import { getInitial } from "@/_functions/globalFunction";

export default function ScheduleUsersDialog({ users }) {
  const [open, setOpen] = useState(false);

  if (!users || users.length === 0) {
    return <span className="text-xs text-slate-400">No users assigned</span>;
  }

  const limitedUsers = users.slice(0, 4);
  const extraCount = users.length - 4;

  return (
    <div className="flex items-center justify-between w-full mt-2">

      <div className="flex items-center gap-3">
        <div className="flex -space-x-3 ">
          {limitedUsers.map((u, i) => (
            <div key={u.user.id}
              className={`w-8 h-8 rounded-full bg-slate-200 border-2 border-white text-slate-400 shadow-xs flex items-center justify-center text-xs font-semibold`}
            >
              {getInitial(u.user.name)}
            </div>
          ))}

          {extraCount > 0 && (
            <div className="w-8 h-8 rounded-full backdrop-blur-sm bg-slate-200/60 text-xs text-slate-400 flex items-center justify-center border border-white">
              +{extraCount}
            </div>
          )}
        </div>

        <span className="text-xs font-medium text-slate-600">
          {users.length} Users
        </span>
      </div>

      <button className="text-xs text-sky-400 hover:underline" onClick={() => setOpen(true)}>
        View details
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>All Assigned Users</DialogTitle>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto space-y-2 mt-2">

            {users.map((u, i) => (
              <div key={u.user.id} className="flex items-center justify-between border-b py-2">
                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm bg-slate-800 border border-white shadow text-white"
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
