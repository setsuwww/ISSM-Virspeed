import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export function exportSchedule(filteredData) {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text("Schedules Report", 14, 22)
  doc.setFontSize(11)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

  const tableData = filteredData.map((item) => [
    item.id,
    item.title,
    item.description,
    new Date(item.date).toLocaleDateString(),
    new Date(item.createdAt).toLocaleDateString(),
  ])

  autoTable(doc, {
    head: [["ID", "Title", "Description", "Date", "Created At"]],
    body: tableData,
    startY: 40,
  })

  doc.save("scheduleReport.pdf")
}