import { Clock, Sun, SunMoon, Moon, Zap, ChartNoAxesCombined } from "lucide-react";

import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader";
import { DashboardStats } from "@/app/admin/dashboard/DashboardStats";
import { ContentInformation } from "@/_components/common/ContentInformation";
import { AreaDiagram, BarDiagram } from "./DashboardDiagram";

import { prisma } from "@/_lib/prisma";
import FastActions from './page-action';

export default async function AdminDashboardPage() {
  const totalUsers = await prisma.user.count();

  const morningEmployees = await prisma.user.count({
    where: { shift: { type: "MORNING" } },
  });

  const afternoonEmployees = await prisma.user.count({
    where: { shift: { type: "AFTERNOON" } },
  });

  const eveningEmployees = await prisma.user.count({
    where: { shift: { type: "EVENING" } },
  });

  const salesChartData = [
    { name: "1", value: 10, negativeValue: 2 },
    { name: "2", value: 15, negativeValue: 5 },
    { name: "3", value: 8, negativeValue: 3 },
    { name: "4", value: 20, negativeValue: 7 },
    { name: "5", value: 12, negativeValue: 4 },
    { name: "6", value: 18, negativeValue: 6 },
    { name: "7", value: 25, negativeValue: 9 },
    { name: "8", value: 8, negativeValue: 9 },
    { name: "9", value: 9, negativeValue: 9 },
    { name: "10", value: 15, negativeValue: 9 },
    { name: "11", value: 20, negativeValue: 9 },
    { name: "12", value: 6, negativeValue: 9 },
  ];

  const ticketChartData = [
    { name: "Minggu", accepted: 9, rejected: 3, late: 7, onTime: 4 },
    { name: "Senin", accepted: 7, rejected: 5, late: 5, onTime: 6 },
    { name: "Selasa", accepted: 9, rejected: 4, late: 7, onTime: 2 },
    { name: "Rabu", accepted: 7, rejected: 3, late: 5, onTime: 5 },
    { name: "Kamis", accepted: 9, rejected: 5, late: 7, onTime: 6 },
    { name: "Jumat", accepted: 12, rejected: 7, late: 10, onTime: 12 },
    { name: "Sabtu", accepted: 10, rejected: 5, late: 8, onTime: 15 },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader title="Dashboard" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStats
          dark={true}
          link="/admin/dashboard/shifts"
          title="Total Users"
          value={`${totalUsers.toString()} Users`}
          valueColor="text-yellow-400"
          icon={<Clock strokeWidth={2} />}
          color="bg-slate-500 text-white"
        />

        <DashboardStats
          title="Morning Shifts"
          value={morningEmployees.toString()}
          icon={<Sun strokeWidth={2} />}
          color="bg-gradient-to-br from-yellow-100 to-yellow-50 text-yellow-600"
        />

        <DashboardStats
          title="Afternoon Shifts"
          value={afternoonEmployees.toString()}
          icon={<SunMoon strokeWidth={2} />}
          color="bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600"
        />

        <DashboardStats
          title="Evening Shifts"
          value={eveningEmployees.toString()}
          icon={<Moon strokeWidth={2} />}
          color="bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600"
        />
      </div>

      <div className="p-4 space-y-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-50 border border-orange-100 text-orange-500 p-2 rounded-lg">
            <Zap strokeWidth={2} />
          </div>
          <ContentInformation heading="Fast action" subheading="Access your content in one click" autoMargin={false} />
        </div>

        <FastActions />
      </div>

      <div className="p-4 space-y-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-50 border border-purple-100 text-purple-500 p-2 rounded-lg">
            <ChartNoAxesCombined strokeWidth={2} />
          </div>
          <ContentInformation heading="Analytics" subheading="Views statistic in diagram views" autoMargin={false} />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2">
        <BarDiagram
          title="Employee performance"
          description="Bad and Good performance from Employee"
          data={salesChartData}
          series={[{ key: "value", color: "#1d293d", label: "Value" }]}
        />

        <AreaDiagram
          title="Shifts statistic"
          description="Shift attendance diagram"
          data={ticketChartData}
          series={[
            { key: "accepted", color: "#7bf1a8", label: "On Time" },
            { key: "rejected", color: "#ffdf20", label: "Late" },
            { key: "late", color: "#ffa2a2", label: "Absent" },
            { key: "onTime", color: "#3b82f6", label: "Permission" },
          ]}
        />
      </div>
    </div >
  );
}
