import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

function colNumToName(num) {
  let s = "";
  while (num > 0) {
    let mod = (num - 1) % 26;
    s = String.fromCharCode(65 + mod) + s;
    num = Math.floor((num - mod) / 26);
  }
  return s;
}

export async function exportExcelTemplate({
  title = "Report",
  sheetName = "Report",
  columns = [],
  data = []
}) {
  if (!data || !data.length) {
    alert("Tidak ada data untuk diekspor.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  const today = new Date().toLocaleDateString("id-ID");

  sheet.columns = columns;

  const lastCol = colNumToName(columns.length);

  sheet.mergeCells(`A1:${lastCol}1`);
  sheet.getCell("A1").value = title;
  sheet.getCell("A1").font = { bold: true, size: 18 };
  sheet.getCell("A1").alignment = { horizontal: "center" };

  sheet.mergeCells(`A2:${lastCol}2`);
  sheet.getCell("A2").value = `Exported at: ${today}`;
  sheet.getCell("A2").font = { size: 11 };
  sheet.getCell("A2").alignment = { horizontal: "center" };

  const headerRowIndex = 5;
  const firstDataRowIndex = headerRowIndex + 1;

  const headerRow = sheet.getRow(headerRowIndex);
  headerRow.values = columns.map(c => c.header);
  headerRow.height = 23;

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF052F4A" } };
    cell.border = {
      top: { style: "thin" }, bottom: { style: "thin" },
      left: { style: "thin" }, right: { style: "thin" }
    };
  });

  data.forEach((obj, idx) => {
    const rowIndex = firstDataRowIndex + idx;
    const row = sheet.getRow(rowIndex);

    const rowArr = columns.map((col) => {
      if (col.key === "no") return idx + 1;
      return obj[col.key] ?? "";
    });

    row.values = rowArr;
    row.height = 20;

    row.eachCell((cell, colNum) => {
      cell.border = {
        top: { style: "thin" }, bottom: { style: "thin" },
        left: { style: "thin" }, right: { style: "thin" }
      };

      const key = sheet.getColumn(colNum).key;

      if (key === "no" || key === "shiftTime" || key === "time") {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        cell.alignment = { horizontal: "left", vertical: "middle" };
      }
    });
  });

  const lastUsedRow = firstDataRowIndex + data.length;
  const signRowIndex = lastUsedRow + 2;

  sheet.mergeCells(`${lastCol}${signRowIndex}:${lastCol}${signRowIndex}`);
  sheet.getCell(`${lastCol}${signRowIndex}`).value = `Jakarta, ${today}`;
  sheet.getCell(`${lastCol}${signRowIndex}`).alignment = { horizontal: "right" };

  const signLineIndex = signRowIndex + 3;
  sheet.mergeCells(`${lastCol}${signLineIndex}:${lastCol}${signLineIndex}`);
  sheet.getCell(`${lastCol}${signLineIndex}`).value = "........................................................";
  sheet.getCell(`${lastCol}${signLineIndex}`).alignment = { horizontal: "right" };

  const buf = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buf]), `${title.replace(/\s+/g, "_")}_${today.replace(/\//g, "-")}.xlsx`);
}
