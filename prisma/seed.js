import {
  PrismaClient,
  Role,
  ShiftType,
  LocationType,
  LocationStatus,
  AttendanceStatus
} from "@prisma/client"

import bcrypt from "bcryptjs"
import ora from "ora"

const prisma = new PrismaClient()

const SHIFT_PATTERN = ["MORNING", "AFTERNOON", "EVENING", "OFF"]

function normalizeDate(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function buildShiftDateTime(baseDate, start, end) {
  const workStart = new Date(baseDate)
  workStart.setMinutes(start)

  const workEnd = new Date(baseDate)
  workEnd.setMinutes(end)

  // handle overnight shift
  if (end <= start) {
    workEnd.setDate(workEnd.getDate() + 1)
  }

  return { workStart, workEnd }
}

async function main() {
  const spinner = ora("Seeding structured system...").start()

  try {
    // -----------------------------
    // CLEAN (child → parent)
    // -----------------------------
    await prisma.attendance.deleteMany()
    await prisma.shiftAssignment.deleteMany()
    await prisma.user.deleteMany()
    await prisma.shift.deleteMany()
    await prisma.location.deleteMany()

    // -----------------------------
    // LOCATIONS
    // -----------------------------
    await prisma.location.createMany({
      data: [
        { name: "Jakarta Selatan", type: LocationType.WFO, status: LocationStatus.ACTIVE },
        { name: "Jawa Barat", type: LocationType.WFO, status: LocationStatus.ACTIVE },
        { name: "Jakarta Timur", type: LocationType.WFO, status: LocationStatus.ACTIVE },
      ],
    })

    const locationList = await prisma.location.findMany()

    // -----------------------------
    // SHIFTS
    // -----------------------------
    await prisma.shift.createMany({
      data: [
        { name: "Morning", type: ShiftType.MORNING, startTime: 8 * 60, endTime: 16 * 60 },
        { name: "Afternoon", type: ShiftType.AFTERNOON, startTime: 16 * 60, endTime: 23 * 60 },
        { name: "Evening", type: ShiftType.EVENING, startTime: 23 * 60, endTime: 8 * 60 },
      ],
    })

    const shiftList = await prisma.shift.findMany()
    const shiftMap = new Map(shiftList.map(s => [s.type, s]))

    // -----------------------------
    // ADMIN & SUPERVISOR
    // -----------------------------
    const adminPassword = await bcrypt.hash("admin123", 10)
    const supervisorPassword = await bcrypt.hash("supervisor123", 10)

    await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@system.com",
        password: adminPassword,
        role: Role.ADMIN,
        locationId: locationList[0].id,
        shiftId: shiftList[0].id,
      },
    })

    await prisma.user.create({
      data: {
        name: "Supervisor",
        email: "supervisor@system.com",
        password: supervisorPassword,
        role: Role.SUPERVISOR,
        locationId: locationList[1].id,
        shiftId: shiftList[1].id,
      },
    })

    // -----------------------------
    // USERS
    // -----------------------------
    const usersRaw = Array.from({ length: 20 }).map((_, i) => ({
      name: `User-${i + 1}`,
      email: `user${i + 1}@test.com`,
      role: Role.EMPLOYEE,
    }))

    const users = []

    for (let i = 0; i < usersRaw.length; i++) {
      const hash = await bcrypt.hash("password123", 10)

      const assignedShift = shiftList[i % shiftList.length]

      const user = await prisma.user.create({
        data: {
          ...usersRaw[i],
          password: hash,
          locationId: locationList[i % locationList.length].id,
          shiftId: assignedShift.id, // we keep a default shift, but daily uses assignments
        },
      })

      users.push(user)
    }

    // -----------------------------
    // ASSIGNMENT + ATTENDANCE
    // -----------------------------
    const baseDate = normalizeDate(new Date())

    const assignments = []
    const attendances = []

    users.forEach((user, idx) => {
      const startIndex = idx % SHIFT_PATTERN.length

      for (let i = 0; i < 14; i++) {
        const date = new Date(baseDate)
        date.setDate(baseDate.getDate() + i)

        const shiftTypePattern = SHIFT_PATTERN[(startIndex + i) % SHIFT_PATTERN.length]
        const shift = shiftTypePattern !== "OFF" ? shiftMap.get(shiftTypePattern) : null

        const isLeave = Math.random() < 0.1

        let workStart = null
        let workEnd = null

        if (shift) {
          const built = buildShiftDateTime(date, shift.startTime, shift.endTime)
          workStart = built.workStart
          workEnd = built.workEnd
        }

        assignments.push({
          userId: user.id,
          date,
          shiftId: shift ? shift.id : null,
          isLeave,
        })

        if (shift && !isLeave) {
          const checkIn = new Date(workStart.getTime() - 5 * 60000) // check in 5 minutes early
          const checkOut = new Date(workEnd.getTime() + 5 * 60000)  // check out 5 minutes late

          attendances.push({
            userId: user.id,
            shiftId: shift.id,
            date,
            workStart,
            workEnd,
            status: AttendanceStatus.PRESENT,
            checkInTime: checkIn,
            checkOutTime: checkOut,
            workMinutes: Math.floor((checkOut - checkIn) / 60000),
          })
        }
      }
    })

    await prisma.shiftAssignment.createMany({
      data: assignments,
      skipDuplicates: true,
    })

    await prisma.attendance.createMany({
      data: attendances,
      skipDuplicates: true,
    })

    spinner.succeed("Seeding complete (rolling M-A-E-OFF pattern)")
  } catch (err) {
    spinner.fail("Seeding failed")
    console.error(err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
