import { Button } from "@/_components/ui/Button"

export default function LocationActionButton({ onEdit, onDelete }) {
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={onEdit}>
        Edit
      </Button>
      <Button size="sm" variant="destructive" onClick={onDelete}>
        Delete
      </Button>
    </div>
  )
}
