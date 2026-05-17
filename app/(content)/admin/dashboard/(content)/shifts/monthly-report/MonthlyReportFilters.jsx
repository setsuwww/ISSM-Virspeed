"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/_components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/Select";
import { Button } from "@/_components/ui/Button";
import { Search } from "lucide-react";
import dayjs from "dayjs";
import { useState, useEffect } from "react";

export function MonthlyReportFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentYear = dayjs().year();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [month, setMonth] = useState(searchParams.get("month") || String(dayjs().month() + 1));
  const [year, setYear] = useState(searchParams.get("year") || String(currentYear));

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
      params.set("month", month);
      params.set("year", year);
      params.set("page", "1"); // reset page on filter
      router.push(`${pathname}?${params.toString()}`);
    }, 500);

    return () => clearTimeout(handler);
  }, [search, month, year, pathname, router, searchParams]);

  return (
    <div className="flex items-center gap-2 pb-5">
      <Select value={month} onValueChange={setMonth}>
        <SelectTrigger className="w-fit">
          <span className="font-semibold text-slate-600 mr-1">Month:</span>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map(m => (
            <SelectItem key={m} value={String(m)}>
              {dayjs().month(m - 1).format('MMMM')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={year} onValueChange={setYear}>
        <SelectTrigger className="w-fit">
          <span className="font-semibold text-slate-600 mr-1">Year:</span>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map(y => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="Search user..."
        value={search} className="min-w-[280px] max-w-[250px] w-auto"
        onChange={(e) => setSearch(e.target.value)} typeSearch
      />
    </div>
  );
}
