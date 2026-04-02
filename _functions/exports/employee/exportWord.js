import { exportWordTemplate } from "../utils/ExportWordTemplate";

export function exportWord(employees = []) {
  if (!employees || employees.length === 0) return;

  const columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Name", key: "name", width: 24 },
    { header: "Email", key: "email", width: 28 },
    { header: "Role", key: "role", width: 14 },
    { header: "Shift Type", key: "shiftType", width: 14 },
    { header: "Shift Name", key: "shiftName", width: 18 },
    { header: "Shift Time", key: "shiftTime", width: 18 },
    { header: "Location", key: "division", width: 18 },
    { header: "Created At", key: "createdAt", width: 16 },
    { header: "Updated At", key: "updatedAt", width: 16 },
  ];

  const data = employees.map((u) => ({
    name: u.name,
    email: u.email,
    role: u.role?.toUpperCase() ?? "-",

    shiftType: u.shift?.type ?? "-",
    shiftName: u.shift?.name ?? "-",
    shiftTime: u.shift ? `${u.shift.startTime} - ${u.shift.endTime}` : "-",

    division: u.division?.name ?? "-",

    createdAt: new Date(u.createdAt).toLocaleDateString("id-ID"),
    updatedAt: new Date(u.updatedAt).toLocaleDateString("id-ID"),
  }));

  exportWordTemplate({
    title: "Employees Report",
    sheetName: "Employees",
    columns,
    data,
  });
}
