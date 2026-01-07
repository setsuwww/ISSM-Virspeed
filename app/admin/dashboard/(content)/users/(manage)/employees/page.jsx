import { prisma } from "@/_lib/prisma";
import { ContentInformation } from "@/_components/common/ContentInformation";
import ContentForm from "@/_components/common/ContentForm";
import EmployeesTable from "./EmployeesTable";
import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader";
import { Pagination } from "@/app/admin/dashboard/Pagination";
import { minutesToTime } from "@/_function/globalFunction";
import EmployeesTableButton from "./EmployeesTableButton";

const PAGE_SIZE = 10;

async function getEmployees(page = 1) {
  return prisma.user.findMany({
    where: { role: "EMPLOYEE", shiftId: { not: null } },
    skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true,
      createdAt: true, updatedAt: true,
      shift: {
        select: {
          id: true, name: true, type: true,
          startTime: true, endTime: true,
        },
      },
      division: { select: { id: true, name: true, type: true } },
    },
  });
}

async function getEmployeeCount() {
  return prisma.user.count({
    where: { role: "EMPLOYEE", shiftId: { not: null } },
  });
}

async function getFilterData() {
  const [divisions, shifts] = await Promise.all([
    prisma.division.findMany({
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    }),
    prisma.shift.findMany({
      where: { isActive: true },
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { divisions, shifts };
}

export const revalidate = 60;

export default async function EmployeesPage({ searchParams }) {
  const page = Number(searchParams?.page) || 1;

  const [[users, total], { divisions, shifts }] = await Promise.all([
    Promise.all([getEmployees(page), getEmployeeCount()]),
    getFilterData(),
  ]);

  const serializedUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    shift: u.shift
      ? {
        ...u.shift,
        startTime: minutesToTime(u.shift.startTime),
        endTime: minutesToTime(u.shift.endTime),
      }
      : null,
  }));

  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (page > totalPages && totalPages > 0)
    return <div className="p-4">Page not found</div>;

  return (
    <section>
      <DashboardHeader title="Employees" subtitle="Employees management" />
      <ContentForm>
        <ContentForm.Header>
          <div className="flex items-center justify-between pb-3">
            <ContentInformation
              autoMargin={false}
              heading="List Employees"
              subheading="Manage all employees here"
            />
            <EmployeesTableButton />
          </div>
        </ContentForm.Header>

        <ContentForm.Body>
          <EmployeesTable users={serializedUsers} divisions={divisions} shifts={shifts} />
          <Pagination page={page} totalPages={totalPages} basePath="/admin/dashboard/users/employees" />
        </ContentForm.Body>
      </ContentForm>
    </section>
  );
}
