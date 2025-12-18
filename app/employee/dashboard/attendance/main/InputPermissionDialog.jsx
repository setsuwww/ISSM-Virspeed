import { Button } from "@/_components/ui/Button"
import { Label } from "@/_components/ui/Label"

export function InputPermissionDialog({
  reason,
  loading,
  onChangeReason,
  onCancel,
  onSubmit,
}) {
  return (
    <div className="border border-dashed border-blue-300 bg-blue-50/50 p-4 rounded-xl space-y-3">
      <Label>Reason <span className="text-rose-500">*</span></Label>

      <input
        value={reason}
        onChange={(e) => onChangeReason(e.target.value)}
        placeholder="Enter your reason"
        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100"
      />

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={onSubmit}
          disabled={!reason.trim() || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Submit
        </Button>
      </div>
    </div>
  )
}
