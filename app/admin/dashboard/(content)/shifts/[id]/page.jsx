import { prisma } from "@/_lib/prisma";
import { AttendancesCard } from "../../users/(manage)/attendances/AttendancesCardStats";

export default async function DivisionPage({ params }) {
  const divisionId = parseInt(params.id);

  const division = await prisma.division.findUnique({
    where: { id: divisionId },
    include: { shifts: { include: { users: { include: { attendances: true }}}}},
  });

  if (!division) return <p>division not found</p>;

  const shiftsWithAttendance = division.shifts.map((shift) => {
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

  const divisionData = {
    id: division.id, name: division.name, location: division.location, shifts: shiftsWithAttendance,
  };

  return <AttendancesCard division={divisionData} />;
}
