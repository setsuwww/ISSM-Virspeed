// schema.test.js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

describe("Prisma schema test", () => {
  const createdIds = {
    users: [],
    locations: [],
    shifts: [],
    leaveTypes: [],
  };

  beforeAll(async () => {
    // Optional: truncate tables jika mau bersih sebelum test
  });

  afterAll(async () => {
    // Hapus data yang dibuat
    if (createdIds.users.length) {
      await prisma.user.deleteMany({ where: { id: { in: createdIds.users } } });
    }
    if (createdIds.locations.length) {
      await prisma.location.deleteMany({ where: { id: { in: createdIds.locations } } });
    }
    if (createdIds.shifts.length) {
      await prisma.shift.deleteMany({ where: { id: { in: createdIds.shifts } } });
    }
    if (createdIds.leaveTypes.length) {
      await prisma.leaveType.deleteMany({ where: { id: { in: createdIds.leaveTypes } } });
    }

    await prisma.$disconnect();
  });

  it("should create sample locations, users, shifts, and leave types", async () => {
    // 1. Create 4 locations
    for (let i = 1; i <= 4; i++) {
      const div = await prisma.location.create({
        data: { name: `Location ${i}` },
      });
      createdIds.locations.push(div.id);
    }

    // 2. Create 4 shifts
    for (let i = 1; i <= 4; i++) {
      const shift = await prisma.shift.create({
        data: { name: `Shift ${i}`, type: "MORNING", startTime: 480, endTime: 1020 },
      });
      createdIds.shifts.push(shift.id);
    }

    // 3. Create 4 leave types
    const leaveCategories = ["ANNUAL", "SICK", "MATERNITY", "BEREAVEMENT"];
    for (let i = 0; i < 4; i++) {
      const leave = await prisma.leaveType.create({
        data: {
          code: `LT${i + 1}`,
          name: `Leave Type ${i + 1}`,
          category: leaveCategories[i],
          maxDays: 12,
        },
      });
      createdIds.leaveTypes.push(leave.id);
    }

    for (let i = 1; i <= 4; i++) {
      const user = await prisma.user.create({
        data: {
          name: `User ${i}`,
          email: `user${i}@test.com`,
          password: "password123",
          role: "USER",
          locationId: createdIds.locations[i - 1],
          shiftId: createdIds.shifts[i - 1],
        },
      });
      createdIds.users.push(user.id);
    }

    // Assert data berhasil dibuat
    const userCount = await prisma.user.count({ where: { id: { in: createdIds.users } } });
    expect(userCount).toBe(4);
  });
});
