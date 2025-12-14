"use client"

import { CircleUserRound } from "lucide-react"
import { TableCell } from "@/_components/ui/Table"
import RequestStatusChangerToggle from "../RequestStatusChanger"
import { capitalize, wordsLimit } from "@/_function/globalFunction"

export default function RenderPermission({ r, onStatusChange, onReject }) {
  return (
    <>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="bg-slate-200 p-2 rounded-full">
            <CircleUserRound className="h-5 w-5 text-slate-600" strokeWidth={1} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">{r.requestedBy?.name}</p>
            <p className="text-xs text-slate-400">{r.requestedBy?.email}</p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="text-sm font-semibold text-slate-600">
          {capitalize(r.typeShift)}
        </div>
        <div className="text-xs text-slate-400">
          {r.workHours?.label}
        </div>
      </TableCell>

      <TableCell>
        <span className="bg-blue-50/50 text-blue-600 px-2 border border-blue-200/50 rounded-md text-xs">
          {r.date}
        </span>
      </TableCell>

      <TableCell>
        <div className="max-w-xs text-sm text-slate-600 leading-relaxed">
          {wordsLimit(r.reason, 5)}
        </div>
      </TableCell>

      <TableCell>
        <RequestStatusChangerToggle
          id={r.id}
          status={r.approval ?? "PENDING"}
          type="PERMISSION"
          disabled={false}
        />
      </TableCell>
    </>
  )
}
