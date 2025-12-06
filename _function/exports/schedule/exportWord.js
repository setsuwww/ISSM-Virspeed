import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, ImageRun
} from "docx";
import { saveAs } from "file-saver";

export async function exportWord(divisions = [], logoBase64) {
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

  const logoBuffer = await fetch(logoBase64).then((r) => r.arrayBuffer());

  const header = new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new ImageRun({
        data: logoBuffer,
        transformation: { width: 60, height: 60 }
      }),
      new TextRun({
        text: "\nDivision Report",
        bold: true,
        size: 32
      })
    ]
  });

  const tableRows = [
    new TableRow({
      children: columns.map((c) =>
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: c, bold: true })] })] })
      )
    }),
    ...rows.map((r) =>
      new TableRow({
        children: r.map((cell) => new TableCell({ children: [new Paragraph(String(cell))] }))
      })
    )
  ];

  const doc = new Document({
    sections: [
      {
        children: [
          header,
          new Paragraph(" "),
          new Table({
            rows: tableRows
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "division_report.docx");
}
