import { notFound } from "next/navigation";
import { Pagination } from "@/app/admin/dashboard/Pagination";
import { minutesToTime } from "@/_function/globalFunction";
import { DashboardHeader } from "../../DashboardHeader";
import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";
import { ShiftsView } from "./ShiftsView";

const PAGE_SIZE = 10;
export const revalidate = 60;

export default async function ShiftsPage({ searchParams }) {
  const page = Number(searchParams?.page) || 1;

  async function getShifts(page = 1) {
    return prisma.shift.findMany({
      where: { type: { in: ["MORNING", "AFTERNOON", "EVENING"] } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { type: "asc" },
      select: {
        id: true,
        type: true,
        name: true,
        startTime: true,
        endTime: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            attendances: {
              select: { shiftId: true, status: true, reason: true },
            },
          },
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                attendances: {
                  select: { shiftId: true, status: true, reason: true },
                },
              },
            },
          },
        },
        division: { select: { name: true } },
      },
    });
  }

  async function getShiftCount() {
    return prisma.shift.count({
      where: { type: { in: ["MORNING", "AFTERNOON", "EVENING"] } },
    });
  }

  const [shifts, total] = await Promise.all([
    getShifts(page),
    getShiftCount(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages && totalPages > 0) return notFound();

  const tableData = shifts.map((s) => {
    const start = minutesToTime(s.startTime);
    const end = minutesToTime(s.endTime);

    const allUsers = [...s.users, ...s.assignments.map((a) => a.user)];
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
      division: s.division?.name ?? "-",
    };
  });

  return (
    <section className="space-y-6">
      <DashboardHeader title="Shifts" subtitle="Manage shifts data" />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation
            heading="List shifts"
            subheading="Manage all shift data in this table"
            show
            buttonText="Create Shift"
            href="/admin/dashboard/shifts/create"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <ShiftsView data={tableData} />
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
