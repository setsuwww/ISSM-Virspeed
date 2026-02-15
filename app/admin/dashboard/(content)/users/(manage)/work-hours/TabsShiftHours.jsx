"use client";

import { useState } from "react";
import { Clock, User } from "lucide-react";
import UsersModal from "./UsersModal";
import { minutesToTime } from "@/_functions/globalFunction";
import { shiftStyles } from "@/_constants/shiftConstants";

export default function TabsShiftHours({ shifts = [] }) {
  const [selected, setSelected] = useState(null);

  if (!Array.isArray(shifts)) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
      {shifts.map((shift) => {
        const users = shift.users ?? [];

        return (
          <div
            key={shift.id}
            onClick={() => setSelected(shift)}
            className="cursor-pointer group rounded-xl border border-slate-200 p-4 hover:shadow transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-md ${shiftStyles[shift.type]}`}>
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-600">
                    {shift.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {minutesToTime(shift.startTime)} –{" "}
                    {minutesToTime(shift.endTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-sm font-medium">
                  {users.length}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelected(shift);
                  }}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
                >
                  <User size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center">
              {users.slice(0, 4).map((u) => (
                <div
                  key={u.id}
                  className="mt-4 w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-semibold border-2 border-white shadow -ml-2 first:ml-0"
                >
                  {u.name?.charAt(0).toUpperCase() || "?"}
                </div>
              ))}

              {users.length > 4 && (
                <div className="mt-4 w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs border-2 border-white shadow -ml-2">
                  +{users.length - 4}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {selected && (
        <UsersModal
          open onClose={() => setSelected(null)} title={selected.name} users={selected.users ?? []}
        />
      )}
    </div>
  );
}
