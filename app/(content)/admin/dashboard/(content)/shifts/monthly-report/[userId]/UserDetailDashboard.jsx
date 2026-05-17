"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/_components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table";
import { Badge } from "@/_components/ui/Badge";
import { getInitial } from "@/_functions/globalFunction";
import { Pie, PieChart, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/_components/ui/Chart";
import dayjs from "dayjs";
import { roleStyles } from "@/_components/_constants/theme/userTheme";

const chartConfig = {
  present: { label: "Present", color: "#10b981" },
  late: { label: "Late", color: "#facc15" },
  permission: { label: "Permission", color: "#60a5fa" },
  leave: { label: "Leave", color: "#8b5cf6" },
  earlyCheckout: { label: "Early Checkout", color: "#f97316" },
  absent: { label: "Absent", color: "#ef4444" },
};

export function UserDetailDashboard({ data, month, year }) {
  const { user, stats, dailyDetails } = data;

  const chartData = [
    { status: "present", value: stats.present, fill: chartConfig.present.color },
    { status: "late", value: stats.late, fill: chartConfig.late.color },
    { status: "permission", value: stats.permission, fill: chartConfig.permission.color },
    { status: "leave", value: stats.leave, fill: chartConfig.leave.color },
    { status: "earlyCheckout", value: stats.earlyCheckout, fill: chartConfig.earlyCheckout.color },
    { status: "absent", value: stats.absent, fill: chartConfig.absent.color },
  ].filter(d => d.value > 0);

  const formatStatus = (status) => {
    const map = {
      PRESENT: { label: "Present", style: "bg-emerald-50 text-emerald-600 border-emerald-200" },
      LATE: { label: "Late", style: "bg-yellow-50 text-yellow-600 border-yellow-200" },
      PERMISSION: { label: "Permission", style: "bg-amber-50 text-amber-600 border-amber-200" },
      LEAVE: { label: "Leave", style: "bg-purple-50 text-purple-600 border-purple-200" },
      EARLY_CHECKOUT: { label: "Early Checkout", style: "bg-orange-50 text-orange-600 border-orange-200" },
      ABSENT: { label: "Absent", style: "bg-red-50 text-red-600 border-red-200" },
    };
    return map[status] || { label: status, style: "bg-gray-50 text-gray-600 border-gray-200" };
  };

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: User Info */}
        <div className="rounded-lg border border-slate-300 shadow-sm rounded-lg p-6">
          <div className="flex flex-col items-center justify-center text-center gap-6">
            <div className="h-24 w-24 rounded-full bg-sky-700 flex items-center justify-center text-3xl font-bold text-sky-50 shadow-sm border-2 border-white outline-4 outline-sky-600 outline">
              {getInitial(user.name)}
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-800">
                {user.name}
              </h3>

              <p className="text-sm text-slate-500">
                {user.email}
              </p>

              <div className="flex justify-center gap-2 mt-1">
                <Badge variant="outline" className={roleStyles[user.role]}>
                  {user.role}
                </Badge>

                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-sky-100">
                  {user.department}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary Stats */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Working Hours Summary</CardTitle>
            <CardDescription>Total calculated hours for {dayjs(`${year}-${month}-01`).format('MMMM YYYY')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                <span className="text-sm font-medium text-slate-500">Total Hours</span>
                <span className="text-3xl font-bold text-slate-800 mt-1">{stats.totalWorkingHours}</span>
              </div>
              <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                <span className="text-sm font-medium text-slate-500">Working Days</span>
                <span className="text-3xl font-bold text-slate-800 mt-1">{stats.workingDays}</span>
              </div>
              <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 flex flex-col items-center text-center">
                <span className="text-sm font-medium text-slate-500">Avg / Day</span>
                <span className="text-3xl font-bold text-slate-800 mt-1">{stats.averageWorkingHours}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
            <CardDescription>Visual breakdown of monthly attendance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center items-center">
            {chartData.length > 0 ? (
              <ChartContainer
                config={chartConfig}
                className="aspect-square max-h-[300px] w-full"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="status"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} className="transition-all hover:opacity-80" />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="status" />}
                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/3 [&>*]:justify-center"
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No attendance data to display
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Detail Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Details</CardTitle>
            <CardDescription>Breakdown of attendance per day</CardDescription>
          </CardHeader>
          <div className="px-0 sm:px-6 pb-6">
            <div className="rounded-md border border-slate-200 overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead className="text-center">Check-in</TableHead>
                    <TableHead className="text-center">Check-out</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Break</TableHead>
                    <TableHead className="text-center">Final</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyDetails.length > 0 ? (
                    dailyDetails.map((row) => {
                      const stat = formatStatus(row.status);
                      return (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">
                            {dayjs(row.date).format('DD MMM YYYY')}
                          </TableCell>
                          <TableCell>{row.shift}</TableCell>
                          <TableCell className="text-center">
                            {row.checkin ? dayjs(row.checkin).format('HH:mm') : '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.checkout ? dayjs(row.checkout).format('HH:mm') : '-'}
                          </TableCell>
                          <TableCell className="text-center text-slate-500">{row.totalJam}</TableCell>
                          <TableCell className="text-center text-slate-500">{row.break}</TableCell>
                          <TableCell className="text-center font-semibold text-slate-700">{row.finalWorkingHours}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={stat.style}>
                              {stat.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-slate-500">
                        No daily records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
