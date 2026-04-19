"use client"

import { CircleUserRound } from "lucide-react"

import { TableCell } from "@/_components/ui/Table"
import { capitalize, wordsLimit } from "@/_functions/globalFunction"
import { shiftDots } from "@/_constants/shiftConstants"

import RequestStatusChangerToggle from "../RequestStatusChanger"

export default function RenderLeave({ r }) {
  return (
    <>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="icon-parent">
            <CircleUserRound className="icon" strokeWidth={1} />
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
        <div className="flex flex-col mb-1">
          <span className="font-semibold text-violet-600 bg-violet-50 w-max px-2 py-0.5 rounded-md text-xs mb-1">
            {r.leave?.name ?? "Unknown Leave"}
          </span>
          {r.shift ? (
            <div className="flex items-center space-x-1.5 mt-1">
              {shiftDots[r.shift.type]}
              <span className="text-[11px] text-slate-400 font-medium">
                {r.shift.name} ({r.workHours.label})
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 mt-1">No shift</span>
          )}
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
        <div className="max-w-xs text-sm text-slate-600 leading-relaxed">
          {wordsLimit(r.reason, 5)}
        </div>
      </TableCell>

      <TableCell>
        <span className="bg-blue-50/50 text-blue-600 px-2 border border-blue-200/50 rounded-md text-sm">
          {r.date}
        </span>
      </TableCell>

      <TableCell>
        <RequestStatusChangerToggle
          id={r.id}
          status={r.status}
          type="LEAVE"
          disabled={false}
        />
      </TableCell>
    </>
  )
}
