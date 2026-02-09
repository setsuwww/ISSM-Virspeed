"use client"

import { memo } from "react"

import { Building2, RefreshCcw } from "lucide-react"
import { format } from "date-fns"

import { TableRow, TableCell } from "@/_components/ui/Table"
import { Checkbox } from "@/_components/ui/Checkbox"
import { Badge } from "@/_components/ui/Badge"

import { divisionStyles } from "@/_constants/themes/divisionTheme"
import DivisionsStatusBadge from "./DivisionsStatusBadge"
import DivisionActionButton from "./DivisionsActionButton"

function DivisionRow({
  division, isSelected,
  onSelect, onToggleStatus, onToggleType,

  onEdit,
  onDelete,
}) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox checked={isSelected} onCheckedChange={onSelect} />
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-3">
          <div className="icon-parent">
            <Building2 className="icon" strokeWidth={1} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">{division.name}</p>
            <p className="text-xs text-slate-400">{division.location}</p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <Badge variant="outline" role="button" onClick={() => onToggleType(division)}
          className={`flex cursor-pointer items-center gap-1 transition hover:opacity-80 ${divisionStyles[division.type]}`}
        >
          <span>{division.type}</span>
          <RefreshCcw className="h-3.5 w-3.5" />
        </Badge>

      </TableCell>

      <TableCell>
        <DivisionsStatusBadge
          status={division.status}
          onToggle={() => onToggleStatus(division)}
        />
      </TableCell>

      <TableCell>
        <span className="text-slate-600">
          {division.startTime && division.endTime ? `${division.startTime} - ${division.endTime}` : "-"}
        </span>
      </TableCell>

      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-600">
            {format(new Date(division.createdAt), "dd MMMM yyyy")}
          </span>
          <span className="text-xs text-slate-400">
            {format(new Date(division.updatedAt), "dd MMMM yyyy")}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <DivisionActionButton
          onEdit={() => onEdit(division.id)}
          onDelete={() => onDelete(division.id)}
        />
      </TableCell>
    </TableRow>
  )
}

export default memo(DivisionRow)
