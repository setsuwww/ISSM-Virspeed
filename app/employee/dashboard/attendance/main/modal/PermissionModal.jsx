import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/_components/ui/Dialog"
import { Button } from "@/_components/ui/Button"
import { Label } from "@/_components/ui/Label"

export function PermissionModal({
  open, loading,
  reason, onChangeReason,
  onClose, onSubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" variant="blue">
        <DialogHeader>
          <DialogTitle>Permission</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Label>Reason <span className="text-rose-500">*</span></Label>
          <textarea
            value={reason}
            onChange={(e) => onChangeReason(e.target.value)}
            className="w-full min-h-[90px] rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100"
            placeholder="Explain your reason"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!reason.trim() || loading}
            onClick={onSubmit}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
