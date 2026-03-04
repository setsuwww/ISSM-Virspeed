"use client"

import { memo } from "react"
import { CircleUserRound } from "lucide-react"

import { TableCell, TableRow } from "@/_components/ui/Table"
import { Checkbox } from "@/_components/ui/Checkbox"
import { Badge } from "@/_components/ui/Badge"

import UsersActionButton, { LockedAction } from "./UsersActionButton"

function UsersRow({ user, isSelected, onToggleSelect, onEdit, onDelete, roleStyles }) {
  return (
    <TableRow>
      <TableCell>
        <Checkbox checked={isSelected} onCheckedChange={() => onToggleSelect(user.id)} />
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-3">
          <div className="icon-parent">
            <CircleUserRound className="icon" strokeWidth={1} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <Badge variant="outline" className={`${roleStyles[user.role] || ""} px-2 py-0.5 text-xs font-semibold`}>
          {user.role}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-600">
              {user.shift}
            </span>
            <span className="text-xs text-slate-400">
              {user.shiftTime}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell className="flex flex-col">
        <span className="text-sm font-semibold text-slate-600">{user.createdAt}</span>
        <span className="text-xs text-slate-400">{user.updatedAt}</span>
      </TableCell>

      <TableCell>
        {user.isActionLocked
          ? (<LockedAction />)
          : (<UsersActionButton userId={user.id} onEdit={onEdit} onDelete={onDelete} />)
        }
      </TableCell>
    </TableRow>
  )
}

export default memo(UsersRow)
