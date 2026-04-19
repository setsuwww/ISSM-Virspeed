import { generateBulkSchedule } from "@/_servers/shift_system_action"

export async function generateDailySchedule() {
    const users = await prisma.user.findMany({
        where: { isLocked: false },
        select: { id: true },
    })

    const userIds = users.map((u) => u.id)

    await generateBulkSchedule({
        userIds,
        startDate: new Date(),
        totalDays: 1,
    })
}
