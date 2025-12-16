import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, TextRun, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";

export async function exportWordTemplate({ title, columns, data }) {
  const rows = [];

  rows.push(new TableRow({
    children: columns.map(col => new TableCell({
      width: { size: 100 / columns.length, type: WidthType.PERCENTAGE },
      shading: { fill: "052F4A" },
      children: [
        new Paragraph({
          children: [new TextRun({ text: col.header, bold: true, color: "FFFFFF" })],
          alignment: AlignmentType.CENTER,
        })
      ],
      margins: { top: 150, bottom: 150, left: 100, right: 100 },
    }))
  }));

  data.forEach((item, idx) => {
    rows.push(new TableRow({
      children: columns.map(col => new TableCell({
        children: [
          new Paragraph({
            text: col.key === "no" ? String(idx + 1) : String(item[col.key] ?? "—"),
            alignment: ["no", "shiftTime", "time"].includes(col.key) ? AlignmentType.CENTER : AlignmentType.LEFT,
          })
        ],
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
      }))
    }));
  });

  const table = new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
  });

  const today = new Date().toLocaleDateString("id-ID");
  const footerTable = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph("")],
            width: { size: 70, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
          }),
          new TableCell({
            children: [
              new Paragraph({ text: `Jakarta, ${today}`, alignment: AlignmentType.RIGHT }),
              new Paragraph({ text: "\n\n" }),
              new Paragraph({ text: "........................................................", alignment: AlignmentType.RIGHT }),
            ],
            width: { size: 30, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
          })
        ]
      })
    ],
    width: { size: 100, type: WidthType.PERCENTAGE }
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: title, heading: "Heading1", alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
          new Paragraph({ text: `Generated: ${today}`, alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
          table,
          new Paragraph({ text: "\n\n" }),
          footerTable
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title.replace(/\s+/g, "_")}.docx`);
}
