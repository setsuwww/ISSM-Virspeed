/*
  Warnings:

  - A unique constraint covering the columns `[userId,shiftId,date]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Attendance_userId_shiftId_date_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userId_shiftId_date_key" ON "Attendance"("userId", "shiftId", "date");
