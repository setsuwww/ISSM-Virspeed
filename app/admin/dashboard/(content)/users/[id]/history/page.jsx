import { prisma } from "@/_lib/prisma";
import { CircleUserRound } from "lucide-react";

import { ContentInformation } from "@/_components/common/ContentInformation";
import ContentForm from "@/_components/common/ContentForm";
import UserHistoryTable from "./HistoryTable";
import { DashboardHeader } from "@/app/admin/dashboard/DashboardHeader";
import { Pagination } from "@/app/admin/dashboard/Pagination";
import { minutesToTime, safeFormat } from "@/_function/globalFunction";

const PAGE_SIZE = 5;

function resolveDateRange(range) {
  const now = new Date();
  if (range === "1w") now.setDate(now.getDate() - 7);
  if (range === "1m") now.setMonth(now.getMonth() - 1);
  if (range === "1y") now.setFullYear(now.getFullYear() - 1);
  return now;
}

async function getHistory(userId, page, searchParams) {
  const { range, status, sort } = searchParams;

  const where = {
    userId,
    ...(range && {
      date: { gte: resolveDateRange(range) },
    }),
    ...(status && { status }),
  };

  return prisma.attendance.findMany({
    where,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    orderBy: { date: sort === "asc" ? "asc" : "desc" },
    include: {
      shift: true,
      earlyCheckoutRequests: true,
      user: { select: { id: true, name: true, email: true } },
    },
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
    getHistory(Number(id), page, searchParams),
    getHistoryCount(Number(id)),
    getUserProfile(Number(id)),
  ]);

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
        subtitle={ profile ? `${profile.name} (${profile.email})` : "User"} useColor
      />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation
            heading={ profile ? `${profile.name}` : "User"}
            subheading={ profile ? `${profile.name}'s Attendance history detail` : "User"}
          />
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
