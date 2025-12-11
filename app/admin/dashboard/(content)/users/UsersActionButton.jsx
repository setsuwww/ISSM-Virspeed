import { Button } from "@/_components/ui/Button"
import { KeySquareIcon } from "lucide-react";

export function LockedAction() {
  return (
    <div className="flex items-center cursor-not-allowed">
      <div className="flex items-center gap-1 py-2 px-2 bg-slate-100 border border-slate-200 text-slate-400 italic rounded-md">
        <KeySquareIcon className="w-4 h-4" />  Locked
      </div>
    </div>
  );
}

export const UsersActionButton = ({ userId, onEdit, onDelete }) => {
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={() => onEdit(userId)}>
        Edit
      </Button>
      <Button size="sm" variant="destructive" onClick={() => onDelete(userId)}>
        Delete
      </Button>
    </div>
  )
}
