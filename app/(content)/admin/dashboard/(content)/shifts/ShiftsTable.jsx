"use client";

import Link from "next/link";
import { UserCircle } from "phosphor-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/Table";

import { Button } from "@/_components/ui/Button";
import { Badge } from "@/_components/ui/Badge";
import { Checkbox } from "@/_components/ui/Checkbox";

import { shiftStyles, shiftIcons } from "@/_components/_constants/shiftConstants";

import ShiftsActionHeader from "./ShiftsActionHeader";
import { useHandleShifts } from "@/_clients/handlers/admin/useHandleShifts";
import { Building2 } from "lucide-react";

export function ShiftsTable({ data }) {

  const {
    search, setSearch,
    sortFilter, setSortFilter,
    shiftFilter, setShiftFilter,
    selectedIds,
    filteredData,
    isAllSelected,
    isPending,

    toggleSelect, selectAll,
    handleEditShift, handleDeleteShift,
    deleteSelected, deleteAll,
  } = useHandleShifts(data);

  return (
    <div className="space-y-4">
      <ShiftsActionHeader
        search={search} onSearchChange={setSearch}
        shiftFilter={shiftFilter} onShiftFilterChange={setShiftFilter}
        sortFilter={sortFilter} onSortFilterChange={setSortFilter}
        selectedCount={selectedIds.length}
        onDeleteSelected={deleteSelected} onDeleteAll={deleteAll}
        filteredData={filteredData}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox checked={isAllSelected} onCheckedChange={selectAll} />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData.map((shift) => (
            <TableRow key={shift.id}>
              <TableCell>
                <Checkbox checked={selectedIds.includes(shift.id)}
                  onCheckedChange={() =>
                    toggleSelect(shift.id)
                  }
                />
              </TableCell>

              <TableCell className="flex items-center gap-3">
                <div className={`p-2 rounded-full border ${shiftStyles[shift.type]}`}>
                  {shiftIcons[shift.type]}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-600">{shift.name}</p>
                  </div>
                  <p className="text-xs text-slate-400">{shift.timeRange}</p>
                </div>
              </TableCell>

              <TableCell>
                <Badge className={shiftStyles[shift.type]}>
                  {shift.type}
                </Badge>
              </TableCell>

              <TableCell>
                <Badge className="bg-blue-50 text-blue-700 border-sky-100">
                  <Building2 className="mr-1" size={16} />
                  {shift.location}
                </Badge>
              </TableCell>

              <TableCell>
                <Link href={`/admin/dashboard/shifts/${shift.id}/list-users`} className="flex items-center gap-1 text-sky-500">
                  <UserCircle size={22} />
                  {shift.usersCount} Users
                </Link>
              </TableCell>

              <TableCell className="space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleEditShift(shift.id)}>
                  Edit
                </Button>

                <Button size="sm" variant="destructive" disabled={isPending} onClick={() => handleDeleteShift(shift.id)}>
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
