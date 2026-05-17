"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table";
import { Badge } from "@/_components/ui/Badge";
import { Button } from "@/_components/ui/Button";
import Link from "next/link";
import { CircleUserRound } from "lucide-react";

export function MonthlyReportTable({ data, month, year }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-slate-600">No report data found</p>
        <p className="text-sm text-slate-500">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-slate-200 overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User Name</TableHead>
            <TableHead className="text-center">Present</TableHead>
            <TableHead className="text-center">Late</TableHead>
            <TableHead className="text-center">Permission</TableHead>
            <TableHead className="text-center">Leave</TableHead>
            <TableHead className="text-center">Early Checkout</TableHead>
            <TableHead className="text-center">Absent</TableHead>
            <TableHead className="text-center">Total Work-Hour</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="icon-parent">
                    <CircleUserRound className="icon" strokeWidth={1} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-600">
                        {row.name}
                      </span>
                      <Badge variant="outline" className="px-1.5 py-0 text-[10px] text-slate-500 uppercase flex items-center gap-1.5 font-medium border-slate-200">
                        <span className={`h-1.5 w-1.5 rounded-full ${row.isActive ? "bg-emerald-500" : "bg-red-500"}`}></span>
                        {row.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400">{row.email}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center border border-slate-300">
                <span className="font-semibold text-[16px] text-emerald-600">
                  {row.present}
                </span>
              </TableCell>
              <TableCell className="text-center border border-slate-300">
                <span className="font-semibold text-[16px] text-yellow-600">
                  {row.late}
                </span>
              </TableCell>
              <TableCell className="text-center border border-slate-300">
                <span className="font-semibold text-[16px] text-blue-600">
                  {row.permission}
                </span>
              </TableCell>
              <TableCell className="text-center border border-slate-300">
                <span className="font-semibold text-[16px] text-purple-600">
                  {row.leave}
                </span>
              </TableCell>
              <TableCell className="text-center border border-slate-300">
                <span className="font-semibold text-[16px] text-orange-600">
                  {row.earlyCheckout}
                </span>
              </TableCell>
              <TableCell className="text-center border border-slate-300">
                <span className="font-semibold text-[16px] text-red-600">
                  {row.absent}
                </span>
              </TableCell>
              <TableCell className="text-center font-semibold text-slate-700">
                {row.totalWorkingHours}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/dashboard/shifts/monthly-report/${row.id}?month=${month}&year=${year}`}>
                    Detail
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
