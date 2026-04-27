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
            <TableHead>Time</TableHead>
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

              <TableCell className="font-semibold flex items-center gap-2">
                <div className={`p-2 rounded-full border ${shiftStyles[shift.type]}`}>
                  {shiftIcons[shift.type]}
                </div>
                {shift.name}
              </TableCell>

              <TableCell>
                <Badge className={shiftStyles[shift.type]}>
                  {shift.type}
                </Badge>
              </TableCell>

              <TableCell>{shift.timeRange}</TableCell>
              <TableCell>{shift.location}</TableCell>

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
