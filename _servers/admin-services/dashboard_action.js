"use server"

import { prisma } from "@/_lib/prisma"

export async function getDashboardStats() {
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
    ] = await Promise.all([
        // USER
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { isActive: false } }),

        // MASTER DATA
        prisma.location.count(),
        prisma.shift.count(),
        prisma.schedule.count(),

        // ATTENDANCE TOTAL
        prisma.attendance.count(),

        // ATTENDANCE STATUS
        prisma.attendance.count({ where: { status: "PRESENT" } }),
        prisma.attendance.count({ where: { status: "ABSENT" } }),
        prisma.attendance.count({ where: { status: "LATE" } }),
        prisma.attendance.count({ where: { status: "PERMISSION" } }),

        // SHIFT DISTRIBUTION
        prisma.user.count({ where: { shift: { type: "MORNING" } } }),
        prisma.user.count({ where: { shift: { type: "AFTERNOON" } } }),
        prisma.user.count({ where: { shift: { type: "EVENING" } } }),
    ])

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
    }
}
