import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/_components/ui/Dialog"
import { Button } from "@/_components/ui/Button"
import { AlertTriangle } from "lucide-react"

export function ConfirmEarlyModal({
  open,
  loading,
  onClose,
  onSubmit,
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" variant="warning">

        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle size={20} />
            <DialogTitle>Already Checkout?</DialogTitle>
          </div>
        </DialogHeader>

        <div className="text-sm text-slate-600">
          Shift hasn’t ended yet.
          Are you sure you want to submit a
          <br />
          <b>forgot checkout request</b>?
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Yes, Send Request"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}
