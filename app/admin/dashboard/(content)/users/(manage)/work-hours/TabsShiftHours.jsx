"use client";

import { useState } from "react";
import UsersModal from "./UsersModal";
import { Card } from "@/_components/ui/Card";
import { minutesToTime } from "@/_function/globalFunction";
import { Clock } from "lucide-react";
import { shiftStyles } from "@/_constants/shiftConstants";

export default function TabsShiftHours({ shifts }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
      {shifts.map((shift) => (
        <Card key={shift.id} onClick={() => setSelected(shift)} className="cursor-pointer group rounded-xl border border-slate-200 p-4">
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
                  {minutesToTime(shift.startTime)} – {minutesToTime(shift.endTime)}
                </p>
              </div>
            </div>

            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-indigo-600 text-sm font-medium group-hover:bg-indigo-100 transition">
              {shift.users.length}
            </div>
          </div>

          <div className="flex items-center mt-4">
            {shift.users.slice(0, 4).map((u, index) => (
              <div key={u.id}
                className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-semibold border-2 border-white shadow -ml-2 first:ml-0"
              >
                {u.name?.charAt(0).toUpperCase() || "?"}
              </div>
            ))}

            {shift.users.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs border-2 border-white shadow -ml-2">
                +{shift.users.length - 4}
              </div>
            )}
          </div>
        </Card>
      ))}

      {selected && (
        <UsersModal
          open={!!selected}
          onClose={() => setSelected(null)}
          title={selected.name}
          users={selected.users}
        />
      )}
    </div>
  );
}
