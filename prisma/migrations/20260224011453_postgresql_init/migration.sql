-- CreateEnum
CREATE TYPE "public"."LogAction" AS ENUM ('VIEW', 'SUBMIT', 'CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "public"."LogMethod" AS ENUM ('GET', 'POST', 'PUT', 'PATCH', 'DELETE');

-- CreateEnum
CREATE TYPE "public"."SecurityAction" AS ENUM ('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_CHANGED', 'SESSION_REVOKED', 'ROLE_CHANGED', 'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED', 'SESSION_CLEARED');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'COORDINATOR', 'EMPLOYEE', 'USER');

-- CreateEnum
CREATE TYPE "public"."ShiftType" AS ENUM ('OFF', 'MORNING', 'AFTERNOON', 'EVENING', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."LocationType" AS ENUM ('WFO', 'WFA');

-- CreateEnum
CREATE TYPE "public"."LocationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."FrequencyType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'ONCE');

-- CreateEnum
CREATE TYPE "public"."ApprovalStatus" AS ENUM ('PENDING', 'PENDING_TARGET', 'PENDING_ADMIN', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."LeaveCategory" AS ENUM ('ANNUAL', 'SICK', 'MATERNITY', 'MARRIAGE', 'BEREAVEMENT', 'RELIGIOUS', 'SPECIAL');

-- CreateEnum
CREATE TYPE "public"."AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'PERMISSION', 'ALPHA');

-- CreateTable
CREATE TABLE "public"."ActivityLog" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "action" "public"."LogAction" NOT NULL,
    "method" "public"."LogMethod" NOT NULL,
    "data" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SecurityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "public"."SecurityAction" NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SuspiciousActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "ip" TEXT,
    "reason" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuspiciousActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SystemConfig" (
    "id" SERIAL NOT NULL,
    "allWfaActive" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "divisionId" INTEGER,
    "shiftId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserLeaveBalance" (
    "userId" TEXT NOT NULL,
    "leaveTypeId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "usedDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLeaveBalance_pkey" PRIMARY KEY ("userId","leaveTypeId","year")
);

-- CreateTable
CREATE TABLE "public"."UserShiftAssignment" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "shiftId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserShiftAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Schedule" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "frequency" "public"."FrequencyType" NOT NULL DEFAULT 'ONCE',
    "startDate" TIMESTAMP(3),
    "startTime" TEXT,
    "endDate" TIMESTAMP(3),
    "endTime" TEXT,
    "divisionId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SchedulesOnUsers" (
    "id" SERIAL NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SchedulesOnUsers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ScheduleReminder" (
    "id" SERIAL NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "radius" DOUBLE PRECISION,
    "type" "public"."LocationType" NOT NULL DEFAULT 'WFO',
    "status" "public"."LocationStatus" NOT NULL DEFAULT 'INACTIVE',
    "startTime" INTEGER,
    "endTime" INTEGER,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Shift" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."ShiftType" NOT NULL,
    "startTime" INTEGER NOT NULL,
    "endTime" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "divisionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Attendance" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "public"."AttendanceStatus" NOT NULL DEFAULT 'ABSENT',
    "approval" "public"."ApprovalStatus",
    "reason" TEXT,
    "adminReason" TEXT,
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "earlyCheckoutReason" TEXT,
    "userId" TEXT NOT NULL,
    "shiftId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "divisionType" "public"."LocationType",
    "divisionStatus" "public"."LocationStatus",

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EarlyCheckoutRequest" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "attendanceId" INTEGER,
    "reason" TEXT NOT NULL,
    "status" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "adminReason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "EarlyCheckoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeaveType" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "public"."LeaveCategory" NOT NULL,
    "maxDays" INTEGER NOT NULL,

    CONSTRAINT "LeaveType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LeaveRequest" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "leaveTypeId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "reason" TEXT,
    "adminReason" TEXT,
    "status" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ShiftChangeRequest" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "targetUserId" TEXT,
    "oldShiftId" INTEGER,
    "newShiftId" INTEGER,
    "targetShiftId" INTEGER,
    "reason" TEXT NOT NULL,
    "rejectReason" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "public"."ApprovalStatus" NOT NULL DEFAULT 'PENDING_TARGET',
    "verifiedByTarget" BOOLEAN NOT NULL DEFAULT false,
    "verifiedByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "public"."ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "public"."ActivityLog"("action");

-- CreateIndex
CREATE INDEX "SecurityLog_userId_idx" ON "public"."SecurityLog"("userId");

-- CreateIndex
CREATE INDEX "SuspiciousActivity_userId_idx" ON "public"."SuspiciousActivity"("userId");

-- CreateIndex
CREATE INDEX "SuspiciousActivity_resolved_idx" ON "public"."SuspiciousActivity"("resolved");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserShiftAssignment_userId_shiftId_key" ON "public"."UserShiftAssignment"("userId", "shiftId");

-- CreateIndex
CREATE UNIQUE INDEX "SchedulesOnUsers_scheduleId_userId_key" ON "public"."SchedulesOnUsers"("scheduleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleReminder_scheduleId_userId_key" ON "public"."ScheduleReminder"("scheduleId", "userId");

-- CreateIndex
CREATE INDEX "Attendance_userId_date_idx" ON "public"."Attendance"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userId_shiftId_date_key" ON "public"."Attendance"("userId", "shiftId", "date");

-- CreateIndex
CREATE INDEX "EarlyCheckoutRequest_userId_idx" ON "public"."EarlyCheckoutRequest"("userId");

-- CreateIndex
CREATE INDEX "EarlyCheckoutRequest_attendanceId_idx" ON "public"."EarlyCheckoutRequest"("attendanceId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveType_code_key" ON "public"."LeaveType"("code");

-- CreateIndex
CREATE INDEX "LeaveRequest_userId_idx" ON "public"."LeaveRequest"("userId");

-- CreateIndex
CREATE INDEX "LeaveRequest_leaveTypeId_idx" ON "public"."LeaveRequest"("leaveTypeId");

-- AddForeignKey
ALTER TABLE "public"."ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SecurityLog" ADD CONSTRAINT "SecurityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SuspiciousActivity" ADD CONSTRAINT "SuspiciousActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "public"."Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserLeaveBalance" ADD CONSTRAINT "UserLeaveBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserLeaveBalance" ADD CONSTRAINT "UserLeaveBalance_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "public"."LeaveType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserShiftAssignment" ADD CONSTRAINT "UserShiftAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserShiftAssignment" ADD CONSTRAINT "UserShiftAssignment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "public"."Shift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Schedule" ADD CONSTRAINT "Schedule_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SchedulesOnUsers" ADD CONSTRAINT "SchedulesOnUsers_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "public"."Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SchedulesOnUsers" ADD CONSTRAINT "SchedulesOnUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduleReminder" ADD CONSTRAINT "ScheduleReminder_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "public"."Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduleReminder" ADD CONSTRAINT "ScheduleReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Location" ADD CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Shift" ADD CONSTRAINT "Shift_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "public"."Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "public"."Shift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EarlyCheckoutRequest" ADD CONSTRAINT "EarlyCheckoutRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EarlyCheckoutRequest" ADD CONSTRAINT "EarlyCheckoutRequest_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "public"."Attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeaveRequest" ADD CONSTRAINT "LeaveRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeaveRequest" ADD CONSTRAINT "LeaveRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LeaveRequest" ADD CONSTRAINT "LeaveRequest_leaveTypeId_fkey" FOREIGN KEY ("leaveTypeId") REFERENCES "public"."LeaveType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShiftChangeRequest" ADD CONSTRAINT "ShiftChangeRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShiftChangeRequest" ADD CONSTRAINT "ShiftChangeRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShiftChangeRequest" ADD CONSTRAINT "ShiftChangeRequest_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShiftChangeRequest" ADD CONSTRAINT "ShiftChangeRequest_oldShiftId_fkey" FOREIGN KEY ("oldShiftId") REFERENCES "public"."Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShiftChangeRequest" ADD CONSTRAINT "ShiftChangeRequest_newShiftId_fkey" FOREIGN KEY ("newShiftId") REFERENCES "public"."Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ShiftChangeRequest" ADD CONSTRAINT "ShiftChangeRequest_targetShiftId_fkey" FOREIGN KEY ("targetShiftId") REFERENCES "public"."Shift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
