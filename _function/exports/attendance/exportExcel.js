import { safeFormat } from "@/_function/globalFunction";
import { exportExcelTemplate } from "../utils/ExportExcelTemplate"

export const exportExcel = (attendances) => {
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
    checkIn: safeFormat(att.checkInTime, "hh:mm a") || "-",
    checkOut: safeFormat(att.checkOutTime, "hh:mm a") || "-",
    status: att.status,
    reason: att.reason ?? "-",
  }));

  exportExcelTemplate({
    title: "Attendance Report",
    sheetName: "Attendances",
    columns,
    data: rows
  })
}
