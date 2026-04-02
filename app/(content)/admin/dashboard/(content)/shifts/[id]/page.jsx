import { prisma } from "@/_lib/prisma";
import { AttendancesCard } from "../../users/(manage)/attendances/AttendancesCardStats";

export default async function LocationPage({ params }) {
  const locationId = parseInt(params.id);

  const location = await prisma.location.findUnique({
    where: { id: locationId },
    include: { shifts: { include: { users: { include: { attendances: true } } } } },
  });

  if (!location) return <p>location not found</p>;

  const shiftsWithAttendance = location.shifts.map((shift) => {
    const usersWithStatus = shift.users.map((user) => {
      const today = new Date();
      const attendance = user.attendances.find(
        (a) => a.shiftId === shift.id &&
          a.date.toDateString() === today.toDateString()
      );

      let attendanceStatus = "ABSENT";
      if (attendance) { attendanceStatus = attendance.status }

      const now = new Date();
      const start = new Date();
      start.setHours(shift.startTime.getHours(), shift.startTime.getMinutes());

      if (!attendance && now > start) attendanceStatus = "LATE";

      return { id: user.id, name: user.name, email: user.email, attendanceStatus };
    });

    return {
      id: shift.id, type: shift.type,
      startTime: shift.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: shift.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      users: usersWithStatus,
    };
  });

  const locationData = {
    id: location.id, name: location.name, location: location.location, shifts: shiftsWithAttendance,
  };

  return <AttendancesCard location={locationData} />;
}
