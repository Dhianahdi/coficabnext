"use client";

import * as React from "react";
import {
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableColumnHeader } from "./datatable/DataTableColumnHeader";
import { Checkbox } from "../ui/checkbox";
import { TableViewOptions } from "./datatable/DataTableViewOptions";
import { ExportButton } from "../ui/ExportButton";
import { XCircle } from "lucide-react";
import { DataTableFacetedFilter } from "./datatable/DataTableFacetedFilter";
import { format } from "date-fns";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Spinner } from "@/components/ui/spinner";
import { EditUser } from "./CRUD/EditUser";
//import { DeleteUserDialog } from "./CRUD/DeleteUserDialog";

export function UsersTable() {
  const usersQuery = useQuery(api.mutations.user.fetchAllUsers);
  const isLoading = usersQuery === undefined;
  const users = usersQuery ?? [];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const columns: ColumnDef<any>[] = [
      {
          id: "select",
          header: ({ table }) => (
              <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  onCheckedChange={(value) => {
                      table.toggleAllRowsSelected(!!value);
                  }}
                  aria-label="Select all"
              />
          ),
          cell: ({ row }) => (
              <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  aria-label={`Select ${row.original.name}`}
              />
          ),
      },
      {
          accessorKey: "name",
          header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
          cell: ({ row }) => <span className="font-bold">{row.original.name || "N/A"}</span>,
      },
      {
        accessorKey: "email",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => <span className="font-bold">{row.original.email || "N/A"}</span>,
    },
      {
          accessorKey: "role",
          header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
          cell: ({ row }) => row.original.role?.name || "N/A",
      },
      {
          accessorKey: "department",
          header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
          cell: ({ row }) => row.original.department?.name || "N/A",
      },
   
      {
          id: "actions",
          cell: ({ row }) => (
              <div className="flex justify-end">
                  <EditUser user={row.original} />
              </div>
          ),
      },
  ];

  const table = useReactTable({
      data: users,
      columns,
      state: { sorting, columnFilters, columnVisibility },
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onColumnVisibilityChange: setColumnVisibility,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
      return <Spinner size="sm" />;
  }

  return (
      <div>
          <div className="flex items-center justify-between py-4">
              <Input placeholder="Search users..." className="w-full max-w-sm" />
              <ExportButton table={table} filename="users" excludeColumns={["select", "actions"]} />
              <TableViewOptions columns={table.getAllColumns().map(col => ({
                  id: col.id,
                  isVisible: col.getIsVisible(),
                  toggleVisibility: col.toggleVisibility
              }))} />
          </div>
          <Table>
              <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                              <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                          ))}
                      </TableRow>
                  ))}
              </TableHeader>
              <TableBody>
                  {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row) => (
                          <TableRow key={row.id}>{row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                          ))}</TableRow>
                      ))
                  ) : (
                      <TableRow>
                          <TableCell colSpan={columns.length} className="text-center py-4">No users found.</TableCell>
                      </TableRow>
                  )}
              </TableBody>
          </Table>
      </div>
  );
}
