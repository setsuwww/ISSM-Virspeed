"use client"

import { useState, useTransition } from "react"
import { CheckCircle, XCircle } from "phosphor-react"
import { CircleUserRound } from "lucide-react"

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/_components/ui/Table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/_components/ui/Dialog"
import { Button } from "@/_components/ui/Button"
import { Badge } from "@/_components/ui/Badge"
import ContentForm from "@/_components/common/ContentForm"
import { ContentInformation } from "@/_components/common/ContentInformation"

import { shiftStyles } from "@/_constants/shiftConstants"
import { attendancesStyles } from "@/_constants/theme/attendanceTheme"
import { getAttendanceStatus, normalizePendingStatus } from "@/_constants/attendanceConstants"

import { updateShiftChangeStatus } from "@/_servers/admin-services/shift_action"
import { wordsLimit } from "@/_functions/globalFunction"

export default function ChangeShiftTable({ requests = [], currentUserId }) {
  const [isPending, startTransition] = useTransition()
  const [rows, setRows] = useState(requests)

  const handleAction = (id, action) => {
    startTransition(async () => {
      await updateShiftChangeStatus(id, action, "TARGET")
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, status: action === "ACCEPT" ? "PENDING_ADMIN" : "REJECTED" } : r))
    })
  }
  const filtered = rows.filter((r) => r.targetUserId === currentUserId && r.status === "PENDING_TARGET")

  return (
    <div className="rounded-md overflow-hidden">
      <ContentForm>
        <ContentForm.Header>
          <ContentInformation title="Shift Change page" subtitle="Send a request for shift change every employee" />
        </ContentForm.Header>

        <ContentForm.Body>
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Requester</TableHead>
                <TableHead>From → To</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-400 italic">
                    No incoming shift change requests.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((req) => (
                  <TableRow key={req.id} className="transition-colors duration-150">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="icon-parent">
                          <CircleUserRound className="icon" strokeWidth={1} />
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">
                            {req.user?.name || "Unknown"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {req.user?.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <Badge className={`text-sm border-none px-3 py-1 ${shiftStyles[req.oldShift?.type]}`}>
                            {req.oldShift?.name || "-"}
                          </Badge>
                        </div>

                        <span className="text-xs text-gray-500 px-1">→</span>

                        <div className="flex flex-col">
                          <Badge className={`text-sm border-none px-3 py-1 ${shiftStyles[req.targetShift?.type]}`}>
                            {req.targetShift?.name || "-"}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="line-clamp-3 truncate text-sm text-slate-500 cursor-pointer hover:underline" title={req.reason}>
                            {wordsLimit(req.reason || "-", 3)}
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Message</DialogTitle>
                          </DialogHeader>
                          <p className="text-sm max-x-xs">
                            {req.reason || "No reason provided."}
                          </p>
                        </DialogContent>
                      </Dialog>
                    </TableCell>

                    <TableCell>
                      <Badge className={attendancesStyles[normalizePendingStatus(req.status)]}>
                        {getAttendanceStatus(req.status)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleAction(req.id, "ACCEPT")}
                          className="text-sm text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100"
                        >
                          <CheckCircle size={32} color="#009689" weight="duotone" />
                          Accept
                        </Button>

                        <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleAction(req.id, "REJECT")}
                          className="text-sm text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-100"
                        >
                          <XCircle size={32} color="#ec003f" weight="duotone" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ContentForm.Body>
      </ContentForm>
    </div>
  )
}
