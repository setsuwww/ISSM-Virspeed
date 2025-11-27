"use client"

import { Badge } from "@/_components/ui/Badge"
import { capitalize } from "@/_function/globalFunction"
import { shiftStyles } from "@/_constants/shiftConstants"

export default function RenderShiftInfo({
  requestType,
  typeShift,
  info,
  oldShift,
  targetShift,
}) {
  if (requestType === "permission") {
    return (
      <Badge
        className={`border-none px-3 py-1 text-xs font-medium ${
          shiftStyles[typeShift] || "bg-slate-100 text-slate-600"
        }`}
      >
        {capitalize(info)}
      </Badge>
    )
  }

  return (
    <div className="flex flex-col items-start justify-start gap-1 text-left">
      <div className="flex items-center space-x-1">
        <span className="font-semibold text-teal-400">From :</span>
        <Badge
          className={`border-none px-2 py-0.5 text-xs font-medium ${
            shiftStyles[oldShift?.type] || "bg-slate-100 text-slate-700"
          }`}
        >
          {oldShift?.name || "-"}
        </Badge>
      </div>
      <div className="flex items-center space-x-1">
        <span className="font-semibold text-rose-400">To :</span>
        <Badge
          className={`border-none px-2 py-0.5 text-xs font-medium ${
            shiftStyles[targetShift?.type] || "bg-slate-100 text-slate-700"
          }`}
        >
          {targetShift?.name || "-"}
        </Badge>
      </div>
    </div>
  )
}
