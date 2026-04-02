import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function exportLocation(divisions = []) {
  if (!divisions.length) {
    alert("Tidak ada data divisi untuk diekspor!")
    return
  }

  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.text("Location List Report", 14, 15)

  const today = new Date().toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  })
  doc.setFontSize(10)
  doc.text(`Generated on: ${today}`, 14, 23)

  const tableColumn = [
    "Name", "Location", "Type", "Status", "Start Time", "End Time", "Created At",
  ]

  const tableRows = divisions.map((d) => [
    d.name || "-",
    d.location || "-",
    d.type || "-",
    d.status || "-",
    d.startTime != null ? `${d.startTime}:00` : "-",
    d.endTime != null ? `${d.endTime}:00` : "-",
    new Date(d.createdAt).toLocaleDateString("id-ID"),
  ])

  autoTable(doc, {
    startY: 28,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [33, 150, 243], textColor: 255 },
  })

  doc.save(`divisions_${today.replace(/\s/g, "_")}.pdf`)
}
