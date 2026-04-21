import { prisma } from "@/_lib/prisma";
import { getTodayStartJakarta } from "@/_lib/time";
import { getActiveAssignment } from "./assignment_helper";
import { LEAVE_RULES } from "@/_constants/static/leaveIndonesianRule";
import { addMonths } from "date-fns";

export function calculatePermissionEnd(start, isLong) {
    const result = new Date(start);
    if (isLong) {
        // Long term: Auto generate 1 day gap
        result.setDate(result.getDate() + 1);
    } else {
        // Short term: Auto generate 1 hour gap
        result.setHours(result.getHours() + 1);
    }
    return result;
}

export function calculateLeaveEnd(start, type) {
    const rule = LEAVE_RULES[type];
    if (!rule) return new Date(start);

    const result = new Date(start);
    if (rule.months) {
        return addMonths(result, rule.months);
    }
    
    if (rule.maxWorkDays) {
        // For annual leave, user might choose days, but if we auto-generate, 
        // we might use the max allowed if not specified. 
        // However, the user says "End Date digenerate". 
        // I'll assume they want the max duration applied by default.
        let added = 0;
        while (added < rule.maxWorkDays - 1) {
            result.setDate(result.getDate() + 1);
            const day = result.getDay();
            if (day !== 0 && day !== 6) added++;
        }
    }
    
    return result;
}

export async function processPermissionRequest(userId, { reason, startDate, isLong }) {
    const today = getTodayStartJakarta().toDate();
    const assignment = await getActiveAssignment(userId);

    if (!assignment || !assignment.shiftId) {
        throw new Error("Hari ini OFF, tidak perlu izin");
    }

    const start = new Date(startDate);
    const end = calculatePermissionEnd(start, isLong);

    const attendance = await prisma.attendance.upsert({
        where: {
            userId_shiftId_date: {
                userId,
                shiftId: assignment.shiftId,
                date: assignment.date,
            },
        },
        update: {
            status: "PERMISSION",
            approval: "PENDING",
            reason,
            workStart: start,
            workEnd: end,
        },
        create: {
            userId,
            shiftId: assignment.shiftId,
            date: assignment.date,
            status: "PERMISSION",
            approval: "PENDING",
            reason,
            workStart: start,
            workEnd: end,
        },
    });

    return { attendance, today };
}

export async function processLeaveRequest(userId, { type, startDate, reason }) {
    const leaveType = await prisma.leaveType.findUnique({
        where: { code: type },
    });

    if (!leaveType) throw new Error("Leave type not found");

    const start = new Date(`${startDate}T12:00:00`);
    const end = calculateLeaveEnd(start, type);
    const year = start.getFullYear();

    // Calculate actual work days for deduction
    let totalDays = 0;
    let currentDay = new Date(start);
    while (currentDay <= end) {
        if (leaveType.code === "ANNUAL") {
            const day = currentDay.getDay();
            if (day !== 0 && day !== 6) totalDays++;
        } else {
            totalDays++;
        }
        currentDay.setDate(currentDay.getDate() + 1);
    }

    if ((leaveType.code === "MATERNITY" || leaveType.code === "SICK") && totalDays > leaveType.maxDays) {
        totalDays = leaveType.maxDays;
    }

    const conflict = await prisma.leaveRequest.findFirst({
        where: {
            userId,
            status: { in: ["PENDING", "APPROVED"] },
            startDate: { lte: end },
            endDate: { gte: start },
        },
    });

    if (conflict) throw new Error("Leave date overlaps");

    let balance = await prisma.userLeaveBalance.findUnique({
        where: {
            userId_leaveTypeId_year: {
                userId,
                leaveTypeId: leaveType.id,
                year,
            },
        },
    });

    if (!balance) {
        balance = await prisma.userLeaveBalance.create({
            data: {
                userId,
                leaveTypeId: leaveType.id,
                year,
                totalDays: leaveType.maxDays,
                usedDays: 0,
            },
        });
    }

    if (balance.totalDays - balance.usedDays < totalDays) {
        throw new Error("Leave balance not sufficient");
    }

    const request = await prisma.leaveRequest.create({
        data: {
            userId,
            leaveTypeId: leaveType.id,
            startDate: start,
            endDate: end,
            totalDays,
            reason: reason?.trim() || null,
        },
    });

    await prisma.user.update({
        where: { id: userId },
        data: { isActive: false }
    });

    return request;
}
