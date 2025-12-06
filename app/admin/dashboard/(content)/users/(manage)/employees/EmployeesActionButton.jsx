"use client";

import { RefreshCcw, Eye } from "lucide-react";
import { Button } from "@/_components/ui/Button";

export const EmployeesActionButton = ({ onHistory, onSwitch, onEdit, onDelete }) => {
  return (
    <div className="flex items-center space-x-2">
      <Button size="icon" variant="outline" onClick={onHistory}>
        <Eye strokeWidth={1.5} />
      </Button>
      <Button size="icon" variant="outline" onClick={onSwitch}>
        <RefreshCcw strokeWidth={1.5} />
      </Button>
      <Button size="sm" variant="outline" onClick={onEdit}>
        Edit
      </Button>
      <Button size="sm" variant="destructive" onClick={onDelete}>
        Delete
      </Button>
    </div>
  );
}
