"use client";

import { Badge } from "@/_components/ui/Badge";
import { Checkbox } from "@/_components/ui/Checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/_components/ui/Table";

import { attendancesStyles } from "@/_components/_constants/theme/attendanceTheme";
import { shiftDots } from "@/_components/_constants/shiftConstants";
import { capitalize } from "@/_functions/globalFunction";

import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { ClipboardClock } from "lucide-react";
import { Clock } from "phosphor-react";

import HistoryActionHeader from "./HistoryActionHeader";
import { useUserAttendanceHistoryHooks } from "@/_clients/hooks/admin/useUserAttendanceHistoryHooks";
import { cn } from "@/_lib/utils";

export default function UserHistoryTable({ history }) {
  const {
    search, setSearch,
    status, setStatus,
    sort, setSort,

    filteredData,
    selectedIds,

    toggleSelect,
    toggleSelectAll,
    removeSelected,
    removeAll,
  } = useUserAttendanceHistoryHooks(history);

  const allIds = filteredData.map((h) => h.id);
  const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;

  return (
    <div className="space-y-4">
      <HistoryActionHeader
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        sort={sort}
        onSortChange={setSort}
        filteredData={filteredData}
        selectedCount={selectedIds.length}
        onRemoveSelected={removeSelected}
        onRemoveAll={removeAll}
      />

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
            <TableHead>Status</TableHead>
            <TableHead>Check In - Check Out</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData.map((h) => {

            // 🔥 HANDLE LEAVE DULU
            if (h.type === "LEAVE") {
              return (
                <TableRow key={h.id} className="bg-yellow-50">
                  <TableCell colSpan={5}>
                    <div className="text-center text-yellow-700 font-semibold">
                      🏖 {h.label} — User is on {h.leaveType}
                    </div>
                  </TableCell>
                </TableRow>
              );
            }

            // 🔥 NORMAL ATTENDANCE
            return (
              <TableRow
                key={h.id}
                className={cn(
                  "border-b border-slate-200 transition-colors",
                  h.isToday && "ring-1 ring-blue-500 ring-inset"
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(h.id)}
                    onCheckedChange={() => toggleSelect(h.id)}
                  />
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="icon-parent">
                      <ClipboardClock className="icon" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-600">{h.day}</div>
                      <div className="text-sm text-slate-400">{h.dmy}</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3">
                    {shiftDots[h.shift?.type]}
                    <div>
                      <div className="text-sm font-semibold text-slate-600">
                        {capitalize(h.shift?.type) ?? "-"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {h.shift?.startTime} - {h.shift?.endTime}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge className={`${attendancesStyles[h.status]} bg-white border border-slate-300`}>
                    {h.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-3 font-number">
                    {h.checkInTime && (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <Clock size={16} />
                        {format(new Date(h.checkInTime), "hh:mm a", { locale: enUS })}
                      </span>
                    )}

                    <span>-</span>

                    {h.checkOutTime && (
                      <>
                        <span className="flex items-center gap-1 text-red-600">
                          <Clock size={16} />
                          {format(new Date(h.checkOutTime), "hh:mm a", { locale: enUS })}
                        </span>

                        {h.isEarlyCheckout && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded-full">
                            Early Checkout
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
