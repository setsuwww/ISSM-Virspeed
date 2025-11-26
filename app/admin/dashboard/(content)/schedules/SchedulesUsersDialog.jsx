"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/_components/ui/Dialog";
import { Badge } from "@/_components/ui/Badge";
import { capitalize } from "@/_function/globalFunction";
import { frequencyStyles } from "@/_constants/scheduleConstants";
import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";

const AVATAR_COLORS = [
  "bg-rose-600",
  "bg-amber-600",
  "bg-yellow-600",
  "bg-lime-600",
  "bg-sky-600",
  "bg-violet-600",
];

const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "?";

export default function ScheduleUsersDialog({ schedules, users }) {
  const [open, setOpen] = useState(false);
  const formattedStartDate = format(new Date(schedules.startDate), "dd MMMM yyyy");

  if (!users || users.length === 0) {
    return <span className="text-xs text-slate-400">No users assigned</span>;
  }

  const limitedUsers = users.slice(0, 4);
  const extraCount = users.length - 4;

  return (
    <div className="flex items-center justify-between w-full mt-2">

      <div className="flex items-center gap-3">
        <div className="flex -space-x-3">
          {limitedUsers.map((u) => (
            <div key={u.user.id} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white text-slate-400 shadow-xs flex items-center justify-center text-xs font-semibold">
              {getInitial(u.user.name)}
            </div>
          ))}

          {extraCount > 0 && (
            <div className="w-8 h-8 rounded-full bg-slate-200 text-xs text-slate-400 border border-white flex items-center justify-center">
              +{extraCount}
            </div>
          )}
        </div>

        <span className="text-xs font-medium text-slate-600">{users.length} Users</span>
      </div>

      <button className="text-xs text-sky-500 hover:underline" onClick={() => setOpen(true)}>
        View details
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg h-full" position="right">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-800">
              Assigned Users
            </DialogTitle>
          </DialogHeader>

          <div className="rounded-md border bg-slate-50/50 p-3 space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">{schedules.title}</span>
              <Badge className={frequencyStyles[capitalize(schedules.frequency)]}>
                {capitalize(schedules.frequency)}
              </Badge>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">{schedules.description}</p>

            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-slate-500" />
                <span className="text-xs text-slate-500">{schedules.startTime}</span>
              </div>

              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-slate-500" />
                <span className="text-xs text-slate-500">{formattedStartDate}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-[70vh] overflow-y-auto">
            {users.map((u, i) => (
              <div key={u.user.id} className="flex items-center gap-3 rounded-md border bg-white px-3 py-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                  {getInitial(u.user.name)}
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-800">{u.user.name}</span>
                  <span className="text-xs text-slate-500">{u.user.email}</span>
                </div>
              </div>
            ))}
          </div>

        </DialogContent>
      </Dialog>
    </div>
  );
}
