import { prisma } from "@/_lib/prisma";
import { CircleUserRound } from "lucide-react";

import { ContentInformation } from "@/_components/common/ContentInformation";
import ContentForm from "@/_components/common/ContentForm";
import UserHistoryTable from "./HistoryTable";
import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader";
import { Pagination } from "@/app/admin/dashboard/Pagination";
import { minutesToTime, safeFormat } from "@/_function/globalFunction";

const PAGE_SIZE = 10;

async function getHistory(userId, page = 1) {
  return await prisma.attendance.findMany({
    where: { userId },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      shift: true,
      earlyCheckoutRequests: true, // <--- include early checkout
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { date: "desc" },
  });
}

async function getUserProfile(userId) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
}

async function getHistoryCount(userId) {
  return await prisma.attendance.count({ where: { userId } });
}

export const revalidate = 60;

export default async function UserHistoryPage({ params, searchParams }) {
  const { id } = params;
  const page = Number(searchParams?.page) || 1;

  const [history, total, profile] = await Promise.all([
    getHistory(Number(id), page),
    getHistoryCount(Number(id)),
    getUserProfile(Number(id)),
  ]);

  // Mapping attendance + menambahkan flag early checkout
  const serializedHistory = history.map((h) => {
    const isEarlyCheckout = !!h.earlyCheckoutRequests?.some(
      (r) => r.status === "APPROVED"
    );

    return {
      ...h,
      day: safeFormat(h.date, "EEEE"),
      dmy: safeFormat(h.date, "dd MMMM yyyy"),
      checkInTime: h.checkInTime ? h.checkInTime.toISOString() : null,
      checkOutTime: h.checkOutTime ? h.checkOutTime.toISOString() : null,
      createdAt: h.createdAt.toISOString(),
      updatedAt: h.updatedAt.toISOString(),
      shift: h.shift
        ? {
            ...h.shift,
            startTime: minutesToTime(h.shift.startTime),
            endTime: minutesToTime(h.shift.endTime),
          }
        : null,
      isEarlyCheckout,
    };
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (page > totalPages && totalPages > 0) {
    return <div className="p-4">Page not found</div>;
  }

  return (
    <section>
      <DashboardHeader
        title={`Attendance History`}
        subtitle={
          profile
            ? `History : ${profile.name} (${profile.email})`
            : "User"
        }
      />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation
            heading="Attendance Records"
            subheading="Detail check-in & check-out"
          />
          {profile && (
            <div className="mb-6 p-3 flex items-center space-x-2 rounded-lg bg-slate-50 border border-slate-200 shadow-xs">
              <div className="p-2 bg-slate-200 text-slate-600 rounded-lg">
                <CircleUserRound strokeWidth={1.5} size={30} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-md font-semibold text-slate-600">
                  {profile.name}
                </h2>
                <p className="text-sm text-slate-400">{profile.email}</p>
              </div>
            </div>
          )}
        </ContentForm.Header>

        <ContentForm.Body>
          <UserHistoryTable history={serializedHistory} />
        </ContentForm.Body>

        <Pagination
          page={page}
          totalPages={totalPages}
          basePath={`/admin/dashboard/users/${id}/history`}
        />
      </ContentForm>
    </section>
  );
}
