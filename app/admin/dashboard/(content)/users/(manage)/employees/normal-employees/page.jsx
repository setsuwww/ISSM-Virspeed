import { prisma } from "@/_lib/prisma";
import { ContentInformation } from "@/_components/common/ContentInformation";
import ContentForm from "@/_components/common/ContentForm";
import EmployeesTable from "./EmployeesTable";
import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader";
import { Pagination } from "@/app/admin/dashboard/Pagination";
import { minutesToTime } from "@/_function/globalFunction";
import EmployeesTableButton from "../EmployeesTableButton";

const PAGE_SIZE = 10;

async function getEmployees(page = 1) {
  return prisma.user.findMany({
    where: {
      role: "EMPLOYEE",
      shiftId: null,
      divisionId: { not: null },
      division: {
        startTime: { not: null },
        endTime: { not: null },
      },
    },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      division: {
        select: {
          id: true,
          name: true,
          type: true,
          startTime: true,
          endTime: true,
        },
      },
    },
  });
}

async function getDivisions() {
  return prisma.division.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      type: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

async function getEmployeeCount() {
  return prisma.user.count({
    where: {
      role: "EMPLOYEE",
      shiftId: null,
      divisionId: { not: null },
      division: {
        startTime: { not: null },
        endTime: { not: null },
      },
    },
  });
}

export const revalidate = 60;

export default async function EmployeesWorkHoursPage({ searchParams }) {
  const params = await searchParams
  const page = Number(params?.page) || 1;

  const [users, total, divisions] = await Promise.all([
    getEmployees(page),
    getEmployeeCount(),
    getDivisions(),
  ]);

  const serializedUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    workHours: u.division
      ? {
        startTime: minutesToTime(u.division.startTime),
        endTime: minutesToTime(u.division.endTime),
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
              heading="List Normal Employees"
              subheading="Manage all normal-hours employees here"
            />
            <EmployeesTableButton />
          </div>
        </ContentForm.Header>

        <ContentForm.Body>
          <EmployeesTable users={serializedUsers} divisions={divisions} />
          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/dashboard/users/employees/work-hours"
          />
        </ContentForm.Body>
      </ContentForm>
    </section>
  );
}
