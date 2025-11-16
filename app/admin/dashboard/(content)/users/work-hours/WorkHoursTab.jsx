"use client";

import { useState } from "react";
import { Clock3, ClipboardList } from "lucide-react";

export default function WorkHoursTab({ divisions, shifts }) {
  const [activeTab, setActiveTab] = useState("normal");

  return (
    <div className="w-full border-b border-slate-200">
      {/* Tabs */}
      <div className="flex space-x-6">
        {[
          { key: "normal", label: "Normal Hours", icon: <Clock3 className="w-4 h-4" /> },
          { key: "shift", label: "Shift Hours", icon: <ClipboardList className="w-4 h-4" /> },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`
              flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-all
              ${
                activeTab === t.key
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }
            `}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="pt-6">

        {/* NORMAL HOURS (TABLE) */}
        {activeTab === "normal" && (
          <div className="space-y-10">

            {divisions.map((division) => (
              <div key={division.id} className="space-y-3">
                <h3 className="font-semibold text-slate-800">
                  {division.name} — {division.startTime ?? "-"} : {division.endTime ?? "-"}
                </h3>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-sm text-slate-600">User Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {division.users.length === 0 ? (
                      <tr>
                        <td className="py-2 text-slate-500 text-sm">
                          No users follow this division.
                        </td>
                      </tr>
                    ) : (
                      division.users.map((u) => (
                        <tr key={u.id} className="border-b last:border-none">
                          <td className="py-2 text-slate-800">{u.name}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ))}

          </div>
        )}

        {/* SHIFT HOURS (TABLE) */}
        {activeTab === "shift" && (
          <div className="space-y-10">

            {shifts.map((shift) => (
              <div key={shift.id} className="space-y-3">
                <h4 className="font-semibold text-slate-800">
                  {shift.name} — {shift.startTime ?? "-"} : {shift.endTime ?? "-"}
                </h4>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-sm text-slate-600">User Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shift.users.length === 0 ? (
                      <tr>
                        <td className="py-2 text-slate-500 text-sm">
                          No users in this shift.
                        </td>
                      </tr>
                    ) : (
                      shift.users.map((u) => (
                        <tr key={u.id} className="border-b last:border-none">
                          <td className="py-2 text-slate-800">{u.name}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}
