import { PrismaClient, Role, ShiftType, LocationType, LocationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { log } from "../_constants/logConstants.js";
import ora from "ora";

const prisma = new PrismaClient();

async function main() {
  log.section("PRISMA STRUCTURED SEED START");

  const cleanSpinner = ora("Cleaning existing data...").start();

  await prisma.schedulesOnUsers.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.userShiftAssignment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.division.deleteMany();
  await prisma.systemConfig.deleteMany();
  await prisma.leaveType.deleteMany();

  cleanSpinner.succeed("Database cleaned");

  /* ---------- SYSTEM CONFIG ---------- */
  log.section("SYSTEM CONFIG");

  const configSpinner = ora("Creating system configs...").start();

  const systemConfigs = await prisma.systemConfig.createMany({
    data: [
      { allWfaActive: false },
      { allWfaActive: true },
    ],
  });

  configSpinner.succeed(`Inserted ${systemConfigs.count} system configs`);

  /* ---------- DIVISIONS ---------- */
  log.section("DIVISIONS");

  const divisionSpinner = ora("Creating divisions...").start();

  const divisions = await prisma.division.createMany({
    data: [
      {
        name: "Finance",
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
        name: "IT Support",
        location: "Branch, Jakarta Selatan",
        type: LocationType.WFA,
        status: LocationStatus.ACTIVE,
        longitude: 107.61,
        latitude: -6.91,
        radius: 120,
        startTime: 9 * 60,
        endTime: 18 * 60,
      },
    ],
  });

  divisionSpinner.succeed(`Inserted ${divisions.count} divisions`);

  const divisionList = await prisma.division.findMany();

  /* ---------- SHIFTS ---------- */
  log.section("SHIFTS");

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

  const shiftSpinner = ora("Creating shifts...").start();

  const shifts = await prisma.shift.createMany({ data: shiftData });

  shiftSpinner.succeed(`Inserted ${shifts.count} shifts`);

  const shiftList = await prisma.shift.findMany();

  /* ---------- USERS ---------- */
  log.section("USERS");

  const usersData = [
    { name: "Mikasa", email: "mikasa@next.com", role: Role.ADMIN },
    { name: "Albert", email: "albert@next.com", role: Role.EMPLOYEE },
    { name: "Brian", email: "brian@next.com", role: Role.EMPLOYEE },
    { name: "Charlie", email: "charlie@next.com", role: Role.EMPLOYEE },
    { name: "Drake", email: "drake@next.com", role: Role.EMPLOYEE },
    { name: "Emily", email: "emily@next.com", role: Role.EMPLOYEE },
    { name: "Fernandez", email: "fernandez@next.com", role: Role.EMPLOYEE },
    { name: "Galiard", email: "galiard@next.com", role: Role.EMPLOYEE },
    { name: "Harry", email: "harry@next.com", role: Role.EMPLOYEE },
    { name: "Iris", email: "iris@next.com", role: Role.EMPLOYEE },
    { name: "John", email: "john@next.com", role: Role.EMPLOYEE },
    { name: "Katherine", email: "katherine@next.com", role: Role.EMPLOYEE },
    { name: "Levi", email: "levi@next.com", role: Role.EMPLOYEE },
    { name: "Monica", email: "monica@next.com", role: Role.EMPLOYEE },
    { name: "Noah", email: "noah@next.com", role: Role.EMPLOYEE },
    { name: "Odelio", email: "odelio@next.com", role: Role.EMPLOYEE },
    { name: "Prilly", email: "prilly@next.com", role: Role.EMPLOYEE },
    { name: "Qian", email: "qian@next.com", role: Role.EMPLOYEE },
    { name: "Raymond", email: "raymond@next.com", role: Role.EMPLOYEE },
    { name: "Stevan", email: "stevan@next.com", role: Role.EMPLOYEE },
    { name: "Thomas", email: "thomas@next.com", role: Role.EMPLOYEE },
    { name: "Ulrich", email: "ulrich@next.com", role: Role.EMPLOYEE },
    { name: "Veline", email: "veline@next.com", role: Role.EMPLOYEE },
    { name: "Wilson", email: "wilson@next.com", role: Role.EMPLOYEE },
    { name: "Xin", email: "xin@next.com", role: Role.EMPLOYEE },
    { name: "Yohannes", email: "yohannes@next.com", role: Role.EMPLOYEE },
    { name: "Zaky", email: "zaky@next.com", role: Role.EMPLOYEE },
  ];

  const userSpinner = ora("Creating users...").start();

  for (let i = 0; i < usersData.length; i++) {
    const hash = await bcrypt.hash("password123", 10);

    await prisma.user.create({
      data: {
        name: usersData[i].name,
        email: usersData[i].email,
        password: hash,
        role: usersData[i].role,
        divisionId: divisionList[i % divisionList.length].id,
        shiftId: shiftList[i % shiftList.length].id,
      },
    });
  }

  userSpinner.succeed(`Inserted ${usersData.length} users`);

  /* ---------- LEAVE TYPES ---------- */
  log.section("LEAVE TYPES");

  const leaveSpinner = ora("Creating leave types...").start();

  const leaveTypes = await prisma.leaveType.createMany({
    data: [
      { code: "ANNUAL", name: "Cuti Tahunan", category: "ANNUAL", maxDays: 12 },
      { code: "SICK", name: "Cuti Sakit", category: "SICK", maxDays: 365 },
      { code: "MATERNITY", name: "Cuti Melahirkan", category: "MATERNITY", maxDays: 90 },
    ],
  });

  leaveSpinner.succeed(`Inserted ${leaveTypes.count} leave types`);

  log.section("SEED COMPLETED");
  log.success("All dummy data successfully generated");
}


main()
  .catch((e) => {
    log.error("Seeding failed");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
