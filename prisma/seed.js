import { PrismaClient, Role, ShiftType, LocationType, LocationStatus, FrequencyType, AttendanceStatus, ApprovalStatus, ShiftChangeStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting structured dummy seed...");

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
    ]
  });

  const divisions = await prisma.division.createMany({
    data: [
      {
        name: "PT. Aplikanusa Lintasarta",
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
        name: "PT. Lintasarta",
        location: "Branch, Yogyakarta",
        type: LocationType.WFA,
        status: LocationStatus.ACTIVE,
        longitude: 107.61,
        latitude: -6.91,
        radius: 120,
        startTime: 9 * 60,
        endTime: 18 * 60,
      },
    ]
  });

  const divisionList = await prisma.division.findMany();
  const shiftTemplates = [
    { type: ShiftType.MORNING, baseName: "M", start: 8 * 60, end: 16 * 60 },
    { type: ShiftType.AFTERNOON, baseName: "A", start: 16 * 60, end: 24 * 60 },
    { type: ShiftType.EVENING, baseName: "E", start: 0, end: 8 * 60 },
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
    { name: "Mikasa", email: "mikasa@next.com", role: Role.ADMIN },
    { name: "Albert", email: "albert@next.com", role: Role.EMPLOYEE },
    { name: "Brian", email: "brian@next.com", role: Role.EMPLOYEE },
    { name: "Charlie", email: "charlie@next.com", role: Role.EMPLOYEE },
    { name: "Dirman", email: "dirman@next.com", role: Role.EMPLOYEE },
    { name: "Emily", email: "emily@next.com", role: Role.EMPLOYEE },
    { name: "Fernandez", email: "fernandez@next.com", role: Role.EMPLOYEE },
    { name: "Galiard", email: "galiard@next.com", role: Role.EMPLOYEE },
    { name: "Iris", email: "iris@next.com", role: Role.EMPLOYEE },
    { name: "John", email: "john@next.com", role: Role.EMPLOYEE },
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
        title: "Prototyping",
        frequency: FrequencyType.DAILY,
        divisionId: divisionList[0].id,
      },
      {
        title: "Holy Friday",
        frequency: FrequencyType.WEEKLY,
        divisionId: divisionList[1].id,
      },
    ],
  });

  const schedules = await prisma.schedule.findMany();

  await prisma.schedulesOnUsers.createMany({
    data: [
      { scheduleId: schedules[0].id, userId: users[0].id },
      { scheduleId: schedules[1].id, userId: users[1].id },
    ],
  });

  await prisma.userShiftAssignment.createMany({
    data: [
      { userId: users[0].id, shiftId: shiftList[0].id },
      { userId: users[1].id, shiftId: shiftList[1].id },
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
