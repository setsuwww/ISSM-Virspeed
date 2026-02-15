import { prisma } from "@/_lib/prisma";
import { Clock, Sun, SunMoon, Moon, Zap, ChartNoAxesCombined } from "lucide-react";
import { ContentInformation } from "@/_components/common/ContentInformation";

import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats } from "./DashboardStats";

import AnalyticsDiagram from "./AnalyticsDiagram";
import FastActions from "./page-action";


export default async function AdminDashboardPage() {
  const totalUsers = await prisma.user.count();
  const morningEmployees = await prisma.user.count({ where: { shift: { type: "MORNING" } } });
  const afternoonEmployees = await prisma.user.count({ where: { shift: { type: "AFTERNOON" } } });
  const eveningEmployees = await prisma.user.count({ where: { shift: { type: "EVENING" } } });

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 29);
  startDate.setHours(0, 0, 0, 0);

  const rawAttendances = await prisma.attendance.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      date: true,
      status: true,
    },
    orderBy: { date: "asc" },
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  async function getShiftStats(shiftType) {
    const rows = await prisma.attendance.groupBy({
      by: ["status"],
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd,
        },
        shift: {
          type: shiftType,
        },
      },
      _count: {
        status: true,
      },
    });

    return rows.reduce((acc, r) => {
      acc[r.status] = r._count.status;
      return acc;
    }, {});
  }

  const morningStats = await getShiftStats("MORNING");
  const afternoonStats = await getShiftStats("AFTERNOON");
  const eveningStats = await getShiftStats("EVENING");

  const attendanceRaw = rawAttendances.map((a) => ({
    date: a.date.toISOString(),
    status: a.status,
  }));

  return (
    <div className="space-y-6">
      <DashboardHeader title="Dashboard" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStats dark={true} link="/admin/dashboard/shifts" title="Total Users"
          value={`${totalUsers} Users`} valueColor="text-yellow-400"
          icon={<Clock strokeWidth={2} />}
          color="bg-slate-500 text-white"
        />

        <DashboardStats link="/admin/dashboard/users/attendances"
          title="Morning Shifts" value={`${String(morningEmployees)} users`}
          icon={<Sun strokeWidth={2} />} badges={morningStats}
          color="bg-gradient-to-br from-yellow-100 to-yellow-50 text-yellow-600"
        />

        <DashboardStats link="/admin/dashboard/users/attendances"
          title="Afternoon Shifts" value={`${String(afternoonEmployees)} users`}
          icon={<SunMoon strokeWidth={2} />} badges={afternoonStats}
          color="bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600"
        />

        <DashboardStats link="/admin/dashboard/users/attendances"
          title="Evening Shifts" value={`${String(eveningEmployees)} users`}
          icon={<Moon strokeWidth={2} />} badges={eveningStats}
          color="bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600"
        />
      </div>

      <div className="p-4 space-y-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-50 border border-orange-100 text-orange-500 p-2 rounded-lg">
            <Zap strokeWidth={2} />
          </div>
          <ContentInformation title="Fast action" subtitle="Access your content in one click" autoMargin={false} />
        </div>
        <FastActions />
      </div>

      <div className="grid gap-4 grid-cols-1">
        <AnalyticsDiagram attendanceRaw={attendanceRaw} />
      </div>
    </div>
  );
}
