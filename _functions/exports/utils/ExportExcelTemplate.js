import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { BEEFAST_BASE64 } from "@/_components/_constants/base64/base64";

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
  title = "USERS REPORT",
  sheetName = "Report",
  columns = [],
  data = [],
  companyName = "PT Aplikanusa Lintasarta || Gedung Lintasarta, Jl. TB Simatupang Raya No.16, Jakarta Selatan 12430",
  exportedBy = "Admin",
  logoBase64 = BEEFAST_BASE64,
}) {
  if (!data.length) return;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);
  const today = new Date().toLocaleDateString("id-ID");

  ws.pageSetup = {
    paperSize: 9,
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: false,
    horizontalCentered: true,
  };

  ws.pageSetup.margins = {
    left: 0.3,
    right: 0.3,
    top: 0.5,
    bottom: 0.5,
    header: 0.2,
    footer: 0.2,
  };

  ws.printOptions = { gridLines: false };

  ws.columns = [
    { width: 18 },
    { width: 3 },
    ...columns.map(c => ({ ...c, width: c.width || 18 })),
  ];

  const lastCol = colNumToName(ws.columns.length);

  ws.getRow(1).height = 40;
  ws.getRow(2).height = 22;
  ws.getRow(3).height = 26;
  ws.getRow(4).height = 6;
  ws.getRow(5).height = 28;

  if (logoBase64) {
    const logoId = wb.addImage({
      base64: logoBase64,
      extension: "png",
    });

    ws.mergeCells("A1:A3");
    ws.addImage(logoId, {
      tl: { col: 0, row: 0 },
      ext: { width: 120, height: 120 },
      editAs: "oneCell",
    });
  }

  ws.mergeCells(`C1:${lastCol}1`);
  ws.getCell("C1").value = "BEEFAST";
  ws.getCell("C1").font = { bold: true, size: 15 };

  ws.mergeCells(`C2:${lastCol}2`);
  ws.getCell("C2").value = companyName;
  ws.getCell("C2").font = { size: 10 };
  ws.getCell("C2").alignment = { vertical: "middle", wrapText: true };

  ws.mergeCells(`C3:${lastCol}3`);
  ws.getCell("C3").value = `Tanggal Export: ${today}`;
  ws.getCell("C3").font = { size: 9, italic: true };

  ws.mergeCells(`A4:${lastCol}4`);
  ws.getCell("A4").border = { bottom: { style: "thick" } };

  ws.mergeCells(`A5:${lastCol}5`);
  ws.getCell("A5").value = title;
  ws.getCell("A5").font = { bold: true, size: 13 };
  ws.getCell("A5").alignment = { horizontal: "center" };

  const headerRow = 8;

  ws.getRow(headerRow).values = ["", "", ...columns.map(c => c.header)];
  ws.getRow(headerRow).height = 26;

  ws.getRow(headerRow).eachCell((cell, col) => {
    if (col < 3) return;
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE5E7EB" },
    };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });

  data.forEach((row, i) => {
    const r = ws.getRow(headerRow + 1 + i);
    r.values = ["", "", ...columns.map(c =>
      c.key === "no" ? i + 1 : row[c.key] ?? ""
    )];
    r.height = 22;

    r.eachCell((cell, col) => {
      if (col < 3) return;
      cell.alignment = { vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  const footerStart = headerRow + data.length + 3;

  ws.mergeCells(`A${footerStart}:${lastCol}${footerStart}`);
  ws.getCell(`A${footerStart}`).border = {
    top: { style: "thin" },
  };

  ws.mergeCells(`A${footerStart + 1}:${lastCol}${footerStart + 1}`);
  ws.getCell(`A${footerStart + 1}`).value = `Jakarta, ${today}`;
  ws.getCell(`A${footerStart + 1}`).alignment = { horizontal: "right" };

  ws.mergeCells(`A${footerStart + 2}:${lastCol}${footerStart + 3}`);
  ws.getCell(`A${footerStart + 2}`).value = exportedBy;
  ws.getCell(`A${footerStart + 2}`).font = { bold: true };
  ws.getCell(`A${footerStart + 2}`).alignment = { horizontal: "right" };

  ws.views = [{ state: "frozen", ySplit: headerRow }];
  ws.printTitlesRow = `${headerRow}:${headerRow}`;

  const buf = await wb.xlsx.writeBuffer();
  saveAs(
    new Blob([buf]),
    `${title.replace(/\s+/g, "_")}_${today.replace(/\//g, "-")}.xlsx`
  );
}
