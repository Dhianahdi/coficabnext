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
import { Check, X, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Spinner } from "@/components/ui/spinner";
import { EditUser } from "./CRUD/EditUser";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";

export function UsersTable() {
  const usersQuery = useQuery(api.mutations.user.fetchAllUsers);
  const departmentsQuery = useQuery(api.mutations.departments.getAllDepartments);
  const inviteUserMutation = useMutation(api.mutations.user.inviteUser);

  const isLoading = usersQuery === undefined || departmentsQuery === undefined;
  const users = usersQuery ?? [];
  const departments = departmentsQuery ?? [];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [isInviteDialogOpen, setIsInviteDialogOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState<Id<"departments"> | "">("");
  const [searchEmail, setSearchEmail] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

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
          header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
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
          accessorKey: "status",
          header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
          cell: ({ row }) => (
              <div className="flex items-center gap-2">
                  {row.original.status === "invited" ||"Acepted"  ? (
                      <Check className="h-4 w-4 text-green-500" />
                  ) : (
                      <X className="h-4 w-4 text-red-500" />
                  )}
                  <span>{row.original.status}</span>
              </div>
          ),
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

  const handleInviteUser = async () => {
    if (!email || !departmentId) {
      toast.error("Please enter a valid email and select a department.");
      return;
    }

    try {
        setIsSending(true); // Activer l'état de chargement
        const result = await inviteUserMutation({ email, departmentId });
      toast.success(result.message);

      // Envoyer l'email d'invitation via l'API Next.js
      const invitationLink = `http://localhost:3000/invite?email=${encodeURIComponent(email)}`;
      const template = `
      <div style="
        font-family: Arial, sans-serif;
        color: #000;
        background-color: #ffffff;
        padding: 40px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 600px;
        margin: 0 auto;
      ">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="
            font-size: 28px;
            font-weight: bold;
            color: #111827;
            margin: 0;
          ">
            🎉 You've Been Invited!
          </h1>
          <p style="
            font-size: 16px;
            color: #6b7280;
            margin-top: 10px;
          ">
            Welcome to our platform! Let's get started.
          </p>
        </div>
    
        <!-- Content -->
        <div style="
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        ">
          <p style="
            font-size: 16px;
            color: #374151;
            margin: 0;
          ">
            Click the button below to complete your registration:
          </p>
          <a href="${invitationLink}" style="
            display: inline-block;
            background-color: #3b82f6;
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            margin-top: 20px;
          ">
            Complete Registration
          </a>
        </div>
    
        <!-- Footer -->
        <div style="
          text-align: center;
          margin-top: 30px;
          font-size: 14px;
          color: #6b7280;
        ">
          <p style="margin: 0;">
            If you did not request this invitation, please ignore this email.
          </p>
          <p style="margin: 10px 0 0;">
            Need help? <a href="mailto:support@example.com" style="color: #3b82f6; text-decoration: none;">Contact support</a>.
          </p>
        </div>
      </div>
    `;

      const response = await fetch("/api/costummail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          subject: "Invitation to Join Our Platform",
          template,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send invitation email.");
      }

      toast.success("Invitation email sent successfully!");
      setIsInviteDialogOpen(false);
      setEmail("");
      setDepartmentId("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
        setIsSending(false); // Désactiver l'état de chargement
      }
  };

  const filteredUsers = users.filter((user) =>
      user.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  if (isLoading) {
      return <Spinner size="sm" />;
  }

  return (
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          {/* Invite User Button and Search */}
          <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                  <Button onClick={() => setIsInviteDialogOpen(true)} className="bg-black text-white hover:bg-gray-800">
                      Invite User
                  </Button>
                  <Input
                      placeholder="Search by email..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="w-full max-w-sm"
                  />
              </div>
              <div className="flex items-center gap-4">
                  <ExportButton table={table} filename="users" excludeColumns={["select", "actions"]} />
                  <TableViewOptions columns={table.getAllColumns().map(col => ({
                      id: col.id,
                      isVisible: col.getIsVisible(),
                      toggleVisibility: col.toggleVisibility
                  }))} />
              </div>
          </div>

          {/* Invite User Dialog */}
       {/* Invite User Dialog */}
<Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
  <DialogContent className="bg-white">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold text-gray-900">Invite User</DialogTitle>
      <DialogDescription className="text-gray-600">
        Enter the user's email and select their department.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
        <Input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          type="email"
          className="rounded-lg border border-gray-300 focus:border-black focus:ring-black"
        />
      </div>
      <div>
        <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department</Label>
        <div className="grid grid-cols-2 gap-4">
          {departments.map((department: any) => (
            <Card
              key={department._id}
              onClick={() => setDepartmentId(department._id)}
              className={`cursor-pointer ${
                departmentId === department._id
                  ? "border-2 border-black"
                  : "border border-gray-300"
              }`}
            >
              <CardHeader>
                <CardTitle className="text-lg">{department.name}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setIsInviteDialogOpen(false)}
        className="rounded-lg border border-gray-300 hover:bg-gray-100"
      >
        Cancel
      </Button>
      <Button
        onClick={handleInviteUser}
        disabled={isSending} // Désactiver le bouton pendant l'envoi
        className="bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
      >
        {isSending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> {/* Afficher un spinner */}
            Sending...
          </>
        ) : (
          "Send Invitation"
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

          {/* Users Table */}
          <Table>
              <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                              <TableHead key={header.id} className="text-gray-900">
                                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                              </TableHead>
                          ))}
                      </TableRow>
                  ))}
              </TableHeader>
              <TableBody>
  {table.getRowModel().rows.length ? (
    table.getRowModel().rows.map((row) => (
      <TableRow key={row.id}> {/* row.id est fourni par @tanstack/react-table */}
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}> {/* cell.id est fourni par @tanstack/react-table */}
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={columns.length} className="text-center py-4 text-gray-900">
        No users found.
      </TableCell>
    </TableRow>
  )}
</TableBody>
          </Table>
      </div>
  );
}