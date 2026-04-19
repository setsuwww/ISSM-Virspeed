import { ContentInformation } from "@/_components/common/ContentInformation";
import ContentForm from "@/_components/common/ContentForm";
import EmployeesTable from "./EmployeesTable";
import { DashboardHeader } from "@/app/(content)/admin/dashboard/DashboardHeader";
import { Pagination } from "@/app/(content)/admin/dashboard/Pagination";
import { minutesToTime } from "@/_functions/globalFunction";
import EmployeesTableButton from "../EmployeesTableButton";
import { getShiftEmployees, getShiftEmployeeCount, getSEFilterData } from "@/_servers/admin-services/user_action";

export const revalidate = 60;

export default async function Page({ searchParams }) {
  const params = await searchParams
  const page = Number(params?.page) || 1;
  const allowedLimits = [10, 20, 30];

  const limit = allowedLimits.includes(Number(params?.limit))
    ? Number(params?.limit)
    : 10;

  const [[users, total], { locations, shifts }] = await Promise.all([
    Promise.all([getShiftEmployees({ page, limit }), getShiftEmployeeCount()]),
    getSEFilterData(),
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

  const totalPages = Math.ceil(total / limit);
  if (page > totalPages && totalPages > 0) return <div className="p-4">Page not found</div>;

  return (
    <section>
      <DashboardHeader title="Employees" subtitle="Employees management" />
      <ContentForm>
        <ContentForm.Header>
          <div className="flex items-center justify-between pb-3">
            <ContentInformation title="List Shift employees" subtitle="Manage all shift-hours employees here" autoMargin={false} />
            <EmployeesTableButton />
          </div>
        </ContentForm.Header>

        <ContentForm.Body>
          <EmployeesTable users={serializedUsers} locations={locations} shifts={shifts} />
          <Pagination page={page} totalPages={totalPages} basePath="/admin/dashboard/users/employees/shift-employees" limit={limit} />
        </ContentForm.Body>
      </ContentForm>
    </section>
  );
}
