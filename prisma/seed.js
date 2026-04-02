import { PrismaClient, Role, ShiftType, LocationType, LocationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import ora from "ora";

const prisma = new PrismaClient();

async function main() {
  const spinner = ora("Seeding locations, shifts, and users...").start();

  try {
    // --- Hapus data lama ---
    await prisma.user.deleteMany();
    await prisma.shift.deleteMany();
    await prisma.location.deleteMany();

    // --- Buat locations ---
    const locationsData = [
      { name: "Web Developer", location: "Jakarta Selatan", type: LocationType.WFO, status: LocationStatus.ACTIVE, startTime: 540, endTime: 720 },
      { name: "Mobile Developer", location: "Jakarta Selatan", type: LocationType.WFO, status: LocationStatus.ACTIVE, startTime: 540, endTime: 720 },
      { name: "Desktop Developer", location: "Jakarta Selatan", type: LocationType.WFO, status: LocationStatus.ACTIVE, startTime: 540, endTime: 720 },
    ];
    await prisma.location.createMany({ data: locationsData });

    // --- Ambil locations yang baru dibuat ---
    const locationList = await prisma.location.findMany();

    // --- Buat shifts ---
    const shiftsData = [
      { name: "Shift Pagi", type: ShiftType.MORNING, startTime: 540, endTime: 720 },
      { name: "Shift Siang", type: ShiftType.AFTERNOON, startTime: 720, endTime: 900 },
      { name: "Shift Malam", type: ShiftType.EVENING, startTime: 900, endTime: 1080 },
    ];
    await prisma.shift.createMany({ data: shiftsData });

    // --- Ambil shifts yang baru dibuat ---
    const shiftList = await prisma.shift.findMany();

    // --- Buat users 1 per shift + 1 per location ---
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

    for (let i = 0; i < usersData.length; i++) {
      const hash = await bcrypt.hash("password123", 10);

      await prisma.user.create({
        data: {
          name: usersData[i].name,
          email: usersData[i].email,
          password: hash,
          role: usersData[i].role,
          locationId: locationList[i % locationList.length].id, // rotasi location
          shiftId: shiftList[i % shiftList.length].id,         // rotasi shift
        },
      });
    }

    spinner.succeed(`Seeded ${usersData.length} users, ${shiftsData.length} shifts, ${locationsData.length} locations`);
  } catch (err) {
    spinner.fail("Seeding failed");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
