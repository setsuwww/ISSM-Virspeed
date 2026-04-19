-- DropIndex
DROP INDEX "Attendance_userId_date_idx";

-- CreateIndex
CREATE INDEX "Attendance_userId_shiftId_date_idx" ON "Attendance"("userId", "shiftId", "date");
