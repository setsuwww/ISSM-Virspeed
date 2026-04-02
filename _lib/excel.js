// _lib/excel.ts
import * as XLSX from "xlsx"

export function parseUserExcel(file) {
  return new Promise(async (resolve, reject) => {
    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: "array" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]

      const rawRows = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
      })

      const rows = rawRows.map((r) => ({
        name: String(r.name).trim(),
        email: String(r.email).trim().toLowerCase(),
        password: String(r.password),
        role: r.role || "USER",
        location: r.location || null,
        workMode: r.workMode || "WORK_HOURS",
        shift: r.shift || null,
      }))

      resolve(rows)
    } catch (e) {
      reject(e)
    }
  })
}
