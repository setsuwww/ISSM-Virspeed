export function calculateWorkMinutes(checkInTime, checkOutTime) {
    if (!checkInTime || !checkOutTime) return null;

    let diffMs = checkOutTime.getTime() - checkInTime.getTime();

    if (diffMs < 0) {
        diffMs += 24 * 60 * 60 * 1000;
    }

    return Math.floor(diffMs / 60000);
}

export async function calculateWorkHours(
    checkInTime,
    checkOutTime
) {
    const minutes = calculateWorkMinutes(checkInTime, checkOutTime);
    if (minutes == null) return null;

    return Number((minutes / 60).toFixed(2));
}


export function calculateShiftEndTime(date, shift) {
    const shiftEndHour = shift.endTime;
    const shiftEndMinute = 0;

    const shiftEnd = new Date(date);
    shiftEnd.setHours(shiftEndHour, shiftEndMinute, 0, 0);

    if (shift.endTime < shift.startTime) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
    }

    return shiftEnd;
}

export function formatWorkHours(hours) {
    if (hours == null || isNaN(hours)) return "-";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
}
