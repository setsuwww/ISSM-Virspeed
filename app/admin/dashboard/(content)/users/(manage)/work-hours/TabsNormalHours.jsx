"use client";

import { useState } from "react";
import { Clock, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";

import UsersModal from "./UsersModal";
import { Card } from "@/_components/ui/Card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/_components/ui/Dropdown-menu";

import { minutesToTime } from "@/_function/globalFunction";

import { useRouter } from "next/navigation";

export default function TabsNormalHours({ divisions }) {
  const [selected, setSelected] = useState(null);
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
      {divisions.map((division) => (
        <div key={division.id} onClick={() => setSelected(division)}
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

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 text-sm font-medium group-hover:bg-slate-200 transition">
                {division.users.length}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
                  >
                    <MoreVertical size={16} />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(division);
                    }}
                  >
                    <Eye size={14} className="mr-2" />
                    Details
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/dashboard/divisions/${division.id}/edit`);
                    }}
                  >
                    <Pencil size={14} className="mr-2" />
                    Edit
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-rose-600 focus:text-rose-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      // handleDelete(division.id)
                    }}
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center">
            {division.users.slice(0, 4).map((u) => (
              <div key={u.id}
                className=" mt-4 w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-semibold border-2 border-white shadow -ml-2 first:ml-0"
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
        </div>
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
