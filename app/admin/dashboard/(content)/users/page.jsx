import { prisma } from "@/_lib/prisma";
import { notFound } from "next/navigation";
import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader";
import { Pagination } from "@/app/admin/dashboard/Pagination";
import UsersTable from "./UsersTable";

import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";

import { capitalize } from "@/_function/globalFunction";
import { minutesToTime } from "@/_function/globalFunction";

const PAGE_SIZE = 10;
export const revalidate = 60;

async function getUsers(page = 1) {
  return prisma.user.findMany({ skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true,
      createdAt: true, updatedAt: true,
      shift: { select: { name: true, type: true, startTime: true, endTime: true } },
      division: { select: { name: true, startTime: true, endTime: true,
          shifts: { select: { name: true, startTime: true, endTime: true },
            where: { isActive: true },
          },
        },
      },
    },
  });
}

async function getUserCount() {
  return prisma.user.count();
}

export default async function Page({ searchParams }) {
  const page = Number(searchParams?.page) || 1;

  const [users, total] = await Promise.all([
    getUsers(page), getUserCount(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages && totalPages > 0) return notFound();

  const tableData = users.map((u) => {
    const userShift = u.shift
      ? {
          label: capitalize(u.shift.name || u.shift.type),
          start: u.shift.startTime, end: u.shift.endTime,
          type: u.shift.type,
        } : null;

    const divisionShift =
      !userShift && u.division?.shifts?.length
        ? {
            label: `${u.division.shifts[0].name} - (Division)`,
            start: u.division.shifts[0].startTime, end: u.division.shifts[0].endTime,
            type: "DIVISION"
          } : null;

    const divisionTime =
      !userShift && !divisionShift && u.division?.startTime && u.division?.endTime
        ? {
            label: u.division.name,
            start: u.division.startTime, end: u.division.endTime,
            type: "DIVISION_TIME"
          } : null;

    const finalShift = userShift || divisionShift || divisionTime;
    const shiftLabel = finalShift ? finalShift.label : "—";
    const shiftTime = finalShift ? `${minutesToTime(finalShift.start)} - ${minutesToTime(finalShift.end)}` : "—";

    return {
      id: u.id, name: u.name, email: u.email,
      role: capitalize(u.role),
      shift: shiftLabel, shiftTime, shiftType: finalShift ? finalShift.type : null,
      createdAt: u.createdAt.toISOString(), updatedAt: u.updatedAt.toISOString(),
    };
  });

  return (
    <section>
      <DashboardHeader title="Users" subtitle="Users data detail" />
      <ContentForm>
        <ContentForm.Header>
          <ContentInformation heading="List users" subheading="Manage all users data in this table"
            show buttonText="Create Users" href="/admin/dashboard/users/create"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <UsersTable data={tableData} />
          <Pagination page={page} totalPages={totalPages} basePath="/admin/dashboard/users"/>
        </ContentForm.Body>
      </ContentForm>
    </section>
  );
}
