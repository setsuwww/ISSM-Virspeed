"use client";

import React from "react";
import { CircleUserRound, Globe } from "lucide-react";
import { format } from "date-fns";

import { TableRow, TableCell } from "@/_components/ui/Table";
import { Checkbox } from "@/_components/ui/Checkbox";
import { Badge } from "@/_components/ui/Badge";
import { EmployeesActionButton } from "../EmployeesActionButton";

export const EmployeesRow = React.memo(
  function EmployeesRow({
    user, selected, toggleSelect, onHistory, onEdit, onDelete,
  }) {
    return (
      <TableRow key={user.id}>
        <TableCell>
          <Checkbox
            checked={selected.includes(user.id)}
            onCheckedChange={() => toggleSelect(user.id)}
          />
        </TableCell>

        <TableCell>
          <div className="flex items-center gap-3">
            <div className="icon-parent">
              <CircleUserRound className="icon" strokeWidth={1} />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-600">
                  {user.name}
                </span>
                <Badge variant="outline" className="px-1.5 py-0 text-[10px] text-slate-500 uppercase flex items-center gap-1.5 font-medium border-slate-200">
                  <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-red-500"}`}></span>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <span className="text-xs text-slate-400">
                {user.email}
              </span>
            </div>
          </div>
        </TableCell>

        <TableCell>
          <div className="flex items-center space-x-3">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full rounded-full opacity-20 scale-175 bg-emerald-500"
              ></span>
              <span
                className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"
              ></span>
            </span>

            <div className="flex flex-col text-sm text-slate-600">
              <p className="font-semibold">Normal Hours</p>
              <p className="text-xs text-slate-400">
                {user.workHours.startTime} - {user.workHours.endTime}
              </p>
            </div>
          </div>
        </TableCell>

        <TableCell>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">
            <Globe />
            {user.location?.name}
          </Badge>
        </TableCell>

        <TableCell>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-600">
              {format(new Date(user.createdAt), "dd MMMM yyyy")}
            </span>
            <span className="text-xs text-slate-400">
              {format(new Date(user.updatedAt), "dd MMMM yyyy")}
            </span>
          </div>
        </TableCell>

        <TableCell>
          <EmployeesActionButton mode="work-hours"
            onHistory={onHistory} onEdit={onEdit} onDelete={onDelete}
          />
        </TableCell>
      </TableRow>
    );
  }
);
