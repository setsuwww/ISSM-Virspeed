"use server";

import { prisma } from "@/_lib/prisma";
import dayjs from "dayjs";

function calculateWorkingHours(attendances) {
  let totalMinutes = 0;
  for (const att of attendances) {
    if (!att.checkInTime || !att.checkOutTime) continue;
    if (["PRESENT", "LATE", "EARLY_CHECKOUT"].includes(att.status)) {
      let checkIn = dayjs(att.checkInTime);
      let checkOut = dayjs(att.checkOutTime);

      if (checkOut.isBefore(checkIn)) {
        checkOut = checkOut.add(1, 'day');
      }

      const diffMinutes = Math.max(0, checkOut.diff(checkIn, 'minute'));
      // Deduct 1 hr break
      const finalMinutes = Math.max(0, diffMinutes - 60);
      totalMinutes += finalMinutes;
    }
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export async function getMonthlyReport(page = 1, limit = 10, search = "", month, year) {
  const currentMonth = month ? Number(month) : dayjs().month() + 1;
  const currentYear = year ? Number(year) : dayjs().year();

  const startDate = dayjs(`${currentYear}-${currentMonth}-01`).startOf('month').toDate();
  const endDate = dayjs(startDate).endOf('month').toDate();

  const skip = (page - 1) * limit;

  const whereClause = {
    role: { in: ["USER", "EMPLOYEE", "SUPERVISOR"] },
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {})
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        role: true,
        attendances: {
          where: {
            date: {
              gte: startDate,
              lte: endDate
            }
          },
          select: {
            status: true,
            checkInTime: true,
            checkOutTime: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { name: "asc" }
    }),
    prisma.user.count({ where: whereClause })
  ]);

  const reportData = users.map(user => {
    let present = 0;
    let late = 0;
    let permission = 0;
    let leave = 0;
    let earlyCheckout = 0;
    let absent = 0;

    user.attendances.forEach(att => {
      switch (att.status) {
        case "PRESENT": present++; break;
        case "LATE": late++; break;
        case "PERMISSION": permission++; break;
        case "LEAVE": leave++; break;
        case "EARLY_CHECKOUT": earlyCheckout++; break;
        case "ABSENT": absent++; break;
      }
    });

    const totalWorkingHours = calculateWorkingHours(user.attendances);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      role: user.role,
      present,
      late,
      permission,
      leave,
      earlyCheckout,
      absent,
      totalWorkingHours
    };
  });

  return { data: reportData, total };
}

export async function getUserMonthlyDetail(userId, month, year) {
  const currentMonth = month ? Number(month) : dayjs().month() + 1;
  const currentYear = year ? Number(year) : dayjs().year();

  const startDate = dayjs(`${currentYear}-${currentMonth}-01`).startOf('month').toDate();
  const endDate = dayjs(startDate).endOf('month').toDate();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      location: { select: { name: true } }
    }
  });

  if (!user) return null;

  const attendances = await prisma.attendance.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      shift: { select: { name: true } }
    },
    orderBy: { date: 'asc' }
  });

  let present = 0;
  let late = 0;
  let permission = 0;
  let leave = 0;
  let earlyCheckout = 0;
  let absent = 0;
  let totalMinutes = 0;
  let workingDays = 0;

  const dailyDetails = attendances.map(att => {
    switch (att.status) {
      case "PRESENT": present++; break;
      case "LATE": late++; break;
      case "PERMISSION": permission++; break;
      case "LEAVE": leave++; break;
      case "EARLY_CHECKOUT": earlyCheckout++; break;
      case "ABSENT": absent++; break;
    }

    let finalHours = "0h 0m";
    let breakTime = "0h 0m";
    let totalJam = "0h 0m";

    if (["PRESENT", "LATE", "EARLY_CHECKOUT"].includes(att.status)) {
      workingDays++;
      if (att.checkInTime && att.checkOutTime) {
        let checkIn = dayjs(att.checkInTime);
        let checkOut = dayjs(att.checkOutTime);

        // If checkout is before checkin, assume it crosses midnight to the next day
        if (checkOut.isBefore(checkIn)) {
          checkOut = checkOut.add(1, 'day');
        }

        const diffMins = Math.max(0, checkOut.diff(checkIn, 'minute'));

        totalJam = `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;

        const actBreakMins = 60; // 1 hour break
        breakTime = `1h 0m`;

        const finalMins = Math.max(0, diffMins - actBreakMins);
        totalMinutes += finalMins;
        finalHours = `${Math.floor(finalMins / 60)}h ${finalMins % 60}m`;
      }
    }

    return {
      id: att.id,
      date: att.date,
      shift: att.shift?.name || "-",
      checkin: att.checkInTime,
      checkout: att.checkOutTime,
      totalJam,
      break: breakTime,
      finalWorkingHours: finalHours,
      status: att.status
    };
  });

  const totalWorkingHours = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
  const averageMins = workingDays > 0 ? Math.floor(totalMinutes / workingDays) : 0;
  const averageWorkingHours = `${Math.floor(averageMins / 60)}h ${averageMins % 60}m`;

  return {
    user: {
      ...user,
      department: user.location?.name || "-"
    },
    stats: {
      present,
      late,
      permission,
      leave,
      earlyCheckout,
      absent,
      totalWorkingHours,
      workingDays,
      averageWorkingHours
    },
    dailyDetails
  };
}
