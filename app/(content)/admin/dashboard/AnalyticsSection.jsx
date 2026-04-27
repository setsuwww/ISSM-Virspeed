import { prisma } from "@/_lib/prisma"
import AnalyticsDiagram from "./AnalyticsDiagram"

export default async function AnalyticsSection() {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 29)
    startDate.setHours(0, 0, 0, 0)

    const rawAttendances = await prisma.attendance.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            date: true,
            status: true,
        },
        orderBy: { date: "asc" },
    })

    const data = rawAttendances.map((a) => ({
        date: a.date.toISOString(),
        status: a.status,
    }))

    return <AnalyticsDiagram attendanceRaw={data} />
}
