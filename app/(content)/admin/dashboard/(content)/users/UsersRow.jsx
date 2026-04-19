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
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-600">{user.name}</p>
              <Badge variant="outline" className="px-1.5 py-0 text-[10px] text-slate-500 uppercase flex items-center gap-1.5 font-medium border-slate-200">
                <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
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
