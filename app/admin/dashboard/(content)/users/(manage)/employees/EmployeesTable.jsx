"use client";

import { useRouter } from "next/navigation";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/_components/ui/Table";
import { Checkbox } from "@/_components/ui/Checkbox";
import { EmployeesActionHeader } from "./EmployeesActionHeader";
import { EmployeesRow } from "./EmployeesRow";
import { useEmployeesHooks } from "@/_client/hooks/useEmployeesHooks";

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
  } = useEmployeesHooks(users, shifts);

  const router = useRouter();

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
            <TableHead>Role</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Created & Updated</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData.map((user) => (
            <EmployeesRow key={user.id} user={user} selected={selected} toggleSelect={toggleSelect}
              onHistory={() => onHistory(user.id)}
              onSwitch={onSwitch}
              onEdit={() => onEdit(user.id)}
              onDelete={() => onDelete(user.id)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
