"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/_components/ui/Dialog";
import { ScrollArea } from "@/_components/ui/Scroll-area";

export default function UsersModal({ open, onClose, title, users }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="xl" className="p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        {users.length === 0 ? (
          <div className="px-6 pb-6 pt-3 text-center">
            <p className="text-sm text-slate-500">No users found.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[320px] px-2 pb-4">
            <ul className="space-y-1 px-4 pb-2">
              {users.map((u) => (
                <li key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-slate-200/60">
                  <span className="px-3 py-2 bg-slate-200 text-slate-600 text-xs rounded-full">
                    {u.name?.charAt(0).toUpperCase()}
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
