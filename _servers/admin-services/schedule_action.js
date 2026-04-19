"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/_lib/prisma"
import { getCurrentUser } from "@/_lib/auth"
import { validateCreateSchedule, validateUpdateSchedule } from "@/_jobs/validator/schedule_validate"

export async function createSchedule(formData) {
  try {
    const result = await validateCreateSchedule(formData);
    
    if (!result.success) {
      return { success: false, message: Object.values(result.errors).flat().join(", ") };
    }
    
    const { title, description, frequency, startDate, startTime, endDate, endTime, userIds } = result.data;

    if (!userIds?.length) throw new Error("Missing users assigned to this schedule");

    const validUsers = await prisma.user.findMany({ where: { id: { in: userIds } }})

    if (validUsers.length !== userIds.length) { const missing = userIds.filter((id) => !validUsers.some((u) => u.id === Number(id)))
      throw new Error(`Some users not found: ${missing.join(", ")}`)
    }

    const schedule = await prisma.schedule.create({
      data: {
        title, description, frequency,
        startDate: new Date(startDate), startTime,
        endDate: new Date(endDate), endTime,
        users: { create: validUsers.map((u) => ({
            user: { connect: { id: u.id } },
          })),
        },
      },
      include: { users: { include: { user: true } } },
    })
    revalidatePath("/admin/dashboard/schedules")

    return { success: true, data: schedule }
  }
  catch (error) { return { success: false, message: error.message || "Failed to create schedule" }}
}

export async function updateSchedule(data) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  if (!data || typeof data !== "object") { throw new Error("Invalid or missing data object")}

  const result = await validateUpdateSchedule({ id: Number(data.id), ...data });
  
  if (!result.success) {
    return { success: false, message: Object.values(result.errors).flat().join(", ") };
  }

  const { id, title, description, frequency, startDate, startTime, endDate, endTime, userIds } = result.data;

  if (!userIds?.length) throw new Error("Missing users assigned to this schedule");

  const validUsers = await prisma.user.findMany({ where: { id: { in: userIds } }})

  const updated = await prisma.schedule.update({
    where: { id: Number(id) },
    data: {
      title, description, frequency: frequency || "ONCE",
      startDate: new Date(startDate), startTime,
      endDate: new Date(endDate), endTime,
      users: { deleteMany: {},
        create: validUsers.map((u) => ({
          user: { connect: { id: u.id } },
        })),
      },
    },
  })

  revalidatePath("/admin/dashboard/schedules")
  return { success: true, message: "Schedule updated successfully" }
}

export async function deleteScheduleById(id) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")

  if (!id) throw new Error("Missing schedule ID")

  await prisma.schedule.delete({ where: { id: Number(id) },})

  revalidatePath("/admin/dashboard/schedules")
  return { success: true, message: "Schedule deleted successfully" }
}

export async function deleteSchedules(ids = []) {
  const user = await getCurrentUser()
  if (!user) return { success: false, message: "Unauthorized" }

  try {
    if (ids.length > 0) {
      await prisma.schedule.deleteMany({
        where: { id: { in: ids.map(Number) } },
      })
    } else {
      await prisma.schedule.deleteMany()
    }

    revalidatePath("/admin/dashboard/schedules")
    return { success: true, message: "Schedules deleted successfully" }
  }
  catch (error) { return { success: false, message: "Failed to delete schedules" }}
}


