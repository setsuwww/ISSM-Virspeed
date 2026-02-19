"use client";

import { useState } from "react";
import { Clock, User } from "lucide-react";
import UsersModal from "./UsersModal";
import { minutesToTime } from "@/_functions/globalFunction";

export default function TabsNormalHours({ divisions = [] }) {
  const [selected, setSelected] = useState(null);

  if (!Array.isArray(divisions) || divisions.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        No division data available
      </p>
    );
  }

  const openModal = (division) => {
    setSelected({
      ...division,
      users: division.users ?? [],
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
      {divisions.map((division) => {
        const users = division.users ?? [];

        return (
          <div key={division.id} onClick={() => openModal(division)}
            className="cursor-pointer group rounded-lg border border-slate-200 p-4 hover:shadow transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-full bg-indigo-100/50 text-indigo-600">
                  <Clock size={18} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-600">
                    {division.name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-0.5">
                    {division.startTime != null && division.endTime != null
                      ? `${minutesToTime(division.startTime)} – ${minutesToTime(
                        division.endTime
                      )}`
                      : "No working hours"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                  {users.length}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(division);
                  }}
                  className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
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
                  {u.name?.charAt(0)?.toUpperCase() || "?"}
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
          open
          onClose={() => setSelected(null)}
          title={selected.name}
          users={selected.users ?? []}
        />
      )}
    </div>
  );
}
