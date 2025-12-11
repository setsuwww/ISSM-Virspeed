"use client"

import React, { useMemo } from "react"
import { CircleUserRound } from "lucide-react"
import { format } from "date-fns"

import { TableCell, TableRow } from "@/_components/ui/Table"
import { Checkbox } from "@/_components/ui/Checkbox"
import { Badge } from "@/_components/ui/Badge"

import { LockedAction, UsersActionButton } from "./UsersActionButton"

export const UsersRow = React.memo(function UsersRow({ user, isSelected, onToggleSelect, onEdit, onDelete, roleStyles }) {
  const handleToggle = () => onToggleSelect(user.id)
  const formatedCreatedDate = useMemo(() => format(new Date(user.createdAt), "dd MMMM yyyy"), [user.createdAt])
  const formatedUpdatedDate = useMemo(() => format(new Date(user.updatedAt), "dd MMMM yyyy"), [user.updatedAt])

  return (
    <TableRow>
      <TableCell>
        <Checkbox checked={isSelected} onCheckedChange={handleToggle} />
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-3">
          <div className="bg-slate-200 p-2 rounded-full">
            <CircleUserRound className="h-5 w-5 text-slate-600" strokeWidth={1} />
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
              {user.shift ?? "OFF"}
            </span>
            <span className="text-xs text-slate-400">
              {user.shiftTime ?? "OFF"}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell className="flex flex-col">
        <span className="text-sm font-semibold text-slate-600">{formatedCreatedDate}</span>
        <span className="text-xs text-slate-400">{formatedUpdatedDate}</span>
      </TableCell>

      <TableCell>
        {user.isActionLocked 
          ? (<LockedAction />) 
          : (<UsersActionButton userId={user.id} onEdit={onEdit} onDelete={onDelete}/>)
        }
      </TableCell>
    </TableRow>
  )
})
