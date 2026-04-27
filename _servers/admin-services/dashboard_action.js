"use server"

import { prisma } from "@/_lib/prisma"

export async function getDashboardStats() {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const [
        totalUsers,
        activeUsers,
        inactiveUsers,

        totalLocations,
        totalShifts,
        totalSchedules,

        totalAttendances,

        presentCount,
        absentCount,
        lateCount,
        permissionCount,

        morningEmployees,
        afternoonEmployees,
        eveningEmployees,

        morningStatsRaw,
        afternoonStatsRaw,
        eveningStatsRaw,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { isActive: false } }),

        prisma.location.count(),
        prisma.shift.count(),
        prisma.schedule.count(),

        prisma.attendance.count(),

        prisma.attendance.count({ where: { status: "PRESENT" } }),
        prisma.attendance.count({ where: { status: "ABSENT" } }),
        prisma.attendance.count({ where: { status: "LATE" } }),
        prisma.attendance.count({ where: { status: "PERMISSION" } }),

        prisma.user.count({ where: { shift: { type: "MORNING" } } }),
        prisma.user.count({ where: { shift: { type: "AFTERNOON" } } }),
        prisma.user.count({ where: { shift: { type: "EVENING" } } }),

        prisma.attendance.groupBy({
            by: ["status"],
            where: { date: { gte: todayStart, lte: todayEnd }, shift: { type: "MORNING" } },
            _count: { status: true },
        }),

        prisma.attendance.groupBy({
            by: ["status"],
            where: { date: { gte: todayStart, lte: todayEnd }, shift: { type: "AFTERNOON" } },
            _count: { status: true },
        }),

        prisma.attendance.groupBy({
            by: ["status"],
            where: { date: { gte: todayStart, lte: todayEnd }, shift: { type: "EVENING" } },
            _count: { status: true },
        }),
    ])

    const formatStats = (rows) =>
        rows.reduce((acc, r) => {
            acc[r.status] = r._count.status
            return acc
        }, {})

    return {
        users: {
            total: totalUsers,
            active: activeUsers,
            inactive: inactiveUsers,
        },

        master: {
            locations: totalLocations,
            shifts: totalShifts,
            schedules: totalSchedules,
        },

        attendance: {
            total: totalAttendances,
            status: {
                present: presentCount,
                absent: absentCount,
                late: lateCount,
                permission: permissionCount,
            },
        },

        shiftDistribution: {
            morning: morningEmployees,
            afternoon: afternoonEmployees,
            evening: eveningEmployees,
        },

        shiftStats: {
            morning: formatStats(morningStatsRaw),
            afternoon: formatStats(afternoonStatsRaw),
            evening: formatStats(eveningStatsRaw),
        },
    }
}
