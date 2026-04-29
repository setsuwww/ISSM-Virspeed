import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    console.log("🌱 Seeding start...")

    // ========================
    // 1. LOCATION
    // ========================
    const locations = await Promise.all([
        prisma.location.create({
            data: {
                name: "HQ Jakarta",
                type: "WFO",
                status: "ACTIVE",
                startTime: 480,
                endTime: 1020,
            },
        }),
        prisma.location.create({
            data: {
                name: "Remote Area",
                type: "WFA",
                status: "ACTIVE",
                startTime: 540,
                endTime: 1080,
            },
        }),
    ])

    // ========================
    // 2. SHIFTS
    // ========================
    const shifts = await Promise.all([
        prisma.shift.create({
            data: {
                name: "Morning Shift",
                type: "MORNING",
                startTime: 480,
                endTime: 960,
                locationId: locations[0].id,
            },
        }),
        prisma.shift.create({
            data: {
                name: "Afternoon Shift",
                type: "AFTERNOON",
                startTime: 960,
                endTime: 1440,
                locationId: locations[0].id,
            },
        }),
        prisma.shift.create({
            data: {
                name: "Night Shift",
                type: "EVENING",
                startTime: 1440,
                endTime: 480,
                locationId: locations[1].id,
            },
        }),
    ])

    // ========================
    // 3. USERS
    // ========================
    const users = []

    for (let i = 1; i <= 5; i++) {
        const user = await prisma.user.create({
            data: {
                name: `User ${i}`,
                email: `user${i}@demo.com`,
                password: await bcrypt.hash("password123", 10),
                role: "EMPLOYEE",
                locationId: locations[i % 2].id,
                shiftId: shifts[i % 3].id,
            },
        })
        users.push(user)
    }

    // ========================
    // 4. SHIFT ASSIGNMENTS (IMPORTANT 🔥)
    // ========================
    const today = new Date()

    for (let u of users) {
        for (let d = 0; d < 5; d++) {
            await prisma.shiftAssignment.create({
                data: {
                    userId: u.id,
                    shiftId: shifts[(d + users.indexOf(u)) % 3].id,
                    date: new Date(today.getTime() + d * 86400000),
                },
            })
        }
    }

    // ========================
    // 5. LEAVE TYPES
    // ========================
    const leaveTypes = await Promise.all([
        prisma.leaveType.create({
            data: { code: "ANNUAL", name: "Annual Leave", category: "ANNUAL", maxDays: 12 },
        }),
        prisma.leaveType.create({
            data: { code: "SICK", name: "Sick Leave", category: "SICK", maxDays: 10 },
        }),
    ])

    // ========================
    // 6. LEAVE BALANCES
    // ========================
    for (let user of users) {
        for (let type of leaveTypes) {
            await prisma.userLeaveBalance.create({
                data: {
                    userId: user.id,
                    leaveTypeId: type.id,
                    year: 2026,
                    totalDays: type.maxDays,
                    usedDays: Math.floor(Math.random() * 3),
                },
            })
        }
    }

    // ========================
    // 7. LEAVE REQUESTS
    // ========================
    for (let user of users) {
        await prisma.leaveRequest.create({
            data: {
                userId: user.id,
                leaveTypeId: leaveTypes[0].id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 2 * 86400000),
                totalDays: 2,
                reason: "Liburan tipis-tipis 😏",
                status: "PENDING",
            },
        })
    }

    // ========================
    // 8. SCHEDULE
    // ========================
    const schedule = await prisma.schedule.create({
        data: {
            title: "Weekly Meeting",
            frequency: "WEEKLY",
            isActive: true,
        },
    })

    for (let user of users) {
        await prisma.schedulesOnUsers.create({
            data: {
                scheduleId: schedule.id,
                userId: user.id,
            },
        })
    }

    // ========================
    // 9. EARLY CHECKOUT REQUEST
    // ========================
    for (let user of users) {
        await prisma.earlyCheckoutRequest.create({
            data: {
                userId: user.id,
                reason: "Ada urusan mendadak",
                status: "PENDING",
            },
        })
    }

    // ========================
    // 10. LOGS
    // ========================
    for (let user of users) {
        await prisma.activityLog.create({
            data: {
                userId: user.id,
                url: "/demo",
                action: "CREATE",
                method: "POST",
            },
        })

        await prisma.securityLog.create({
            data: {
                userId: user.id,
                action: "LOGIN_SUCCESS",
            },
        })
    }

    console.log("✅ Seeding selesai. Database lu sekarang ga kosong kayak hati mantan.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
