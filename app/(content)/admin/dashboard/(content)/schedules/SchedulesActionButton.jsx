import { Button } from "@/_components/ui/Button";

export default function ScheduleActionsButtons({ id, onEdit, onDelete }) {
  return (
    <div className="space-x-2">
      <Button type="submit" variant="outline" size="sm" onClick={() => onEdit?.(id)}>
        Edit
      </Button>
      <Button type="submit" variant="destructive" size="sm" onClick={() => onDelete?.(id)}>
        Delete
      </Button>
    </div>
  );
}
