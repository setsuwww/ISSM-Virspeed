import { Worker } from "bullmq"
import IORedis from "ioredis"
import { prisma } from "@/_lib/prisma"
import { generateUserShiftAssignments } from "./auto_rotate_shift"

const connection = new IORedis({
    host: "127.0.0.1",
    port: 6379,
})

export const shiftWorker = new Worker(
    "shift-queue",
    async (job) => {
        const { userId } = job.data

        console.log("Processing user:", userId)

        const existingAssignments = await prisma.shiftAssignment.findMany({
            where: { userId },
            orderBy: { date: "asc" },
        })

        const newAssignments = generateUserShiftAssignments({
            userId,
            existingAssignments,
            startDate: new Date(),
            totalDays: 7,
        })

        if (newAssignments.length > 0) {
            await prisma.shiftAssignment.createMany({
                data: newAssignments,
                skipDuplicates: true,
            })
        }

        return { success: true }
    },
    { connection, concurrency: 5 } // 🔥 bisa paralel tapi tetap terkontrol
)
