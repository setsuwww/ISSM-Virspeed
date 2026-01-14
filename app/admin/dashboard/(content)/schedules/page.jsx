import { prisma } from "@/_lib/prisma";

import ScheduleCard from "./SchedulesCard";
import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader";
import ContentForm from "@/_components/common/ContentForm";
import { Pagination } from "@/app/admin/dashboard/Pagination";
import ClientPage from "./page-client";

const PAGE_SIZE = 10;

export async function getSchedules({ page = 1, search = "", frequency, shift }) {
  return await prisma.schedule.findMany({
    skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
    where: {
      ...(search
        ? { OR: [{ title: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } },], }
        : {}),
      ...(frequency && frequency !== "all" ? { frequency } : {}), ...(shift && shift !== "all" ? { shift: { type: shift } } : {}),
    },
    select: {
      id: true, title: true, description: true,
      startDate: true, endDate: true, startTime: true, endTime: true,
      frequency: true, createdAt: true, updatedAt: true,
      users: { select: { user: { select: { id: true, name: true, email: true } } } },
    },
    orderBy: { startDate: "asc" },
  });
}

export async function getScheduleCount({ search = "", frequency }) {
  return await prisma.schedule.count({
    where: {
      ...(search ? { OR: [{ title: { contains: search, mode: "insensitive" } }] }
        : {}), ...(frequency ? { frequency } : {}),
    },
  });
}

export const revalidate = 60;

export default async function Page({ searchParams }) {
  const { page, search, frequency } = await searchParams

  const [schedulesRaw, total] = await Promise.all([
    getSchedules({ page, search, frequency }),
    getScheduleCount({ search, frequency }),
  ]);

  const schedules = schedulesRaw.map((s) => ({
    ...s, startDate: s.startDate?.toISOString() ?? null, endDate: s.endDate?.toISOString() ?? null,
    createdAt: s.createdAt?.toISOString() ?? null, updatedAt: s.updatedAt?.toISOString() ?? null,
    shift: s.shift
      ? { ...s.shift, startTime: s.shift.startTime, endTime: s.shift.endTime, }
      : null,
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (page > totalPages && totalPages > 0) { return <div className="p-4">Page not found</div> }

  return (
    <section>
      <DashboardHeader title="Schedules" subtitle="List of your schedules" />
      <ContentForm>
        <ContentForm.Header>
          <ClientPage />
        </ContentForm.Header>

        <ContentForm.Body>
          <ScheduleCard data={schedules} />
        </ContentForm.Body>

        <Pagination page={page} totalPages={totalPages} basePath="/admin/dashboard/schedules" />
      </ContentForm>
    </section>
  );
}
