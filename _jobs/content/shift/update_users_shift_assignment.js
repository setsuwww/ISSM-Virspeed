"use server"

import { prisma } from "@/_lib/prisma"
import { shiftQueue } from "@/_lib/queue"
import { generateUserShiftAssignments } from "./auto_rotate_shift"

export async function updateUsersShiftAssignment() {
    const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true },
    })

    const today = new Date()

    // 🔥 ambil assignment terakhir semua user (anti N+1)
    const assignments = await prisma.shiftAssignment.findMany({
        where: {
            userId: { in: users.map(u => u.id) }
        },
        orderBy: { date: "asc" }
    })

    // group by user
    const map = {}
    for (const a of assignments) {
        if (!map[a.userId]) map[a.userId] = []
        map[a.userId].push(a)
    }

    const allCreates = []

    for (const user of users) {
        const existing = map[user.id] || []

        const newAssignments = generateUserShiftAssignments({
            userId: user.id,
            existingAssignments: existing,
            startDate: today,
            totalDays: 7, // generate 7 hari ke depan
        })

        allCreates.push(...newAssignments)
    }

    if (allCreates.length > 0) {
        await prisma.shiftAssignment.createMany({
            data: allCreates,
            skipDuplicates: true, // 🔥 anti double
        })
    }

    return { success: true, total: allCreates.length }
}

export async function dispatchShiftJobs() {
    const users = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true },
    })

    for (const user of users) {
        await shiftQueue.add("rotate-shift", {
            userId: user.id,
        })
    }

    return { success: true, total: users.length }
}
