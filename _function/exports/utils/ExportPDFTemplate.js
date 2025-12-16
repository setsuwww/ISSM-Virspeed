import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportPDFTemplate({ title, columns, data }) {
  const doc = new jsPDF("p", "pt");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;

  doc.setFontSize(18);
  const titleTextWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleTextWidth) / 2, 50);

  const dateStr = `Generated: ${new Date().toLocaleDateString("id-ID")}`;
  doc.setFontSize(10);
  const dateWidth = doc.getTextWidth(dateStr);
  doc.text(dateStr, (pageWidth - dateWidth) / 2, 70);

  const startY = 90;
  autoTable(doc, {
    startY,
    head: [columns.map(c => c.header)],
    body: data.map((r, i) => [i + 1, ...columns.slice(1).map(c => r[c.key] ?? "—")]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [5, 47, 74], textColor: [255, 255, 255] },
    theme: "grid",
  });

  const finalY = doc.lastAutoTable.finalY || startY + 20;
  const footerY = finalY + 20;
  const signLineY = footerY + 60;

  const signText = "_________, _____________________";
  const signLine = "........................................................";

  const signTextWidth = doc.getTextWidth(signText);
  const signLineWidth = doc.getTextWidth(signLine);

  doc.setFontSize(11);
  doc.text(signText, pageWidth - margin - signTextWidth, footerY);
  doc.text(signLine, pageWidth - margin - signLineWidth, signLineY);

  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
}
