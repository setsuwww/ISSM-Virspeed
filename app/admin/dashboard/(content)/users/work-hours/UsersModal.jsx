"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/_components/ui/Dialog";

export default function UsersModal({ open, onClose, title, users }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {users.length === 0 ? (
          <p className="text-sm text-slate-500">No users found.</p>
        ) : (
          <ul className="space-y-2">
            {users.map((u) => (
              <li key={u.id} className="p-2 border rounded-md text-sm font-medium text-slate-700">
                {u.name}
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
