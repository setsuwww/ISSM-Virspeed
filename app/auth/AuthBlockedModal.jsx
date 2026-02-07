"use client"

import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/_components/ui/Dialog"
import { Button } from "@/_components/ui/Button"

export function AuthBlockedModal({ open, onOpenChange, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" variant="warning">
        <DialogHeader>
          <DialogTitle>Account Blocked</DialogTitle>
          <DialogDescription>
            Your account has been blocked by the administrator.
            <br />
            Please contact support for assistance or try again later.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="destructive" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
