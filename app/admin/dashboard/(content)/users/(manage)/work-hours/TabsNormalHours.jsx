"use client";

import { useState } from "react";
import UsersModal from "./UsersModal";
import { Card } from "@/_components/ui/Card";
import { minutesToTime } from "@/_function/globalFunction";
import { Clock } from "lucide-react";

export default function TabsNormalHours({ divisions }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
      {divisions.map((division) => (
        <Card key={division.id} onClick={() => setSelected(division)}
          className="cursor-pointer group rounded-xl border border-slate-200 p-4 hover:shadow transition"
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
                  {minutesToTime(division.startTime)} – {minutesToTime(division.endTime)}
                </p>
              </div>
            </div>

            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 text-sm font-medium group-hover:bg-slate-200 transition">
              {division.users.length}
            </div>
          </div>

          <div className="flex items-center mt-4">
            {division.users.slice(0, 4).map((u) => (
              <div key={u.id}
                className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-semibold border-2 border-white shadow -ml-2 first:ml-0"
              >
                {u.name?.charAt(0).toUpperCase() || "?"}
              </div>
            ))}

            {division.users.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs border-2 border-white shadow -ml-2">
                +{division.users.length - 4}
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
