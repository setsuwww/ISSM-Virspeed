import {
    PrismaClient,
} from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const hashedPassword = await bcrypt.hash("password", 10)

const user = await prisma.user.create({
    data: {
        name: "Keisya Zaskia",
        email: "keysza@next.com",
        role: "ADMIN",
        password: hashedPassword,
    },
})

console.log(user)
