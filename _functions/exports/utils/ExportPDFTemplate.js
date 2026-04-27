import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BEEFAST_BASE64 } from '@/_components/_constants/base64/base64';

export function exportPDFTemplate({
  title = "USERS REPORT",
  columns = [],
  data = [],
  companyName = "PT Aplikanusa Lintasarta || Gedung Lintasarta, Jl. TB Simatupang Raya No.16, Jakarta Selatan 12430",
  exportedBy = "Admin",
  location = "Jakarta",
  logoBase64 = BEEFAST_BASE64,
}) {
  if (!data.length) return;

  const doc = new jsPDF("landscape", "pt", "A4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString("id-ID");
  const margin = 40;

  // === LOGO ===
  if (logoBase64) {
    const imgWidth = 90;
    const imgHeight = 90;
    doc.addImage(logoBase64, "PNG", margin, 30, imgWidth, imgHeight);
  }

  // === HEADER COMPANY NAME ===
  doc.setFontSize(15);
  doc.setFont(undefined, "bold");
  doc.text("BEEFAST", margin + 120, 40);

  // === COMPANY ADDRESS ===
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  const addressLines = doc.splitTextToSize(companyName, 380);
  doc.text(addressLines, margin + 120, 60);

  // === EXPORT DATE ===
  doc.setFontSize(9);
  doc.setFont(undefined, "italic");
  doc.text(`Tanggal Export: ${today}`, margin + 120, 90);

  // === DIVIDER LINE ===
  doc.line(margin, 120, pageWidth - margin, 120);

  // === TITLE ===
  doc.setFontSize(13);
  doc.setFont(undefined, "bold");
  doc.text(title, pageWidth / 2, 150, { align: "center" });

  // === TABLE ===
  const startY = 180;
  const body = data.map((r, i) => [
    i + 1,
    ...columns.slice(1).map((c) => r[c.key] ?? "")
  ]);

  autoTable(doc, {
    startY,
    head: [columns.map((c) => c.header)],
    body,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: {
      fillColor: [229, 231, 235],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    theme: "grid",
  });

  // === FOOTER ===
  const finalY = doc.lastAutoTable.finalY + 40;

  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`${location}, ${today}`, pageWidth - margin, finalY, {
    align: "right",
  });

  doc.setFont(undefined, "bold");
  doc.text(exportedBy, pageWidth - margin, finalY + 50, {
    align: "right",
  });

  doc.save(`${title.replace(/\s+/g, "_")}_${today.replace(/\//g, "-")}.pdf`);
}
