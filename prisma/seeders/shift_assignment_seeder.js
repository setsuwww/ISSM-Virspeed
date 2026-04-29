import {
    PrismaClient,
} from "@prisma/client"

const prisma = new PrismaClient()

const today = new Date()
today.setHours(0, 0, 0, 0)

const morning = await prisma.shift.findFirst({
    where: { type: "MORNING" }
})

await prisma.shiftAssignment.create({
    data: {
        userId: user.id,
        shiftId: morning.id,
        date: today,
    }
})
