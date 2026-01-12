"use client";

import { RefreshCcw, Eye } from "lucide-react";
import { Button } from "@/_components/ui/Button";

export const EmployeesActionButton = ({ mode = "default", onHistory, onSwitch, onEdit, onDelete }) => {
  const isWorkHours = mode === "work-hours"
  const showShift = !isWorkHours

  return (
    <div className="flex items-center space-x-2">
      <Button size="icon" variant="ghost" onClick={onHistory}>
        <Eye strokeWidth={1.5} />
      </Button>

      {showShift && (
        <Button size="icon" variant="ghost" onClick={onSwitch}>
          <RefreshCcw strokeWidth={1.5} />
        </Button>
      )}

      <Button size="sm" variant="outline" onClick={onEdit}>
        Edit
      </Button>
      <Button size="sm" variant="destructive" onClick={onDelete}>
        Delete
      </Button>
    </div>
  );
}
