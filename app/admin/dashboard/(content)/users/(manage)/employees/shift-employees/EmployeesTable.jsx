"use client";

import { Table, TableBody, TableHead, TableHeader, TableCell, TableRow } from "@/_components/ui/Table";
import { Checkbox } from "@/_components/ui/Checkbox";
import EmptyStates from "@/_components/common/EmptyStates";

import { EmployeesActionHeader } from "../EmployeesActionHeader";
import { EmployeesRow } from "./EmployeesRow";
import { useShiftEmployeesHooks } from "@/_client/hooks/admin/useShiftEmployeesHooks";

export default function EmployeesTable({ users, divisions, shifts }) {
  const {
    search, setSearch,
    selected, setSelected,
    data, filteredData,
    divisionFilter, setDivisionFilter,
    shiftFilter, onShiftFilterChange,
    toggleSelect, deleteSelected,
    deleteAll,
    onHistory, onSwitch, onEdit, onDelete,
  } = useShiftEmployeesHooks(users, shifts);

  return (
    <div className="space-y-4">
      <EmployeesActionHeader
        search={search} setSearch={setSearch}
        selected={selected} onDeleteSelected={deleteSelected}
        onDeleteAll={deleteAll} filteredData={filteredData}
        divisionFilter={divisionFilter} setDivisionFilter={setDivisionFilter}
        shiftFilter={shiftFilter} onShiftFilterChange={onShiftFilterChange}
        divisions={divisions}
        shifts={shifts}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="flex items-center">
              <Checkbox checked={selected.length === data.length && data.length > 0}
                onCheckedChange={(value) => setSelected(value ? data.map((u) => u.id) : [])}
              />
            </TableHead>
            <TableHead>Employees</TableHead>
            <TableHead>Shifts</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Created & Updated</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center">
                <EmptyStates/>
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((user) => (
              <EmployeesRow
                key={user.id}
                user={user}
                selected={selected}
                toggleSelect={toggleSelect}
                onHistory={() => onHistory(user.id)}
                onSwitch={onSwitch}
                onEdit={() => onEdit(user.id)}
                onDelete={() => onDelete(user.id)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
