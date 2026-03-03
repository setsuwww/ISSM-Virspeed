"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SelectEntriesPagination } from "@/_components/common/SelectEntriesPagination";

export const Pagination = React.memo(function ({
  page,
  totalPages,
  basePath = "/",
  limit = 10,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function getPages(page, total) {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= page - delta && i <= page + delta)
      ) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l > 2) rangeWithDots.push("…");
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }

  function handleLimitChange(e) {
    const newLimit = e.target.value;

    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newLimit);
    params.set("page", 1);

    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="flex items-center justify-between mt-4 px-1">

      <SelectEntriesPagination
        limit={limit}
        basePath={basePath}
      />

      <div className="flex items-center gap-1">
        {page > 1 && (
          <Link
            href={`${basePath}?page=${page - 1}&limit=${limit}`}
            className="pagination-btn"
          >
            <ChevronLeft size={18} />
          </Link>
        )}

        {getPages(page, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={i} className="px-3 text-slate-400">
              …
            </span>
          ) : (
            <Link
              key={i}
              href={`${basePath}?page=${p}&limit=${limit}`}
              className={`pagination-btn ${
                p === page ? "active" : ""
              }`}
            >
              {p}
            </Link>
          )
        )}

        {page < totalPages && (
          <Link
            href={`${basePath}?page=${page + 1}&limit=${limit}`}
            className="pagination-btn"
          >
            <ChevronRight size={18} />
          </Link>
        )}
      </div>
    </div>
  );
});
