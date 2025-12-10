import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader";
import WorkHoursTabs from "./WorkHoursTabs";
import { prisma } from "@/_lib/prisma";
import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";
import { Pagination } from "../../../../Pagination";
import { notFound } from "next/navigation";

const PAGE_SIZE = 12;
export const revalidate = 60;

async function getWorkHoursData(page = 1) {
  const usersPromise = prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    orderBy: { createdAt: "desc" },
    include: {
      division: {
        include: {
          shifts: {
            where: { isActive: true },
          },
        },
      },
      shift: true,
    },
  });

  const countPromise = prisma.user.count({
    where: { role: "EMPLOYEE" },
  });

  const divisionsPromise = prisma.division.findMany({
    select: {
      id: true,
      name: true,
      startTime: true,
      endTime: true,
      users: {
        where: {
          shiftId: null,
          role: "EMPLOYEE",
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      shifts: {
        select: {
          type: true,
          name: true,
          startTime: true,
          endTime: true
        }
      }
    },
  });

  const shiftsPromise = prisma.shift.findMany({
    select: {
      id: true,
      name: true,
      startTime: true,
      endTime: true,
      type: true,
      users: {
        where: {
          role: "EMPLOYEE",
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    where: {
      isActive: true,
    },
  });

  const [users, total, divisions, shifts] = await Promise.all([
    usersPromise,
    countPromise,
    divisionsPromise,
    shiftsPromise,
  ]);

  return { users, total, divisions, shifts };
}

export default async function Page({ searchParams }) {
  const page = Number(searchParams?.page) || 1;

  const { users, total, divisions, shifts } = await getWorkHoursData(page);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages && totalPages > 0) return notFound();

  return (
    <section>
      <DashboardHeader title="Work Hours" subtitle="View employee working hours" />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation
            heading="Work Hours Overview"
            subheading="View division and shift hours for employees"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <WorkHoursTabs
            users={users}
            divisions={divisions}
            shifts={shifts}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/dashboard/users/work-hours"
          />
        </ContentForm.Body>
      </ContentForm>
    </section>
  );
}
