import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportUser(users = []) {
  if (!users.length) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("User List Report", 14, 15);

  const today = new Date().toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });
  doc.setFontSize(10);
  doc.text(`Generated on: ${today}`, 14, 23);

  const tableColumn = ["Name", "Email", "Role", "Shift", "Shift Time", "Created At"];
  const tableRows = users.map((user) => [
    user.name || "-", user.email || "-", user.role || "-", user.shift || "-", user.shiftTime || "-",
    new Date(user.createdAt).toLocaleDateString("id-ID"),
  ]);

  autoTable(doc, {
    startY: 28,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [46, 125, 50], textColor: 255 },
  });

  doc.save(`users_${today.replace(/\s/g, "_")}.pdf`);
}
