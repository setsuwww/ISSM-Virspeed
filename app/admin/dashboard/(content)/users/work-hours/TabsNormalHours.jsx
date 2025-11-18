"use client";

import { useState } from "react";
import UsersModal from "./UsersModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/_components/ui/Card";
import { minutesToTime } from "@/_function/globalFunction";

export default function TabsNormalHours({ divisions }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
      {divisions.map((division) => (
        <Card key={division.id} className="cursor-pointer hover:shadow-md transition" onClick={() => setSelected(division)}>
          <CardHeader>
            <CardTitle>{division.name}</CardTitle>
            <p className="text-sm text-slate-500">
              {minutesToTime(division.startTime)} – {minutesToTime(division.endTime)}
            </p>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-slate-600">
              {division.users.length} Users
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
