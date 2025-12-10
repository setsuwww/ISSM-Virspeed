import { exportPDFTemplate } from "../utils/ExportPDFTemplate";

export function exportPDF(users = []) {
  if (!users || users.length === 0) return;
  const today = new Date().toLocaleDateString("id-ID");

  const columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Name", key: "name", width: 24 },
    { header: "Email", key: "email", width: 28 },
    { header: "Role", key: "role", width: 14 },
    { header: "Shift", key: "shift", width: 28 },
    { header: "Time", key: "shiftTime", width: 18 },
    { header: "Created At", key: "createdAt", width: 16 },
  ];

  const data = users.map((u) => ({
    name: u.name,
    email: u.email,
    role: u.role,
    shift: u.shift,
    shiftTime: u.shiftTime,
    createdAt: new Date(u.createdAt).toLocaleDateString("id-ID"),
  }));

  exportPDFTemplate({
    title: "Users Report",
    sheetName: "Users Report",
    columns,
    data
  });
}
