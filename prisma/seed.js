import {
  PrismaClient,
  Role,
  ShiftType,
  LocationType,
  LocationStatus,
  AttendanceStatus,
} from "@prisma/client"

import bcrypt from "bcryptjs"
import { addDays, startOfDay } from "date-fns"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding real data...")

  // =============================
  // LOCATIONS
  // =============================
  const locJS = await prisma.location.create({
    data: {
      name: "JS - Lintasarta",
      location: "Jakarta Selatan",
      latitude: -6.2615,
      longitude: 106.8106,
      radius: 100,
      type: LocationType.WFO,
      status: LocationStatus.ACTIVE,
      startTime: 480,
      endTime: 1020,
    },
  })

  const locJU = await prisma.location.create({
    data: {
      name: "JU - Lintasarta",
      location: "Jakarta Utara",
      latitude: -6.1381,
      longitude: 106.8636,
      radius: 100,
      type: LocationType.WFO,
      status: LocationStatus.ACTIVE,
      startTime: 480,
      endTime: 1020,
    },
  })

  const locBDG = await prisma.location.create({
    data: {
      name: "BDG - Lintasarta",
      location: "Bandung",
      latitude: -6.9175,
      longitude: 107.6191,
      radius: 100,
      type: LocationType.WFO,
      status: LocationStatus.ACTIVE,
      startTime: 480,
      endTime: 1020,
    },
  })

  const locJOG = await prisma.location.create({
    data: {
      name: "JOG - Lintasarta",
      location: "Yogyakarta",
      latitude: -7.7956,
      longitude: 110.3695,
      radius: 100,
      type: LocationType.WFO,
      status: LocationStatus.ACTIVE,
      startTime: 480,
      endTime: 1020,
    },
  })

  const locJBR = await prisma.location.create({
    data: {
      name: "JBR - Lintasarta",
      location: "Jawa Barat",
      latitude: -6.9034,
      longitude: 107.5731,
      radius: 100,
      type: LocationType.WFO,
      status: LocationStatus.ACTIVE,
      startTime: 480,
      endTime: 1020,
    },
  })

  // =============================
  // SHIFTS
  // =============================
  async function createShifts(locationId) {
    const morning = await prisma.shift.create({
      data: {
        name: "Morning Shift",
        type: ShiftType.MORNING,
        startTime: 480,
        endTime: 960,
        locationId,
      },
    })

    const afternoon = await prisma.shift.create({
      data: {
        name: "Afternoon Shift",
        type: ShiftType.AFTERNOON,
        startTime: 960,
        endTime: 1320,
        locationId,
      },
    })

    const evening = await prisma.shift.create({
      data: {
        name: "Evening Shift",
        type: ShiftType.EVENING,
        startTime: 1320,
        endTime: 1800,
        locationId,
      },
    })

    return { morning, afternoon, evening }
  }

  const jsShift = await createShifts(locJS.id)
  const juShift = await createShifts(locJU.id)
  const bdgShift = await createShifts(locBDG.id)
  const jogShift = await createShifts(locJOG.id)
  const jbrShift = await createShifts(locJBR.id)

  // =============================
  // USER CREATOR
  // =============================
  async function createUser(
    name,
    email,
    shiftId,
    locationId,
    role
  ) {
    const hashedPassword = await bcrypt.hash("123456", 10)

    return prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === Role.ADMIN ? Role.ADMIN : Role.EMPLOYEE,
        shiftId,
        locationId,
      },
    })
  }

  // =============================
  // USERS
  // =============================
  const users = [
    // ADMIN (NO SHIFT)
    await createUser("Super Admin", "admin@lintasarta.com", null, locJS.id, Role.ADMIN),

    // JS
    await createUser("Andi", "andi@mail.com", jsShift.morning.id, locJS.id),
    await createUser("Budi", "budi@mail.com", jsShift.afternoon.id, locJS.id),
    await createUser("Citra", "citra@mail.com", jsShift.evening.id, locJS.id),
    await createUser("Dewi", "dewi@mail.com", jsShift.morning.id, locJS.id),
    await createUser("Eko", "eko@mail.com", jsShift.afternoon.id, locJS.id),

    // JU
    await createUser("Fajar", "fajar@mail.com", juShift.morning.id, locJU.id),
    await createUser("Gilang", "gilang@mail.com", juShift.afternoon.id, locJU.id),
    await createUser("Hendra", "hendra@mail.com", juShift.evening.id, locJU.id),
    await createUser("Indra", "indra@mail.com", juShift.morning.id, locJU.id),
    await createUser("Joko", "joko@mail.com", juShift.afternoon.id, locJU.id),

    // BDG
    await createUser("Kevin", "kevin@mail.com", bdgShift.morning.id, locBDG.id),
    await createUser("Lina", "lina@mail.com", bdgShift.afternoon.id, locBDG.id),
    await createUser("Maya", "maya@mail.com", bdgShift.evening.id, locBDG.id),
    await createUser("Nina", "nina@mail.com", bdgShift.morning.id, locBDG.id),
    await createUser("Oki", "oki@mail.com", bdgShift.afternoon.id, locBDG.id),

    // JOG
    await createUser("Putra", "putra@mail.com", jogShift.morning.id, locJOG.id),
    await createUser("Qori", "qori@mail.com", jogShift.afternoon.id, locJOG.id),
    await createUser("Rian", "rian@mail.com", jogShift.evening.id, locJOG.id),
    await createUser("Sari", "sari@mail.com", jogShift.morning.id, locJOG.id),
    await createUser("Tono", "tono@mail.com", jogShift.afternoon.id, locJOG.id),

    // JBR
    await createUser("Umar", "umar@mail.com", jbrShift.morning.id, locJBR.id),
    await createUser("Vina", "vina@mail.com", jbrShift.afternoon.id, locJBR.id),
    await createUser("Wawan", "wawan@mail.com", jbrShift.evening.id, locJBR.id),
    await createUser("Xena", "xena@mail.com", jbrShift.morning.id, locJBR.id),
    await createUser("Yoga", "yoga@mail.com", jbrShift.afternoon.id, locJBR.id),
  ]

  // =============================
  // SHIFT MAP (ANTI N+1)
  // =============================
  const shiftMap = Object.fromEntries(
    (await prisma.shift.findMany()).map(s => [s.id, s])
  )

  console.log("SEED SUCCESS")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
