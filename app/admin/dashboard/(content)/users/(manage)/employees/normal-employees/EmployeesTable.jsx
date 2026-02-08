"use client";

import EmptyStates from "@/_components/common/EmptyStates";
import { Table, TableBody, TableHead, TableHeader, TableCell, TableRow } from "@/_components/ui/Table";
import { Checkbox } from "@/_components/ui/Checkbox";

import { EmployeesActionHeader } from "../EmployeesActionHeader";
import { EmployeesRow } from "./EmployeesRow";
import { useNormalEmployeesHooks } from "@/_client/hooks/admin/useNormalEmployeesHooks";

export default function EmployeesTable({ users = [], divisions = [] }) {
  const {
    search, setSearch,
    selected, setSelected,
    data, filteredData, divisionFilter, setDivisionFilter,
    toggleSelect, deleteSelected,
    onHistory, onEdit, onDelete,
  } = useNormalEmployeesHooks(users);

  return (
    <div className="space-y-4">
      <EmployeesActionHeader mode="work-hours"
        search={search} setSearch={setSearch}
        selected={selected} onDeleteSelected={deleteSelected} onDeleteAll={() => { }}
        filteredData={filteredData} divisionFilter={divisionFilter} setDivisionFilter={setDivisionFilter}
        divisions={divisions}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="flex items-center">
              <Checkbox
                checked={data.length > 0 && selected.length === data.length}
                onCheckedChange={(value) =>
                  setSelected(value ? data.map((u) => u.id) : [])
                }
              />
            </TableHead>
            <TableHead>Employees</TableHead>
            <TableHead>Work Hours</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Created & Updated</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center">
                <EmptyStates />
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
                onEdit={() => onEdit(user.id)}
                onDelete={() => onDelete(user.id)}
              />
            ))
          )}
      </TableBody>
    </Table>
    </div >
  );
}
