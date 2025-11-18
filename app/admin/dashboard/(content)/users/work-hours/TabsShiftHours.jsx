"use client";

import { useState } from "react";
import UsersModal from "./UsersModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/_components/ui/Card";
import { minutesToTime } from "@/_function/globalFunction";

export default function TabsShiftHours({ shifts }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
      {shifts.map((shift) => (
        <Card key={shift.id} className="cursor-pointer hover:shadow-md transition" onClick={() => setSelected(shift)}>
          <CardHeader>
            <CardTitle>{shift.name}</CardTitle>
            <p className="text-sm text-slate-500">
              {minutesToTime(shift.startTime)} – {minutesToTime(shift.endTime)}
            </p>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-slate-600">
              {shift.users.length} Users
            </p>
          </CardContent>
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
