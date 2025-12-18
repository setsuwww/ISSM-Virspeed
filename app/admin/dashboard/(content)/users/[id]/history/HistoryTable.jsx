"use client";

import { Badge } from "@/_components/ui/Badge";
import { Checkbox } from "@/_components/ui/Checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/_components/ui/Table";

import { attedancesStyles } from "@/_constants/attendanceConstants";
import { shiftDots } from "@/_constants/shiftConstants";
import { capitalize } from "@/_function/globalFunction";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Clock, ClipboardClock } from "lucide-react";

import HistoryActionHeader from "./HistoryActionHeader";
import { useUserAttendanceHistoryHooks } from "@/_client/hooks/useUserAttendanceHistoryHooks";

export default function UserHistoryTable({ history }) {
  const {
    search,
    setSearch,

    filteredData,
    selectedIds,

    toggleSelect,
    toggleSelectAll,

    removeSelected,
    removeAll,
    exportData,
  } = useUserAttendanceHistoryHooks(history);

  const allIds = filteredData.map((h) => h.id);
  const isAllSelected =
    allIds.length > 0 && selectedIds.length === allIds.length;

  return (
    <div className="space-y-4">
      {/* ACTION HEADER */}
      <HistoryActionHeader
        search={search}
        onSearchChange={setSearch}
        selectedCount={selectedIds.length}
        onExport={() => exportData(filteredData)}
        onRemoveSelected={removeSelected}
        onRemoveAll={removeAll}
      />

      {/* TABLE */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(v) => toggleSelectAll(v, allIds)}
              />
            </TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Shift</TableHead>
            <TableHead>Check In</TableHead>
            <TableHead>Check Out</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData.map((h) => (
            <TableRow key={h.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(h.id)}
                  onCheckedChange={() => toggleSelect(h.id)}
                />
              </TableCell>

              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className="bg-slate-200 p-2 rounded-full">
                    <ClipboardClock className="h-5 w-5 text-slate-600" />
                  </div>
                  <span className="flex flex-col">
                    <span className="font-semibold text-slate-600">
                      {h.day}
                    </span>
                    <span className="text-sm text-slate-400">
                      {h.dmy}
                    </span>
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center space-x-3">
                  {shiftDots[h.shift?.type]}
                  <span>
                    <div className="text-sm font-semibold text-slate-600">
                      {capitalize(h.shift?.type) ?? "-"}
                    </div>
                    <div className="text-xs text-slate-400">
                      {h.shift?.startTime} - {h.shift?.endTime}
                    </div>
                  </span>
                </div>
              </TableCell>

              <TableCell>
                {h.checkInTime ? (
                  <div className="flex items-center gap-2 text-teal-600">
                    <Clock className="h-4 w-4" />
                    {format(new Date(h.checkInTime), "HH:mm", { locale: id })}
                  </div>
                ) : "-"}
              </TableCell>

              <TableCell>
                {h.checkOutTime ? (
                  <div className="flex items-center gap-2 text-rose-600">
                    <Clock className="h-4 w-4" />
                    {format(new Date(h.checkOutTime), "HH:mm", { locale: id })}
                  </div>
                ) : "-"}
              </TableCell>

              <TableCell>
                <Badge className={attedancesStyles[h.status]}>
                  {capitalize(h.status)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
