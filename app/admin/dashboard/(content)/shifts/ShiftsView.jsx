"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useCallback, useTransition } from "react";
import { UserCircle } from "phosphor-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/_components/ui/Table";

import { Button } from "@/_components/ui/Button";
import { Badge } from "@/_components/ui/Badge";
import { Checkbox } from "@/_components/ui/Checkbox";

import { capitalize } from "@/_function/globalFunction";
import { shiftStyles, shiftIcons } from "@/_constants/shiftConstants";

import {
  deleteShift,
  deleteManyShifts,
} from "@/_server/admin-action/shiftAction";

import ShiftsActionHeader from "./ShiftsActionHeader";

export function ShiftsView({ data }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [sortFilter, setSortFilter] = useState("A-Z");
  const [shiftFilter, setShiftFilter] = useState("ALL");

  const filteredData = useMemo(() => {
    let result = data;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) =>
        s.name.toLowerCase().includes(q)
      );
    }

    if (shiftFilter !== "ALL") {
      result = result.filter((s) => s.type === shiftFilter);
    }

    const sorted = [...result];

    if (sortFilter === "A-Z") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortFilter === "Z-A") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    }

    return sorted;
  }, [data, search, shiftFilter, sortFilter]);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(
    (checked) => {
      setSelectedIds(
        checked ? filteredData.map((s) => s.id) : []
      );
    },
    [filteredData]
  );

  const isAllSelected =
    filteredData.length > 0 &&
    selectedIds.length === filteredData.length;

  const handleDelete = (id) => {
    startTransition(async () => {
      await deleteShift(id);
      router.refresh();
    });
  };

  const handleDeleteSelected = () => {
    startTransition(async () => {
      await deleteManyShifts(selectedIds);
      setSelectedIds([]);
      router.refresh();
    });
  };

  const handleDeleteAll = () => {
    startTransition(async () => {
      await deleteManyShifts(
        filteredData.map((s) => s.id)
      );
      setSelectedIds([]);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <ShiftsActionHeader
        search={search}
        onSearchChange={setSearch}
        shiftFilter={shiftFilter}
        onShiftFilterChange={setShiftFilter}
        sortFilter={sortFilter}
        onSortFilterChange={setSortFilter}
        selectedCount={selectedIds.length}
        onDeleteSelected={handleDeleteSelected}
        onDeleteAll={handleDeleteAll}
        filteredData={filteredData}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData.map((shift) => (
            <TableRow key={shift.id}>
              <TableCell>
                <Checkbox
                  checked={selectedIds.includes(shift.id)}
                  onCheckedChange={() =>
                    toggleSelect(shift.id)
                  }
                />
              </TableCell>

              <TableCell className="font-semibold flex items-center gap-2">
                <div className={`p-2 rounded-full border ${shiftStyles[shift.type]}`}>
                  {shiftIcons[shift.type]}
                </div>
                {shift.name}
              </TableCell>

              <TableCell>
                <Badge className={shiftStyles[shift.type]}>
                  {capitalize(shift.type)}
                </Badge>
              </TableCell>

              <TableCell>{shift.timeRange}</TableCell>
              <TableCell>{shift.division}</TableCell>

              <TableCell>
                <Link
                  href={`/admin/dashboard/shifts/${shift.id}/list-users`}
                  className="flex items-center gap-1 text-sky-500"
                >
                  <UserCircle size={22} />
                  {shift.usersCount}
                </Link>
              </TableCell>

              <TableCell className="space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    router.push(
                      `/admin/dashboard/shifts/${shift.id}/edit`
                    )
                  }
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isPending}
                  onClick={() =>
                    handleDelete(shift.id)
                  }
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
