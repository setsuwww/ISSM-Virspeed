"use client"

import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/_components/ui/Dialog"
import { Button } from "@/_components/ui/Button"

export function LogConfirmDialog({ open, onOpenChange, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="danger" size="md">
        <DialogHeader>
          <DialogTitle>
            Clear all activity logs?
          </DialogTitle>

          <DialogDescription>
            This action will permanently delete <b>all logs</b>.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            Yes, clear logs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
