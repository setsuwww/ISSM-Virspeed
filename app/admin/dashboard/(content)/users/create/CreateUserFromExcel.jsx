"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/_contexts/Toast-Provider"
import { parseUserExcel } from "@/_lib/excel"

import { bulkCreateUser } from "@/_servers/admin-action/userAction"
import { Button } from "@/_components/ui/Button"
import { File, FileXls, Download } from "phosphor-react"
import { Label } from "@/_components/ui/Label"
import { Search, X } from "lucide-react"

export function CreateUserFromExcel({ onImported }) {
  const { addToast } = useToast()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const fileInputRef = useRef(null)

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
  }

  const processFile = async (file) => {
    setSelectedFile(file)
    setLoading(true)

    try {
      const rows = await parseUserExcel(file)

      if (!rows.length) {
        addToast("Excel file is empty", { type: "error" })
        return
      }

      const res = await bulkCreateUser(rows)

      if (res.success) {
        addToast(`${res.count} users imported`, {
          type: "success",
          title: "Import Success",
        })
        onImported?.()
        router.refresh()
      } else {
        addToast(res.message || "Import failed", {
          type: "error",
          title: "Import Failed",
        })
      }
    } catch {
      addToast("Invalid or corrupted Excel file", { type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      addToast("Only .xlsx or .xls files allowed", { type: "error" })
      return
    }

    processFile(file)
  }, [])

  const removeFile = () => {
    setSelectedFile(null)
    setLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const downloadTemplate = () => {
    import("xlsx").then(XLSX => {
      const data = [{
        name: "John Doe",
        email: "john@mail.com",
        password: "secret123",
        role: "EMPLOYEE",
        division: "IT",
        workMode: "WORK_HOURS",
        shift: "",
      }]

      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Users")
      XLSX.writeFile(wb, "user-import-template.xlsx")
    })
  }

  return (
    <>
      <Label className="mb-3">Excel File <span className="font-light text-slate-400">(Bulk create users)</span><span className="text-xs bg-teal-100 px-2 text-teal-600 rounded-full">IMPORT</span></Label>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`bg-slate-50/50 rounded-xl border border-dashed p-8 transition mb-2
          ${dragActive
            ? "border-emerald-500 bg-emerald-500/5"
            : "border-slate-300"}`}
      >
        {/* hidden input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) processFile(file)
            e.target.value = ""
          }}
        />

        {/* main content */}
        <div className="flex items-center gap-4">
          <div
            className={`group relative flex h-12 w-12 items-center justify-center rounded-lg border transition
              ${selectedFile
                ? "border-emerald-300 bg-emerald-100/40 text-emerald-600"
                : "border-slate-300 bg-slate-100/40 text-slate-600"}`}
          >
            {selectedFile ? (
              <FileXls className="h-6 w-6" weight="duotone" />
            ) : (
              <File className="h-6 w-6" />
            )}

            {selectedFile && (
              <button
                type="button"
                onClick={removeFile}
                className="animate-bouncy absolute -top-2 -right-2 hidden p-1 items-center justify-center rounded-full bg-white border border-slate-300 text-red-500 hover:bg-slate-100 hover:text-red-700 group-hover:flex"
              >
                <X className="w-3 h-3" strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="flex-1">
            {selectedFile ? (
              <>
                <p className="text-sm font-medium text-emerald-700 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600">
                  Drag & Drop Excel file here
                </p>
                <p className="text-xs text-slate-400">
                  .xlsx or .xls
                </p>
              </>
            )}
          </div>
        </div>

        {/* actions */}
        <div className="mt-4 flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="bg-white"
            onClick={downloadTemplate}
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>

          <Button
            variant="positive"
            type="button"
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Search className="h-4 w-4" />
            {loading
              ? "Importing..."
              : selectedFile
                ? "Replace File"
                : "Browse File"}
          </Button>
        </div>
      </div>
    </>
  )
}
