"use client"

import { CircleUserRound } from "lucide-react"

import { TableCell } from "@/_components/ui/Table"
import { capitalize, wordsLimit } from "@/_function/globalFunction"

import RequestStatusChangerToggle from "../RequestStatusChanger"
import { shiftDots } from "@/_constants/shiftConstants"

export default function RenderPermission({ r }) {
  return (
    <>
      <TableCell>
        <div className="flex items-center gap-3">
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
        <div className="flex items-center space-x-3">
          {shiftDots[r.shift?.type]}

          <div className="flex flex-col text-sm text-slate-600">
            <p className="font-semibold">{capitalize(r.shift?.type)}</p>

            <p className="text-xs text-slate-400">
              <span>{r.workHours.label}</span>
            </p>
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
          status={r.approval ?? "PENDING"}
          type="PERMISSION"
          disabled={false}
        />
      </TableCell>
    </>
  )
}
