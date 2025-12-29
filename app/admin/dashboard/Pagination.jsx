"use client";

import { ChevronLeft, ChevronRight } from "lucide-react"
import React from "react";
import Link from "next/link";

export const Pagination = React.memo(function ({
  page,
  totalPages,
  basePath = "/"
}) {
  if (totalPages <= 1) return null;

  function getPages(page, total) {
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= page - delta && i <= page + delta)
      ) {
        range.push(i)
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1)
        else if (i - l > 2) rangeWithDots.push("…")
      }
      rangeWithDots.push(i)
      l = i
    }

    return rangeWithDots
  }

  return (
    <div className="flex items-center gap-1 mt-4">
      {page > 1 && (
        <Link href={`${basePath}?page=${page - 1}`} className="pagination-btn text-slate-600 hover:bg-slate-50 hover:text-slate-700">
          <ChevronLeft size={18} />
        </Link>
      )}

      {getPages(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={i} className="px-3 text-slate-400">…</span>
        ) : (
          <Link
            key={i}
            href={`${basePath}?page=${p}`}
            className={`pagination-btn text-slate-600 hover:bg-slate-50 hover:text-slate-700 ${p === page ? "active" : ""}`}
          >
            {p}
          </Link>
        )
      )}

      {page < totalPages && (
        <Link href={`${basePath}?page=${page + 1}`} className="pagination-btn text-slate-600 hover:bg-slate-50 hover:text-slate-700">
          <ChevronRight size={18} />
        </Link>
      )}
    </div>
  );
})
