import { prisma } from "@/_lib/prisma";

import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader";
import ContentForm from "@/_components/common/ContentForm";
import { ContentInformation } from "@/_components/common/ContentInformation";
import { Pagination } from "@/app/admin/dashboard/Pagination";
import UsersTable from "./ShiftUserTable";

import { capitalize } from "@/_function/globalFunction";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const revalidate = 60;

export default async function ShiftUsersPage({ params, searchParams }) {
  const shiftId = parseInt(params.id);
  const page = Number(searchParams?.page) || 1;
  const PAGE_SIZE = 10;

  const [shift, totalUsers] = await Promise.all([
    prisma.shift.findUnique({
      where: { id: shiftId },
      select: {
        id: true, type: true,
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
    where: { shiftId, role: "EMPLOYEE" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
    select: {
      id: true, name: true, email: true, role: true,
      createdAt: true, updatedAt: true,
    },
  });

  const usersDataMapped = usersData.map(u => ({
    ...u, shift: shift.type,
  }));

  const totalPages = Math.ceil(totalUsers / PAGE_SIZE);
  const title = capitalize(shift.type);

  return (
    <section>
      <DashboardHeader title={`${title} shifts`} subtitle="Manage shift employees" />
      <ContentForm>
        <ContentForm.Header>
          <ContentInformation heading={`${title} shift`} subheading={`View all employees in this shift`} />
          <Link href="/admin/dashboard/users" className="flex items-center text-sm font-semibold text-blue-500 mb-2">
            Users detail <ChevronRight strokeWidth={2} size={20} />
          </Link>
        </ContentForm.Header>

        <ContentForm.Body>
          <UsersTable data={usersDataMapped} />
        </ContentForm.Body>

        <Pagination page={page} totalPages={totalPages} basePath={`/admin/dashboard/shifts/${shiftId}`} />
      </ContentForm>
    </section>
  );
}
