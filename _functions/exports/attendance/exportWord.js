import { exportWordTemplate } from "../utils/ExportWordTemplate"

export const exportWord = (attendances) => {
  if (!attendances || attendances.length === 0) return;
  
  const columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Date", key: "date", width: 15 },
    { header: "Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 25 },
    { header: "Shift", key: "shift", width: 15 },
    { header: "Check In", key: "checkIn", width: 15 },
    { header: "Check Out", key: "checkOut", width: 15 },
    { header: "Status", key: "status", width: 15 },
    { header: "Reason", key: "reason", width: 30 },
  ]

  const rows = attendances.map(att => ({
    date: new Date(att.date).toLocaleDateString("id-ID"),
    name: att.user?.name,
    email: att.user?.email,
    shift: att.shift?.name ?? "-",
    checkIn: att.checkInTime || "-",
    checkOut: att.checkOutTime || "-",
    status: att.status,
    reason: att.reason ?? "-",
  }));

  exportWordTemplate({
    title: "Attendance Report",
    sheetName: "Attendances",
    columns,
    data: rows
  })
}