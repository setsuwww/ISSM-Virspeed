import { notFound } from "next/navigation";
import { Pagination } from "@/app/(content)/admin/dashboard/Pagination";
import { minutesToTime } from "@/_functions/globalFunction";
import { DashboardHeader } from "../../DashboardHeader";
import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";
import { ShiftsTable } from "./ShiftsTable";
import { getShiftCount, getShifts } from "@/_servers/admin-services/shift_action";

export const revalidate = 60;

export default async function ShiftsPage({ searchParams }) {
  const params = await searchParams
  const page = Number(params?.page) || 1;
  const allowedLimits = [10, 20, 30];
  const limit = allowedLimits.includes(Number(params?.limit)) ? Number(params?.limit) : 10;

  const [shifts, total] = await Promise.all([
    getShifts(page, limit),
    getShiftCount(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (page > totalPages && totalPages > 0) return notFound();

  const tableData = shifts.map((s) => {
    const start = minutesToTime(s.startTime);
    const end = minutesToTime(s.endTime);

    const allUsers = [...s.users];
    const uniqueUsers = Array.from(
      new Map(allUsers.map((u) => [u.id, u])).values()
    );

    const usersWithStatus = uniqueUsers.map((u) => {
      const attendance = u.attendances.find((at) => at.shiftId === s.id);
      return {
        ...u,
        attendanceStatus: attendance ? attendance.status : "ABSENT",
        reason: attendance?.reason || null,
      };
    });

    return {
      id: s.id,
      type: s.type,
      name: s.name,
      startTime: start,
      endTime: end,
      timeRange: `${start} - ${end}`,
      usersCount: usersWithStatus.length,
      users: usersWithStatus,
      location: s.location?.name ?? "-",
    };
  });

  return (
    <section className="space-y-6">
      <DashboardHeader title="Shifts" subtitle="Manage shifts data" />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation title="List shifts" subtitle="Manage all shift data in this table"
            show buttonText="Create Shift" href="/admin/dashboard/shifts/create"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <ShiftsTable data={tableData} />
          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/dashboard/shifts"
          />
        </ContentForm.Body>
      </ContentForm>
    </section>
  );
}
