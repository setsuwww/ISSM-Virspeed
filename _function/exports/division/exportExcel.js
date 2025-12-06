import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export async function exportExcel(divisions = [], logoBase64) {
  if (!divisions.length) return;

  const columns = [
    "Name", "Location", "Type", "Status", "Start Time", "End Time", "Created At", "Signature"
  ];

  const rows = divisions.map((d) => [
    d.name ?? "-",
    d.location ?? "-",
    d.type ?? "-",
    d.status ?? "-",
    d.startTime ? `${d.startTime}:00` : "-",
    d.endTime ? `${d.endTime}:00` : "-",
    new Date(d.createdAt).toLocaleDateString("id-ID"),
    ""
  ]);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Division Report");

  const img = workbook.addImage({
    base64: logoBase64,
    extension: "png"
  });

  sheet.addImage(img, {
    tl: { col: 0, row: 0 },
    ext: { width: 140, height: 60 }
  });

  sheet.addRow([]);
  sheet.addRow([]);
  sheet.addRow([]);

  sheet.addRow(columns);
  rows.forEach((r) => sheet.addRow(r));

  sheet.columns.forEach((col) => {
    col.width = 18;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "division.xlsx");
}
