import {
    PrismaClient,
} from "@prisma/client"

const prisma = new PrismaClient()

await prisma.shift.createMany({
    data: [
        {
            name: "Morning Shift",
            type: "MORNING",
            startTime: 800,
            endTime: 1600,
        },
        {
            name: "Afternoon Shift",
            type: "AFTERNOON",
            startTime: 1600,
            endTime: 2400,
        },
        {
            name: "Evening Shift",
            type: "EVENING",
            startTime: 0,
            endTime: 800,
        },
    ],
})
