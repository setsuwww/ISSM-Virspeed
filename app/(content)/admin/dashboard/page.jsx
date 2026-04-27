import { Clock, Sun, SunMoon, Moon, Zap, ChartNoAxesCombined, Users, User } from "lucide-react";
import { ContentInformation } from "@/_components/common/ContentInformation";

import { DashboardHeader } from "./DashboardHeader";
import { DashboardStats } from "./DashboardStats";

import FastActions from "./page-action";
import { getDashboardStats } from "@/_servers/admin-services/dashboard_action";
import { Suspense } from "react";
import AnalyticsSection from "./AnalyticsSection";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      <DashboardHeader title="Dashboard" />

      <div className="grid grid-cols-1 lg:grid-cols-2 pr-4">
        <DashboardStats
          dark
          title="Attendance Status"
          icon={<ChartNoAxesCombined strokeWidth={2} />}
          color="bg-gray-400/30 from-gray-500 to-gray-400 text-white"
          value="Overview"
          valueColor="text-yellow-400"
          badges={{
            PRESENT: stats.attendance.status.present,
            ABSENT: stats.attendance.status.absent,
            LATE: stats.attendance.status.late,
            PERMISSION: stats.attendance.status.permission,
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStats
          title="Total Users"
          value={`${stats.users.total} Users`}
          icon={<User strokeWidth={2} />}
          color="bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600"
        />

        <DashboardStats
          title="Morning Shifts"
          value={`${stats.shiftDistribution.morning} users`}
          icon={<Sun strokeWidth={2} />}
          badges={stats.shiftStats.morning}
          color="bg-gradient-to-br from-yellow-100 to-yellow-50 text-yellow-600"
        />

        <DashboardStats
          title="Afternoon Shifts"
          value={`${stats.shiftDistribution.afternoon} users`}
          icon={<SunMoon strokeWidth={2} />}
          badges={stats.shiftStats.afternoon}
          color="bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600"
        />

        <DashboardStats
          title="Evening Shifts"
          value={`${stats.shiftDistribution.evening} users`}
          icon={<Moon strokeWidth={2} />}
          badges={stats.shiftStats.evening}
          color="bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardStats
          title="Active Users"
          icon={<Users strokeWidth={2} />}
          color="bg-gradient-to-br from-teal-100 to-teal-50 text-teal-600"
          value={`${stats.users.active} Active`}
        />

        <DashboardStats
          title="Inactive Users"
          icon={<Users strokeWidth={2} />}
          color="bg-gradient-to-br from-red-100 to-red-50 text-red-600"
          value={`${stats.users.inactive} Inactive`}
        />

        <DashboardStats
          title="Total Shifts"
          icon={<Clock strokeWidth={2} />}
          color="bg-gradient-to-br from-sky-100 to-sky-50 text-sky-600"
          value={`${stats.master.shifts} Shifts`}
        />

        <DashboardStats
          title="Total Schedules"
          icon={<Clock strokeWidth={2} />}
          color="bg-gradient-to-br from-teal-100 to-teal-50 text-teal-600"
          value={`${stats.master.schedules} Schedules`}
        />
      </div>

      <div className="p-4 space-y-4 bg-white rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-50 border border-orange-100 text-orange-500 p-2 rounded-lg">
            <Zap strokeWidth={2} />
          </div>
          <ContentInformation title="Fast action" subtitle="Access your content in one click" autoMargin={false} />
        </div>
        <FastActions />
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Suspense fallback={<div className="p-6 text-sm text-gray-400">Loading analytics...</div>}>
          <AnalyticsSection />
        </Suspense>
      </div>
    </div>
  )
}
