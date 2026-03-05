"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/Select";

import { useRouter, useSearchParams } from "next/navigation";

export function SelectEntriesPagination({ limit, basePath }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleLimitChange(value) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", value);
    params.set("page", "1");

    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <span>Show</span>

      <Select value={String(limit)} onValueChange={handleLimitChange}>
        <SelectTrigger className="w-[66px] h-8 rounded-full">
          <SelectValue placeholder="10" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="30">30</SelectItem>
        </SelectContent>
      </Select>

      <span>entries</span>
    </div>
  );
}
