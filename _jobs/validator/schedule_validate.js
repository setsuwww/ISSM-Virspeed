import { z } from "zod"

export const createScheduleSchema = z.object({
    title: z.string().min(2, "Title is required"),
    description: z.string().optional().nullable(),
    frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "ONCE"]).optional().default("ONCE"),
    startDate: z.string().optional().nullable(),
    startTime: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    endTime: z.string().optional().nullable(),
    locationId: z.number().int().optional().nullable(),
    isActive: z.boolean().optional().default(true),
    userIds: z.array(z.string()).optional(),
})

export const updateScheduleSchema = z.object({
    id: z.number().int(),
    title: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "ONCE"]).optional(),
    startDate: z.string().optional().nullable(),
    startTime: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    endTime: z.string().optional().nullable(),
    locationId: z.number().int().optional().nullable(),
    isActive: z.boolean().optional(),
    userIds: z.array(z.string()).optional(),
})

export async function validateCreateSchedule(data) {
    const parsed = createScheduleSchema.safeParse(data)
    if (!parsed.success) {
        return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
        }
    }
    return {
        success: true,
        data: parsed.data,
    }
}

export async function validateUpdateSchedule(data) {
    const parsed = updateScheduleSchema.safeParse(data)
    if (!parsed.success) {
        return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
        }
    }
    return {
        success: true,
        data: parsed.data,
    }
}
