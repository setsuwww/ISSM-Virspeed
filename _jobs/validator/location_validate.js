import { z } from "zod"

export const createLocationSchema = z.object({
    name: z.string().min(2, "Name is required"),
    location: z.string().optional().nullable(),
    longitude: z.number().optional().nullable(),
    latitude: z.number().optional().nullable(),
    radius: z.number().optional().nullable(),
    type: z.enum(["WFO", "WFA"]).optional().default("WFO"),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("INACTIVE"),
    startTime: z.number().int().min(0).max(1439).optional().nullable(),
    endTime: z.number().int().min(0).max(1439).optional().nullable(),
    parentId: z.number().int().optional().nullable(),
})

export const updateLocationSchema = z.object({
    id: z.number().int(),
    name: z.string().min(2).optional(),
    location: z.string().optional().nullable(),
    longitude: z.number().optional().nullable(),
    latitude: z.number().optional().nullable(),
    radius: z.number().optional().nullable(),
    type: z.enum(["WFO", "WFA"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    startTime: z.number().int().min(0).max(1439).optional().nullable(),
    endTime: z.number().int().min(0).max(1439).optional().nullable(),
    parentId: z.number().int().optional().nullable(),
})

export async function validateCreateLocation(data) {
    const parsed = createLocationSchema.safeParse(data)
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

export async function validateUpdateLocation(data) {
    const parsed = updateLocationSchema.safeParse(data)
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
