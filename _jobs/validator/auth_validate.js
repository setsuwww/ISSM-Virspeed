import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/_lib/prisma"

export const loginSchema = z.object({
    email: z.string().email("Email is not valid"),
    password: z.string().min(1, "Password is required"),
})

export async function validateLogin(data) {
    const parsed = loginSchema.safeParse(data)

    if (!parsed.success) {
        return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
        }
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    })

    if (!user) {
        return {
            success: false,
            error: "Email is not registered",
        }
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
        return {
            success: false,
            error: "Password is wrong",
        }
    }

    if (user.isLocked) {
        return {
            success: false,
            error: "Account is locked",
        }
    }

    return {
        success: true,
        user,
    }
}
