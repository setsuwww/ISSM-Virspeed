import { AttendanceStatus, PrismaClient } from "@prisma/client";
import ora from "ora";

const prisma = new PrismaClient();

function getRandomStatus() {
  const statuses = [
    AttendanceStatus.PRESENT,
    AttendanceStatus.ABSENT,
    AttendanceStatus.LATE,
    AttendanceStatus.PERMISSION,
  ];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

async function main() {
  const spinner = ora("Seeding attendance...").start();

  try {
    // --- Ambil 20 user teratas (atau lebih jika mau) ---
    const users = await prisma.user.findMany({ take: 20 });
    if (users.length === 0) throw new Error("No users found, seed users first");

    // --- Ambil 3 shift (asumsi sudah ada shift) ---
    const shifts = await prisma.shift.findMany({ take: 3 });
    if (shifts.length === 0) throw new Error("No shifts found, seed shifts first");

    // --- Tentukan tanggal hari ini dan 7 hari ke belakang ---
    const today = new Date();
    const daysBack = 7;

    const attendanceData = [];

    for (let d = 0; d < daysBack; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);

      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const shift = shifts[i % shifts.length]; // rotasi shift

        attendanceData.push({
          userId: user.id,
          shiftId: shift.id,
          date,
          status: getRandomStatus(),
        });
      }
    }

    // --- Insert ke database ---
    await prisma.attendance.createMany({ data: attendanceData });

    spinner.succeed(`Seeded attendance for ${users.length} users for ${daysBack} days`);
  } catch (err) {
    spinner.fail("Seeding attendance failed");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
