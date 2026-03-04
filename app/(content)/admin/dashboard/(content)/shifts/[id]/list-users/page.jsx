import { prisma } from "@/_lib/prisma";

import { DashboardHeader } from "@/app/(content)/admin/dashboard/DashboardHeader";
import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";
import { Pagination } from "@/app/(content)/admin/dashboard/Pagination";
import ListUsersTable from "./ListUsersTable";

import { capitalize, minutesToTime, safeFormat } from "@/_functions/globalFunction";
import LinkToPage from "./LinkToPage";

export const revalidate = 60;

export default async function ShiftUsersPage({ params, searchParams }) {
  const shiftId = parseInt(params.id);
  const page = Number(searchParams?.page) || 1;
  const PAGE_SIZE = 10;

  const [shift, totalUsers] = await Promise.all([
    prisma.shift.findUnique({
      where: { id: shiftId },
      select: {
        id: true, type: true, name: true,
        startTime: true, endTime: true,
        division: {
          select: { id: true, name: true },
        },
        users: {
          where: { role: "EMPLOYEE" },
          select: { id: true }
        },
      },
    }),
    prisma.user.count({ where: { shiftId, role: "EMPLOYEE" } }),
  ]);

  if (!shift) return <div className="p-4">Shift not found</div>;

  const usersData = await prisma.user.findMany({
    where: { shiftId, role: "EMPLOYEE" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,

      division: {
        select: {
          name: true,
        },
      },

      shift: {
        select: {
          startTime: true,
          endTime: true,
          type: true,
        },
      },
    },
  });

  const usersDataMapped = usersData.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,

    divisionName: u.division?.name ?? "N/A",

    shiftType: u.shift?.type ?? "-",

    startTime:
      typeof u.shift?.startTime === "number"
        ? minutesToTime(u.shift.startTime)
        : "-",

    endTime:
      typeof u.shift?.endTime === "number"
        ? minutesToTime(u.shift.endTime)
        : "-",

    createdAt: safeFormat(u.createdAt, "dd MMMM yyyy"),
    updatedAt: safeFormat(u.updatedAt, "dd MMMM yyyy"),
  }));

  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);

  return (
    <section>
      <DashboardHeader
        title={`${capitalize(shift.type)} Shift`}
        subtitle={shift.name}
      />

      <ContentForm>
        <ContentForm.Header>
          <div className="flex flex-col gap-1">
            <ContentInformation title="Shift Information"
              subtitle={`Working hours:
                ${typeof shift.startTime === "number"
                  ? minutesToTime(shift.startTime)
                  : "-"
                } -
                ${typeof shift.endTime === "number"
                  ? minutesToTime(shift.endTime)
                  : "-"
                }`}
            />
            <LinkToPage />
          </div>
        </ContentForm.Header>

        <ContentForm.Body>
          <ListUsersTable data={usersDataMapped} />
        </ContentForm.Body>

        <Pagination page={page} totalPages={totalPages} basePath={`/admin/dashboard/shifts/${shiftId}`} />
      </ContentForm>
    </section>
  );
}
