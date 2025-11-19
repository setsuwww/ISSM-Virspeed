import { PrismaClient, Role, ShiftType, LocationType, LocationStatus, FrequencyType, AttendanceStatus, ApprovalStatus, ShiftChangeStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting structured dummy seed...");

  await prisma.shiftChangeRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.schedulesOnUsers.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.userShiftAssignment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.division.deleteMany();
  await prisma.systemConfig.deleteMany();

  const systemConfigs = await prisma.systemConfig.createMany({
    data: [
      { allWfaActive: false },
      { allWfaActive: true },
      { allWfaActive: false },
    ]
  });

  const divisions = await prisma.division.createMany({
    data: [
      {
        name: "HQ Jakarta",
        location: "Jakarta Selatan",
        type: LocationType.WFO,
        status: LocationStatus.ACTIVE,
        longitude: 106.82,
        latitude: -6.21,
        radius: 100,
        startTime: 8 * 60,
        endTime: 17 * 60,
      },
      {
        name: "Bandung Branch",
        location: "Cimahi",
        type: LocationType.WFA,
        status: LocationStatus.ACTIVE,
        longitude: 107.61,
        latitude: -6.91,
        radius: 120,
        startTime: 9 * 60,
        endTime: 18 * 60,
      },
      {
        name: "Surabaya Branch",
        location: "Surabaya Pusat",
        type: LocationType.WFO,
        status: LocationStatus.INACTIVE,
        longitude: 112.75,
        latitude: -7.25,
        radius: 90,
        startTime: 7 * 60,
        endTime: 16 * 60,
      }
    ]
  });

  const divisionList = await prisma.division.findMany();
  const shiftTemplates = [
    { type: ShiftType.MORNING, baseName: "Pagi", start: 8 * 60, end: 16 * 60 },
    { type: ShiftType.AFTERNOON, baseName: "Sore", start: 16 * 60, end: 24 * 60 },
    { type: ShiftType.EVENING, baseName: "Malem", start: 0, end: 8 * 60 },
  ];

  const shiftData = [];

  for (const d of divisionList) {
    for (const t of shiftTemplates) {
      shiftData.push({
        name: `${t.baseName} - ${d.name}`,
        type: t.type,
        startTime: t.start,
        endTime: t.end,
        divisionId: d.id,
        isActive: true,
      });
    }
  }

  await prisma.shift.createMany({ data: shiftData });
  const shiftList = await prisma.shift.findMany();

  const usersData = [
    { name: "Mikasa", email: "mikasa@example.com", role: Role.ADMIN },
    { name: "Eren", email: "eren@example.com", role: Role.EMPLOYEE },
    { name: "Armin", email: "armin@example.com", role: Role.EMPLOYEE },
  ];

  const users = [];

  for (let i = 0; i < usersData.length; i++) {
    const hash = await bcrypt.hash("password123", 10);

    const user = await prisma.user.create({
      data: {
        name: usersData[i].name,
        email: usersData[i].email,
        password: hash,
        role: usersData[i].role,
        divisionId: divisionList[i % divisionList.length].id,
        shiftId: shiftList[i % shiftList.length].id,
      },
    });

    users.push(user);
  }

  const scheduleData = await prisma.schedule.createMany({
    data: [
      {
        title: "Daily Standup",
        frequency: FrequencyType.DAILY,
        divisionId: divisionList[0].id,
      },
      {
        title: "Weekly Review",
        frequency: FrequencyType.WEEKLY,
        divisionId: divisionList[1].id,
      },
      {
        title: "Monthly Meeting",
        frequency: FrequencyType.MONTHLY,
        divisionId: divisionList[2].id,
      },
    ],
  });

  const schedules = await prisma.schedule.findMany();

  await prisma.schedulesOnUsers.createMany({
    data: [
      { scheduleId: schedules[0].id, userId: users[0].id },
      { scheduleId: schedules[1].id, userId: users[1].id },
      { scheduleId: schedules[2].id, userId: users[2].id },
    ],
  });

  await prisma.userShiftAssignment.createMany({
    data: [
      { userId: users[0].id, shiftId: shiftList[0].id },
      { userId: users[1].id, shiftId: shiftList[1].id },
      { userId: users[2].id, shiftId: shiftList[2].id },
    ],
  });

  await prisma.attendance.createMany({
    data: [
      {
        userId: users[0].id,
        shiftId: shiftList[0].id,
        date: new Date(),
        status: AttendanceStatus.PRESENT,
      },
      {
        userId: users[1].id,
        shiftId: shiftList[1].id,
        date: new Date(),
        status: AttendanceStatus.LATE,
      },
      {
        userId: users[2].id,
        shiftId: shiftList[2].id,
        date: new Date(),
        status: AttendanceStatus.ABSENT,
      },
    ],
  });

  await prisma.shiftChangeRequest.createMany({
    data: [
      {
        userId: users[1].id,
        requestedById: users[0].id,
        oldShiftId: shiftList[0].id,
        newShiftId: shiftList[1].id,
        reason: "Family matters",
        startDate: new Date(),
        status: ShiftChangeStatus.PENDING,
      },
      {
        userId: users[2].id,
        requestedById: users[0].id,
        oldShiftId: shiftList[1].id,
        newShiftId: shiftList[2].id,
        reason: "Schedule adjustment",
        startDate: new Date(),
        status: ShiftChangeStatus.APPROVED,
      },
      {
        userId: users[1].id,
        requestedById: users[0].id,
        oldShiftId: shiftList[2].id,
        newShiftId: shiftList[0].id,
        reason: "Medical reason",
        startDate: new Date(),
        status: ShiftChangeStatus.REJECTED,
      },
    ],
  });

  console.log("✅ Dummy seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
