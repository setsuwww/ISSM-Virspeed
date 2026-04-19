import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    console.log("💣 Clearing database (safe order)...")

    // =============================
    // DELETE CHILD FIRST
    // =============================
    await prisma.earlyCheckoutRequest.deleteMany()
    await prisma.attendance.deleteMany()
    await prisma.shiftAssignment.deleteMany()

    await prisma.shiftChangeRequest.deleteMany()
    await prisma.leaveRequest.deleteMany()
    await prisma.userLeaveBalance.deleteMany()

    await prisma.scheduleReminder.deleteMany()
    await prisma.schedulesOnUsers.deleteMany()
    await prisma.schedule.deleteMany()

    await prisma.passwordResetToken.deleteMany()

    await prisma.activityLog.deleteMany()
    await prisma.securityLog.deleteMany()
    await prisma.suspiciousActivity.deleteMany()

    // =============================
    // DELETE MAIN RELATION
    // =============================
    await prisma.user.deleteMany()
    await prisma.shift.deleteMany()
    await prisma.location.deleteMany()

    console.log("✅ Database cleared")

    // =============================
    // CREATE USERS
    // =============================
    const password = await bcrypt.hash("123456", 10)

    const admin = await prisma.user.create({
        data: {
            name: "Admin",
            email: "admin@mail.com",
            password,
            role: Role.ADMIN,
        },
    })

    const employee = await prisma.user.create({
        data: {
            name: "Employee",
            email: "employee@mail.com",
            password,
            role: Role.EMPLOYEE,
        },
    })

    console.log("✅ Done:", { admin, employee })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
