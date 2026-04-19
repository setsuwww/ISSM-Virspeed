import { notFound } from "next/navigation";
import { DashboardHeader } from "@/app/(content)/admin/dashboard/DashboardHeader";
import { Pagination } from "@/app/(content)/admin/dashboard/Pagination";
import UsersTable from "./UsersTable";

import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";

import { capitalize, safeFormat, minutesToTime } from "@/_functions/globalFunction";
import { getUserCount, getUsers } from "@/_servers/admin-services/user_action";

export const revalidate = 60;

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const page = Number(params?.page) || 1;
  const allowedLimits = [10, 20, 30];
  const limit = allowedLimits.includes(Number(params?.limit)) ? Number(params?.limit) : 10;

  const [users, total] = await Promise.all([
    getUsers(page, limit),
    getUserCount(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (page > totalPages && totalPages > 0) return notFound();

  const tableData = users.map((u) => {
    const isAdmin = u.role === "ADMIN"

    const userShift = u.shift && {
      label: u.shift.name || capitalize(u.shift.type),
      start: u.shift.startTime,
      end: u.shift.endTime,
      type: u.shift.type,
    }

    const locationShift = !userShift && u.location?.shifts?.length
      ? {
        label: `${u.location.shifts[0].name} - (Normal)`,
        start: u.location.shifts[0].startTime,
        end: u.location.shifts[0].endTime,
        type: "DIVISION",
      } : null

    const locationTime = !userShift && !locationShift && u.location?.startTime && u.location?.endTime
      ? {
        label: u.location.name,
        start: u.location.startTime,
        end: u.location.endTime,
        type: "DIVISION_TIME",
      } : null

    const finalShift = userShift || locationShift || locationTime

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      shift: finalShift?.label ?? "—",
      shiftTime: finalShift ? `${minutesToTime(finalShift.start)} - ${minutesToTime(finalShift.end)}` : "—",
      shiftType: finalShift?.type ?? null,
      createdAt: safeFormat(u.createdAt, "dd MMMM yyyy"),
      updatedAt: safeFormat(u.updatedAt, "dd MMMM yyyy"),
      isActionLocked: isAdmin,
    }
  })

  return (
    <section>
      <DashboardHeader title="Users" subtitle="Users data detail" />
      <ContentForm>
        <ContentForm.Header>
          <ContentInformation title="List users" subtitle="Manage all users data in this table"
            show buttonText="Create Users" href="/admin/dashboard/users/create"
          />
        </ContentForm.Header>

        <ContentForm.Body>
          <UsersTable data={tableData} />
          <Pagination page={page} totalPages={totalPages} basePath="/admin/dashboard/users" limit={limit} />
        </ContentForm.Body>
      </ContentForm>
    </section>
  );
}
