import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportPDF(divisions = [], logoBase64) {
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

  const doc = new jsPDF();

  doc.addImage(logoBase64, "PNG", 14, 10, 20, 20);
  doc.setFontSize(16);
  doc.text("Division Report", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

  autoTable(doc, {
    startY: 38,
    head: [columns],
    body: rows,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [33, 150, 243], textColor: 255 }
  });

  const today = new Date().toISOString().slice(0, 10);
  doc.save(`division_${today}.pdf`);
}
