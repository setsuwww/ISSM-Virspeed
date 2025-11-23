import { prisma } from "@/_lib/prisma";

import { Tag } from "lucide-react";
import ScheduleCard from "./SchedulesCard";
import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader";
import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";
import { Pagination } from "@/app/admin/dashboard/Pagination";

import { frequenciesLabel } from "@/_constants/scheduleConstants";

const PAGE_SIZE = 5;

export async function getSchedules({ page = 1, search = "", frequency, shift }) {
  return await prisma.schedule.findMany({
    skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
    where: { ...(search
        ? { OR: [ { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          } 
        : {}),
      ...(frequency && frequency !== "all" ? { frequency } : {}), ...(shift && shift !== "all" ? { shift: { type: shift } } : {}),
    },
    select: {
      id: true, title: true, description: true,
      startDate: true, endDate: true,
      frequency: true, createdAt: true, updatedAt: true,
      users: { select: { user: { select: { id: true, name: true, email: true } }}},
    },
    orderBy: { startDate: "asc" },
  });
}

export async function getScheduleCount({ search = "", frequency }) {
  return await prisma.schedule.count({
    where: { ...(search ? { OR: [{ title: { contains: search, mode: "insensitive" } }]}
      : {}),...(frequency ? { frequency } : {}),
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

  const schedules = schedulesRaw.map((s) => ({ ...s,
    startDate: s.startDate?.toISOString() ?? null, endDate: s.endDate?.toISOString() ?? null,
    createdAt: s.createdAt?.toISOString() ?? null, updatedAt: s.updatedAt?.toISOString() ?? null,
    shift: s.shift
      ? {...s.shift, startTime: s.shift.startTime, endTime: s.shift.endTime,}
      : null,
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (page > totalPages && totalPages > 0) { return <div className="p-4">Page not found</div>}

  return (
    <section>
      <DashboardHeader title="Schedules" subtitle="List of your schedules" />
      <ContentForm>
        <ContentForm.Header>
          <ContentInformation heading="Schedule table" subheading="Manage schedule more detail than calendar view"/>
          <div className="flex items-center space-x-2 mt-4 mb-4">
            {frequenciesLabel.map((f) => (
              <div key={f.label} className={`flex items-center space-x-2 border border-${f.color}-100 px-2 py-0.5 rounded-full`}>
                <Tag strokeWidth={2} className={`w-3 h-3 text-${f.color}-500`}/>
                <span className={`text-${f.color}-600 text-sm font-base`}>
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </ContentForm.Header>

        <ContentForm.Body>
          <ScheduleCard data={schedules} />
        </ContentForm.Body>

        <Pagination page={page} totalPages={totalPages} basePath="/admin/dashboard/schedules"/>
      </ContentForm>
    </section>
  );
}
