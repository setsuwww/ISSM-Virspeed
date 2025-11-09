"use client"

import React, { useMemo } from "react";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";

import ScheduleActionsButtons from "./SchedulesActionButton";
import { TableRow, TableCell } from "@/_components/ui/Table";
import { Checkbox } from "@/_components/ui/Checkbox";

import { capitalize } from "@/_function/globalFunction";
import { frequencyStyles } from "@/_constants/scheduleConstants";

export const SchedulesRow = React.memo(function ({ schedule, isSelected, onSelect, onEdit, onDelete }) {

  const formatedUpdatedDate = useMemo(() => format(new Date(schedule.updatedAt), "dd-MMMM-yyyy"), [schedule.updatedAt])
  const formatedCreatedDate = useMemo(() => format(new Date(schedule.createdAt), "dd-MMMM-yyyy"), [schedule.createdAt])

  return (
    <TableRow>
      <TableCell>
        <Checkbox checked={isSelected} onCheckedChange={(checked) => onSelect(schedule.id, checked === true)} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-x-2">
          <div className={`p-2 rounded-md ${frequencyStyles[capitalize(schedule.frequency)]}`}>
            <CalendarClock strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-x-2">
            <h1 className="text-sm font-semibold text-slate-600">
              {capitalize(schedule.title)}
            </h1>
            <p className="text-xs text-slate-400">
              {capitalize(schedule.shift ? schedule.shift.type : "-")}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <p className="max-w-2xs break-words whitespace-pre-wrap">
          {schedule.description}
        </p>
      </TableCell>
      <TableCell>
        <div className="text-sm font-semibold flex flex-col">
          <span className="text-teal-500">{schedule.startDate && ` ${format(new Date(schedule.startDate), "dd-MMMM-yyyy HH:mm:ss")}`}</span>
          <span className="text-rose-500">{schedule.endDate && ` ${format(new Date(schedule.endDate), "dd-MMMM-yyyy HH:mm:ss")}`}</span>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="text-sm font-semibold text-slate-600">
            {formatedCreatedDate}
          </div>
          <div className="text-xs text-slate-400">
            {formatedUpdatedDate}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <ScheduleActionsButtons id={schedule.id} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  );
})
