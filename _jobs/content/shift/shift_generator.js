const SHIFT_ORDER = ["MORNING", "AFTERNOON", "EVENING"]

export async function generateShiftAssignments(userId, startDate, days = 30) {
    const shifts = await prisma.shift.findMany({
        where: { isActive: true },
        orderBy: { id: "asc" }
    })

    if (!shifts.length) throw new Error("No shifts available")

    const rotation = [...shifts, null]

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)

        const shiftIndex = i % rotation.length
        const shift = rotation[shiftIndex]

        await prisma.shiftAssignment.upsert({
            where: {
                userId_date: {
                    userId,
                    date,
                },
            },
            update: {},
            create: {
                userId,
                shiftId: shift?.id ?? null,
                date,
            },
        })
    }
}

export async function getActiveShiftAssignment(userId) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return prisma.shiftAssignment.findUnique({
        where: {
            userId_date: {
                userId,
                date: today,
            },
        },
        include: {
            shift: true,
        },
    })
}

export function getNextShift(currentType, count) {
    if (count > 0 && count % 3 === 0) {
        return { type: "OFF", reset: true }
    }

    const idx = SHIFT_ORDER.indexOf(currentType)

    if (idx === -1) {
        return { type: SHIFT_ORDER[0], reset: false }
    }

    const nextIdx = (idx + 1) % SHIFT_ORDER.length

    return {
        type: SHIFT_ORDER[nextIdx],
        reset: false,
    }
}

export async function generateNextShift(userId) {
    // ambil assignment terakhir
    const last = await prisma.shiftAssignment.findFirst({
        where: { userId },
        orderBy: { date: "desc" },
        include: { shift: true },
    })

    let nextDate = new Date()
    nextDate.setHours(0, 0, 0, 0)

    if (last) {
        nextDate = new Date(last.date)
        nextDate.setDate(nextDate.getDate() + 1)
    }

    // hitung cycle
    let count = 0
    let currentType = last?.shift?.type ?? "MORNING"

    if (last) {
        const last3 = await prisma.shiftAssignment.findMany({
            where: { userId },
            orderBy: { date: "desc" },
            take: 3,
            include: { shift: true },
        })

        count = last3.filter(a => a.shift?.type !== "OFF").length
    }

    const { type, reset } = getNextShift(currentType, count)

    let shift = null

    if (type !== "OFF") {
        shift = await prisma.shift.findFirst({
            where: { type },
        })
    }

    await prisma.shiftAssignment.create({
        data: {
            userId,
            shiftId: shift?.id ?? null,
            date: nextDate,
        },
    })

    return { success: true, type }
}

