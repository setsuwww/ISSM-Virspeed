import { prisma } from "@/_lib/prisma";

import { ContentInformation } from "@/_components/common/ContentInformation";
import ContentForm from "@/_components/common/ContentForm";
import UserHistoryTable from "./HistoryTable";
import { DashboardHeader } from "@/app/(content)/admin/dashboard/DashboardHeader";
import { Pagination } from "@/app/(content)/admin/dashboard/Pagination";
import { minutesToTime, safeFormat } from "@/_functions/globalFunction";

const PAGE_SIZE = 10;

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

async function getLeaves(userId) {
  return prisma.leaveRequest.findMany({
    where: {
      userId,
      status: "APPROVED",
    },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      leaveType: { select: { name: true } },
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

  const [history, total, leaves, profile] = await Promise.all([
    getHistory(id, page, searchParams),
    getHistoryCount(id),
    getLeaves(id),
    getUserProfile(id),
  ]);

  function mergeAttendanceAndLeave(history, leaves) {
    const result = [];

    const leaveMap = leaves.map((l) => ({
      type: "LEAVE",
      id: `leave-${l.id}`,
      start: new Date(l.startDate),
      end: new Date(l.endDate),
      label: `${safeFormat(l.startDate, "dd MMM")} - ${safeFormat(l.endDate, "dd MMM")}`,
      leaveType: l.leaveType?.name,
    }));

    const todayStr = new Date().toDateString();

    for (const h of history) {
      const isToday = new Date(h.date).toDateString() === todayStr;

      result.push({
        ...h,
        type: "ATTENDANCE",
        isToday,
      });
    }

    // masukin leave sebagai 1 row
    for (const l of leaveMap) {
      result.push({
        id: l.id,
        type: "LEAVE",
        label: l.label,
        leaveType: l.leaveType,
        isLeave: true,
      });
    }

    // sorting biar rapi
    result.sort((a, b) => {
      const dateA = a.date || a.start;
      const dateB = b.date || b.start;
      return new Date(dateB) - new Date(dateA);
    });

    return result;
  }

  const serializedHistory = mergeAttendanceAndLeave(
    history.map((h) => {
      const isEarlyCheckout = !!h.earlyCheckoutRequests?.some(
        (r) => r.status === "APPROVED"
      );

      return {
        ...h,
        day: safeFormat(h.date, "EEEE"),
        dmy: safeFormat(h.date, "dd MMMM yyyy"),

        checkInTime: h.checkInTime?.toISOString() || null,
        checkOutTime: h.checkOutTime?.toISOString() || null,

        shift: h.shift
          ? {
            ...h.shift,
            startTime: minutesToTime(h.shift.startTime),
            endTime: minutesToTime(h.shift.endTime),
          }
          : null,

        isEarlyCheckout,
      };
    }),
    leaves
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (page > totalPages && totalPages > 0) {
    return <div className="p-4">Page not found</div>;
  }

  return (
    <section>
      <DashboardHeader
        title={`Attendance History`}
        subtitle={profile ? `${profile.name} (${profile.email})` : "User"} useColor
      />

      <ContentForm>
        <ContentForm.Header>
          <ContentInformation title={profile ? `${profile.name}` : "User"} subtitle={profile ? `${profile.name}'s Attendance history detail` : "User"} />
        </ContentForm.Header>

        <ContentForm.Body>
          <UserHistoryTable history={serializedHistory} />
        </ContentForm.Body>

        <div className="p-6" >
          <Pagination
            page={page}
            totalPages={totalPages}
            basePath={`/admin/dashboard/users/${id}/history`}
          />
        </div>
      </ContentForm>
    </section>
  );
}
