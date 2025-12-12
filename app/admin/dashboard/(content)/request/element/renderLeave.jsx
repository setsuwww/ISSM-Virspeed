"use client"

import { CircleUserRound } from "lucide-react"

import { TableCell } from "@/_components/ui/Table"
import RequestStatusChangerToggle from "../RequestStatusChanger"
import { capitalize, wordsLimit } from "@/_function/globalFunction"

export default function RenderLeave({ r, onStatusChange, onReject }) {
  return (
    <>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="bg-slate-200 p-2 rounded-full">
            <CircleUserRound className="h-5 w-5 text-slate-600" strokeWidth={1} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-600">
              {r.requestedBy?.name}
            </p>
            <p className="text-xs text-slate-400">{r.requestedBy?.email}</p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="text-sm font-semibold text-slate-600">
          {capitalize(r.shift?.name)}
        </div>
        <div className="text-xs text-slate-400">
          {r.workHours?.label}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col space-y-1 py-0.5">
          <div className="flex items-center space-x-2">
            <span className="font-base text-slate-400">From</span><span className="bg-green-50/50 text-green-600 px-2 border border-green-200/50 rounded-md">{r.startDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-base text-slate-400">To</span><span className="bg-red-50/50 text-red-600 px-2 border border-red-100/50 rounded-md">{r.endDate}</span>
          </div>
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
          requestId={r.id}
          status={r.status}
          disabled={false}
          onReject={() => onReject?.(r.id)}
          onStatusChange={(newStatus) => onStatusChange?.(r.id, newStatus)}
        />
      </TableCell>
    </>
  )
}
