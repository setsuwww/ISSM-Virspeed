"use client"

import React, { useState } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/_components/ui/Dialog"
import { Maximize2 } from "lucide-react"

export default function UserExcelTemplate() {
  const [zoomOpen, setZoomOpen] = useState(false)

  return (
    <div className="bg-white rounded-lg">
      <Dialog>
        <DialogTrigger asChild>
          <button className="text-xs uppercase bg-slate-100 px-2 py-0.5 text-slate-600 rounded-full hover:bg-slate-200 transition">
            View Example
          </button>
        </DialogTrigger>

        {/* FIRST MODAL - Natural Image Size */}
        <DialogContent className="max-w-fit p-6">
          <DialogHeader>
            <DialogTitle>Excel Example Preview</DialogTitle>
          </DialogHeader>

          <div className="relative mt-4 inline-block">
            {/* Image natural size */}
            <Image
              src="/images/excel-example.png"
              alt="Excel Template Example"
              width={900}  // pakai ukuran asli image kamu
              height={600}
              className="rounded-md"
              priority
            />

            {/* Zoom Button Overlay */}
            <button
              onClick={() => setZoomOpen(true)}
              className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-md transition"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* SECOND MODAL - Larger View */}
          <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
            <DialogContent className="max-w-6xl w-full bg-black p-4">
              <div className="relative w-full h-[80vh]">
                <Image
                  src="/images/excel-example.png"
                  alt="Zoomed Excel Example"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Hint inside first modal */}
          <div className="mt-4 text-xs text-muted-foreground space-y-1">
            <p>• Gunakan format kolom sesuai template.</p>
            <p>• Jangan ubah nama header kolom.</p>
            <p>• Role harus sesuai enum sistem.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
