"use client"

import { memo } from "react"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/_components/ui/Alert-dialog"
import { Textarea } from "@/_components/ui/Textarea"
import { Loader } from "lucide-react"

function RequestRejectedAlert({ open, onOpenChange, rejectReason, setRejectReason, isLoading, onConfirmReject }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent variant="danger">
        <AlertDialogHeader>
          <AlertDialogTitle variant="danger">Reject Request</AlertDialogTitle>
          <AlertDialogDescription>
            Please provide a reason for rejecting this request.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Type the reason for rejection..."
          className="min-h-[100px]"
        />

        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={() => { onOpenChange(false)
              setRejectReason("")
            }}
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction onClick={onConfirmReject} disabled={!rejectReason.trim() || isLoading}>
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Reject Request
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default memo(RequestRejectedAlert)
