import { z } from "zod"

export const createShiftSchema = z.object({
    name: z.string().min(2, "Name is required"),
    type: z.enum(["OFF", "MORNING", "AFTERNOON", "EVENING", "CUSTOM"], {
        message: "Invalid shift type"
    }),
    startTime: z.number().int().min(0).max(1439).optional(), // minutes from midnight
    endTime: z.number().int().min(0).max(1439).optional(),
    isActive: z.boolean().optional().default(true),
    locationId: z.number().int().optional().nullable(),
})

export const updateShiftSchema = z.object({
    id: z.number().int(),
    name: z.string().min(2).optional(),
    type: z.enum(["OFF", "MORNING", "AFTERNOON", "EVENING", "CUSTOM"]).optional(),
    startTime: z.number().int().min(0).max(1439).optional(),
    endTime: z.number().int().min(0).max(1439).optional(),
    isActive: z.boolean().optional(),
    locationId: z.number().int().optional().nullable(),
})

export async function validateCreateShift(data) {
    const parsed = createShiftSchema.safeParse(data)
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

export async function validateUpdateShift(data) {
    const parsed = updateShiftSchema.safeParse(data)
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
