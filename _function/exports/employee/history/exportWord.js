import { exportWordTemplate } from "../../utils/ExportWordTemplate";
import { safeFormat } from "@/_function/globalFunction";

export function exportWord(history = []) {
  if (!Array.isArray(history) || history.length === 0) return;

  const columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Date", key: "date" },
    { header: "Day", key: "day" },
    { header: "Check In", key: "checkIn" },
    { header: "Check Out", key: "checkOut" },
    { header: "Status", key: "status" },
    { header: "Shift", key: "shift" },
    { header: "Early Checkout", key: "earlyCheckout" },
  ];

  const data = history.map((h, i) => ({
    no: i + 1,
    date: h.dmy ?? safeFormat(h.date, "dd MMM yyyy"),
    day: h.day,
    checkIn: h.checkInTime ? h.checkInTime.slice(11, 16) : "-",
    checkOut: h.checkOutTime ? h.checkOutTime.slice(11, 16) : "-",
    status: h.status,
    shift: h.shift
      ? `${h.shift.startTime} - ${h.shift.endTime}`
      : "-",
    earlyCheckout: h.isEarlyCheckout ? "Yes" : "No",
  }));

  exportWordTemplate({
    title: "Attendance History Report",
    sheetName: "History",
    columns,
    data,
  });
}
