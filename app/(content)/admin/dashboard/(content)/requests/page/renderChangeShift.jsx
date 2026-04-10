"use client"

import { CircleUserRound } from "lucide-react"

import { TableCell } from "@/_components/ui/Table"
import { capitalize, wordsLimit } from "@/_functions/globalFunction"
import { shiftStyles } from "@/_constants/shiftConstants"

import RequestStatusChangerToggle from "../RequestStatusChanger"

export default function RenderChangeShift({ r }) {
  return (
    <>
      <TableCell>
        <div className="flex items-center gap-3 py-2">
          <div className="icon-parent">
            <CircleUserRound className="icon" strokeWidth={1} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">{r.requestedBy?.name}</p>
            <p className="text-xs text-slate-400">{r.requestedBy?.email}</p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-3 py-2">
          <div className="bg-slate-200 p-2 rounded-full">
            <CircleUserRound className="icon" strokeWidth={1} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">{r.user?.name}</p>
            <p className="text-xs text-slate-400">{r.user?.email}</p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-base text-slate-400">From</span><span className={`${shiftStyles[r.oldShift?.type]} px-2 border rounded-md`}>{r.oldShift?.type}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-base text-slate-400">To</span><span className={`${shiftStyles[r.targetShift?.type]} px-2 border rounded-md`}>{r.targetShift?.type}</span>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <span className="font-base text-slate-400">From</span><span className="bg-green-50/50 text-green-600 px-2 border border-green-200/50 rounded-md">{r.startDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-base text-slate-400">To</span><span className="bg-red-50/50 text-red-600 px-2 border border-red-100/50 rounded-md">{r.endDate}</span>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="max-w-xs text-sm text-slate-600 leading-relaxed">{wordsLimit(r.reason, 5)}</div>
      </TableCell>

      <TableCell>
        <RequestStatusChangerToggle
          id={r.id}
          status={r.status ?? "PENDING"}
          type="CHANGE-SHIFT"
          disabled={false}
        />
      </TableCell>
    </>
  )
}
