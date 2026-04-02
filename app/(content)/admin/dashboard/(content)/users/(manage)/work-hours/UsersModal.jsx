"use client";

import { useState, useMemo, useRef } from "react";
import { Calendar, CircleUserRound } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/_components/ui/Dialog";
import { ScrollArea } from "@/_components/ui/Scroll-area";

import WorkHoursActionHeader from "./WorkHoursActionHeader";

export default function UsersModal({ open, onClose, title, users }) {
  const [search, setSearch] = useState("");
  const searchInputRef = useRef(null);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());

      return matchSearch;
    });
  }, [users, search]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="full" className="p-0">
        <DialogHeader>
          <div className="flex items-center gap-4 py-5 px-6">

            <VisuallyHidden>
              <DialogTitle>Users Detail Dialog</DialogTitle>
            </VisuallyHidden>

            <div className="p-3 rounded-lg bg-indigo-100">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>

            <div className="flex flex-col gap-0.5">
              <h1 className="text-xl font-semibold">Location : {title}</h1>
              <p className="text-sm text-slate-500">
                Lists users on this shift if the user have shift assigned
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6">
          <WorkHoursActionHeader
            search={search}
            onSearchChange={setSearch}
            searchInputRef={searchInputRef}
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="px-6 pb-6 pt-3 text-center">
            <p className="text-sm text-slate-500">No users found.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-90 px-2 pb-6">
            <ul className="space-y-1 px-4 pb-2">
              {filteredUsers.map((u) => (
                <li key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition">
                  <span className="icon-parent">
                    <CircleUserRound className="icon" strokeWidth={1} />
                  </span>

                  <div className="flex flex-col">
                    <span className="font-medium text-slate-800 text-sm">
                      {u.name}
                    </span>
                    {u.email && (
                      <span className="text-xs text-slate-500">{u.email}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
