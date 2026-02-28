import { exportExcelTemplate } from "../utils/ExportExcelTemplate";

export function exportExcel(users = []) {
  if (!users || users.length === 0) return;
  const today = new Date().toLocaleDateString("id-ID");

  const columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Name", key: "name", width: 24 },
    { header: "Email", key: "email", width: 28 },
    { header: "Role", key: "role", width: 14 },
    { header: "Shift", key: "shift", width: 28 },
    { header: "Time", key: "shiftTime", width: 18 },
  ];

  const data = users.map((u) => ({
    name: u.name,
    email: u.email,
    role: u.role,
    shift: u.shift,
    shiftTime: u.shiftTime,
    createdAt: new Date(u.createdAt).toLocaleDateString("id-ID"),
  }));

  exportExcelTemplate({
    title: "Users Report",
    sheetName: "Users Report",
    columns,
    data
  });
}
