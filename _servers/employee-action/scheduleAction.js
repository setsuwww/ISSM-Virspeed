"use server"

import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import { revalidatePath } from "next/cache"

export async function createReminder(scheduleId) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  await prisma.scheduleReminder.upsert({
    where: {
      scheduleId_userId: {
        scheduleId,
        userId: user.id,
      },
    },
    update: {},
    create: {
      scheduleId,
      userId: user.id,
      remindAt: new Date(),
    },
  })

  revalidatePath("/employee/dashboard/my-schedule")
}

export async function deleteSchedule(scheduleId) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  await prisma.schedule.delete({
    where: { id: scheduleId },
  })

  revalidatePath("/employee/dashboard/my-schedule")
}
