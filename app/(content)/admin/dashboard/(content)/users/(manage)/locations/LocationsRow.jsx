"use client"

import { memo } from "react"

import { Building2, RefreshCcw } from "lucide-react"
import { format } from "date-fns"

import { TableRow, TableCell } from "@/_components/ui/Table"
import { Checkbox } from "@/_components/ui/Checkbox"
import { Badge } from "@/_components/ui/Badge"

import { locationStyles } from "@/_components/_constants/theme/locationTheme"
import LocationsStatusBadge from "./LocationsStatusBadge"
import LocationActionButton from "./LocationsActionButton"

function LocationRow({
  location, isSelected,
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
            <p className="text-sm font-semibold text-slate-600">{location.name}</p>
            <p className="text-xs text-slate-400">{location.location}</p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <Badge variant="outline" role="button" onClick={() => onToggleType(location)}
          className={`flex cursor-pointer items-center gap-1 transition hover:opacity-80 ${locationStyles[location.type]}`}
        >
          <span>{location.type}</span>
          <RefreshCcw className="h-3.5 w-3.5" />
        </Badge>

      </TableCell>

      <TableCell>
        <LocationsStatusBadge
          status={location.status}
          onToggle={() => onToggleStatus(location)}
        />
      </TableCell>

      <TableCell>
        <span className="text-slate-600">
          {location.startTime && location.endTime ? `${location.startTime} - ${location.endTime}` : "-"}
        </span>
      </TableCell>

      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-600">
            {format(new Date(location.createdAt), "dd MMMM yyyy")}
          </span>
          <span className="text-xs text-slate-400">
            {format(new Date(location.updatedAt), "dd MMMM yyyy")}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <LocationActionButton
          onEdit={() => onEdit(location.id)}
          onDelete={() => onDelete(location.id)}
        />
      </TableCell>
    </TableRow>
  )
}

export default memo(LocationRow)
