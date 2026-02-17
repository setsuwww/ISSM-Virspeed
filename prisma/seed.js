import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { log } from "../_constants/logConstants.js";
import ora from "ora";

const prisma = new PrismaClient();

async function main() {
  log.section("PRISMA USER SEED START");

  const cleanSpinner = ora("Cleaning existing users...").start();

  // Hapus semua user saja
  await prisma.user.deleteMany();

  cleanSpinner.succeed("Users table cleaned");

  /* ---------- FETCH DIVISIONS & SHIFTS ---------- */
  log.section("DIVISIONS & SHIFTS");

  const divisionList = await prisma.division.findMany({
    orderBy: { id: "asc" },
  });

  const shiftList = await prisma.shift.findMany({
    orderBy: { id: "asc" },
  });

  if (divisionList.length === 0 || shiftList.length === 0) {
    log.error("Divisions or Shifts not found. Seed them first!");
    process.exit(1);
  }

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

  const userSpinner = ora("Creating users with shifts and divisions...").start();

  for (let i = 0; i < usersData.length; i++) {
    const hash = await bcrypt.hash("password123", 10);

    await prisma.user.create({
      data: {
        name: usersData[i].name,
        email: usersData[i].email,
        password: hash,
        role: usersData[i].role,
        // Assign division dan shift secara bergantian
        divisionId: divisionList[i % divisionList.length].id,
        shiftId: shiftList[i % shiftList.length].id,
      },
    });
  }

  userSpinner.succeed(`Inserted ${usersData.length} users with shifts & divisions`);
  log.section("USER SEED COMPLETED");
  log.success("All users successfully generated");
}

main()
  .catch((e) => {
    log.error("User seeding failed");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
