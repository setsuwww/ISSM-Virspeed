"use client"

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { TableRow, TableCell } from "@/_components/ui/Table"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/_components/ui/Dialog"
import { toast } from "sonner"

import RequestStatusChangerToggle from "./RequestStatusChangerToggle"
import RequestRejectedAlert from "./RequestRejectedAlert"
import RenderUserInfo from "./element/renderUserInfo"
import RenderShiftInfo from "./element/renderShiftInfo"
import { updateShiftChangeRequestStatus, updatePermissionStatus } from "@/_server/shiftAction"

export default function RequestsTableRow({
  id, requestedBy, user,
  oldShift, targetShift,
  info, reason, status,
  date, startDate, endDate,
  requestType, typeShift,
}) {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState(status)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const actualId = useMemo(() => {
    const clean = id?.replace(/^(shift-|perm-)/, "")
    return clean && !isNaN(clean) ? Number(clean) : null
  }, [id])

  const handleStatusChange = useCallback(
    async (newStatus, reason = null) => {
      if (!actualId) return
      setIsLoading(true)
      try { const res = requestType === "shift"
            ? await updateShiftChangeRequestStatus(actualId, newStatus, reason)
              : await updatePermissionStatus(actualId, newStatus, reason)

        if (res?.success) { setCurrentStatus(newStatus)
          toast.success(`Request ${newStatus.toLowerCase()} successfully`)
          router.refresh()
        } 
        else { toast.error(res?.message || "Failed to update request")}
      } 
      catch (err) { toast.error("An error occurred while updating the request")} 
      finally { setIsLoading(false)}
    },
    [actualId, router, requestType]
  )

  const handleReject = useCallback(() => {
    if (!rejectReason.trim()) return
    handleStatusChange("REJECTED", rejectReason)
    setShowRejectDialog(false)
    setRejectReason("")
  }, [rejectReason, handleStatusChange])

  return (
    <>
      <TableRow>
        <TableCell>
          <RenderUserInfo person={requestedBy} />
        </TableCell>

        {requestType === "shift" && (
          <TableCell>
            <RenderUserInfo person={user} />
          </TableCell>
        )}

        <TableCell className="max-w-xs">
          <RenderShiftInfo
            requestType={requestType}
            typeShift={typeShift}
            info={info}
            oldShift={oldShift}
            targetShift={targetShift}
          />
        </TableCell>

        <TableCell className="max-w-[120px]">
          {reason ? (
            <Dialog>
              <DialogTrigger asChild>
                <div className="text-left">
                  <p className="line-clamp-3 text-sm text-slate-400 cursor-pointer">
                    {reason}
                  </p>
                  <span className="text-xs text-sky-500 hover:underline cursor-pointer">
                    Read more
                  </span>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Reason detail</DialogTitle>
                  <DialogDescription asChild>
                    <p className="whitespace-pre-wrap text-slate-600 mt-2">
                      {reason}
                    </p>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ) : (
            <span className="text-sm text-slate-400">-</span>
          )}
        </TableCell>

        <TableCell>
          <RequestStatusChangerToggle
            status={currentStatus}
            requestId={actualId}
            disabled={isLoading}
            onReject={() => setShowRejectDialog(true)}
            onStatusChange={(newStatus) => handleStatusChange(newStatus)}
          />
        </TableCell>

        <TableCell className="text-slate-400 whitespace-nowrap text-sm">
          {requestType === "shift" ? (
            <div>
              <p className="text-teal-500">{startDate || "-"}</p>
              <p className="text-rose-500">{endDate || "-"}</p>
            </div>
          ) : (
            date || "-"
          )}
        </TableCell>
      </TableRow>

      <RequestRejectedAlert
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        isLoading={isLoading}
        onConfirmReject={handleReject}
      />
    </>
  )
}
