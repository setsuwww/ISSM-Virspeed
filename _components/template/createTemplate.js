import ExcelJS from "exceljs";
import fs from "fs";

async function createTemplate() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Report", {
    pageSetup: {
      paperSize: 9,       // A4
      orientation: "portrait",
      margins: {
        left: 0.5, right: 0.5,
        top: 0.5, bottom: 0.5,
        header: 0.3, footer: 0.3
      }
    }
  });

  sheet.properties.defaultRowHeight = 22;

  sheet.mergeCells("C1", "G1");
  sheet.mergeCells("C2", "G2");
  sheet.mergeCells("C3", "G3");

  sheet.getCell("C1").value = "USER REPORT";
  sheet.getCell("C1").font = { bold: true, size: 18 };

  sheet.getCell("C2").value = "Location: Jakarta";
  sheet.getCell("C3").value = "Exported at: {{date}}";

  sheet.getRow(5).values = [
    "", "Name", "Location", "Type", "Status", "Start Time", "End Time", "Created At", "Signature"
  ];

  const headerRow = sheet.getRow(5);

  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" }
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEFEFEF" }
    };
  });

  sheet.columns = [
    { key: "no", width: 5 },
    { key: "name", width: 20 },
    { key: "location", width: 20 },
    { key: "type", width: 14 },
    { key: "status", width: 14 },
    { key: "start", width: 14 },
    { key: "end", width: 14 },
    { key: "created", width: 16 },
    { key: "signature", width: 25 },
  ];

  const startSignatureRow = 20;

  sheet.mergeCells(`G${startSignatureRow}`, `I${startSignatureRow}`);
  sheet.mergeCells(`G${startSignatureRow + 4}`, `I${startSignatureRow + 4}`);

  sheet.getCell(`G${startSignatureRow}`).value = "Jakarta, {{date}}";
  sheet.getCell(`G${startSignatureRow}`).alignment = { horizontal: "right" };

  sheet.getCell(`G${startSignatureRow + 4}`).value = "(Signature)";
  sheet.getCell(`G${startSignatureRow + 4}`).alignment = { horizontal: "right" };

  await workbook.xlsx.writeFile("./report-template.xlsx");

  console.log("Template created: report-template.xlsx");
}

createTemplate();
