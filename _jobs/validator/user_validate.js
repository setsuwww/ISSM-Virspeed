import { z } from "zod"
import { prisma } from "@/_lib/prisma"

export const createUserSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().optional(),
    role: z.string().optional(),
    workMode: z.string().optional(),
    locationId: z.union([z.string(), z.number()]).optional().nullable(),
    shiftId: z.union([z.string(), z.number()]).optional().nullable(),
})

export const updateUserSchema = z.object({
    id: z.string(),
    name: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
    role: z.string().optional(),
    workMode: z.string().optional(),
    locationId: z.union([z.string(), z.number()]).optional().nullable(),
    shiftId: z.union([z.string(), z.number()]).optional().nullable(),
})

export async function validateCreateUser(data) {
    const parsed = createUserSchema.safeParse(data)

    if (!parsed.success) {
        return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
        }
    }

    const email = parsed.data.email.toLowerCase()

    const existing = await prisma.user.findUnique({
        where: { email },
    })

    if (existing) {
        return {
            success: false,
            errors: { email: ["Email already registered"] },
        }
    }

    return {
        success: true,
        data: parsed.data,
    }
}

export async function validateUpdateUser(data) {
    const parsed = updateUserSchema.safeParse(data)

    if (!parsed.success) {
        return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
        }
    }

    const { id, email } = parsed.data

    if (email) {
        const existing = await prisma.user.findFirst({
            where: {
                email: email.toLowerCase(),
                NOT: { id },
            },
        })

        if (existing) {
            return {
                success: false,
                errors: { email: ["Email already used by another user"] },
            }
        }
    }

    return {
        success: true,
        data: parsed.data,
    }
}
