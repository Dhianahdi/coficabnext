"use client";

import * as React from "react";
import {
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    flexRender,
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableColumnHeader } from "./datatable/DataTableColumnHeader";
import { getCommonPinningStyles } from "@/lib/data-table"
import { Checkbox } from "../ui/checkbox";
import { StaticTasksTableFloatingBar } from "./components/StaticTasksTableFloatingBar";
import { TableViewOptions } from "./datatable/DataTableViewOptions";
import { ExportButton } from "../ui/ExportButton";
import { Bell, CheckCircle, Circle, CircleCheck, CircleCheckBig, CircleX, Clock, Ellipsis, FileText, Heart, Home, Loader, Settings, Star, Lock, Unlock, User, XCircle, EditIcon, Tags, TrashIcon, Plus, Edit } from "lucide-react";
import { DataTableFacetedFilter } from "./datatable/DataTableFacetedFilter";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import Image from "next/image";
import rogue from "../../../public/img/rogue.png";
import pilot from "../../../public/img/pilot.png";
import kiddo from "../../../public/img/kiddo.png";
import astro from "../../../public/img/astro.png";
import DateRangePicker from "./components/DateRangePicker";
import { DataTablePagination } from "./datatable/DataTablePagination";
import DeleteStoryDialog from "./CRUD/DeleteJobDialog";
import { Id } from "../../../convex/_generated/dataModel";
import BulkDeleteDialog from "./CRUD/BulkDeleteJobsDialog";
import { EmptyState } from "./components/ReusableEmptyState";
import DeleteRoleDialog from "./CRUD/DeleteJobDialog";
import { UpdateRole } from "./CRUD/UpdateRole";
import { useRouter } from "next/navigation";
import DeleteJobDialog from "./CRUD/DeleteJobDialog";

export type Job = {
    _id: string;
    title: string;
    description: string;
    recruiterName: string;
    departmentName: string;
    collaborators: string[];
    createdAt: string;
};

type JobsTableProps = {
    jobs: Job[];
};

export function JobsTable({ jobs }: JobsTableProps) {
    const router = useRouter();

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
    const [selectedStatus, setSelectedStatus] = React.useState<Set<string>>(new Set()); // New state for selected status
    const [selectedPrivacy, setSelectedPrivacy] = React.useState<Set<string>>(new Set()); // Change to Set<string>
    const [dateRange, setDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    });
    const [selectedPermissions, setSelectedPermissions] = React.useState<Set<string>>(new Set());

    // Determine if any filters are applied
    const isFiltered = selectedPermissions.size > 0;
    // Extract unique permissions for filtering
    /* const uniquePermissions = React.useMemo(() => {
        const allPermissions = roles.flatMap((role) => role.permissions);
        const uniquePermissions = Array.from(new Set(allPermissions)); // Remove duplicates
        return uniquePermissions.map((permission) => ({
            value: permission,
            label: permission,
        }));
    }, [roles]); */
    // Filter stories based on selected status and privacy
    // Filter roles based on selected permissions
    /* const filteredRoles = React.useMemo(() => {
        return roles.filter((role) => {
            // If no permissions are selected, include all roles
            if (selectedPermissions.size === 0) return true;

            // Check if the role has all selected permissions
            return Array.from(selectedPermissions).every((permission) =>
                role.permissions.includes(permission)
            );
        });
    }, [roles, selectedPermissions]); */


    const resetFilters = () => {
        setSelectedPermissions(new Set());
    };




    // Dynamically generate options from story statuses
    // Function to clear selected rows
    const handleClearSelection = () => {
        setSelectedRows(new Set());
        table.getRowModel().rows.forEach((row) => row.toggleSelected(false));
    };
    const columns: ColumnDef<Job>[] = [
        {
            id: "select",
            size: 50,
            minSize: 50,
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => {
                        const isChecked = value === true;
                        if (isChecked) {
                            const newSelectedRows = new Set(jobs.map((job) => job._id));
                            setSelectedRows(newSelectedRows);
                            table.getRowModel().rows.forEach((row) => row.toggleSelected(true));
                        } else {
                            handleClearSelection();
                        }
                    }}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => {
                const jobId = row.original._id;
                return (
                    <Checkbox
                        checked={selectedRows.has(jobId)}
                        onCheckedChange={(value) => {
                            const isChecked = value === true;
                            const updatedSelectedRows = new Set(selectedRows);
                            if (isChecked) {
                                updatedSelectedRows.add(jobId);
                            } else {
                                updatedSelectedRows.delete(jobId);
                            }
                            setSelectedRows(updatedSelectedRows);
                            row.toggleSelected(isChecked);
                        }}
                        aria-label={`Select ${row.original.title}`}
                    />
                );
            },
        },
        {
            accessorKey: "title",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Job Title" />,
            cell: ({ row }) => <span className="font-bold">{row.original.title}</span>,
        },
        {
            accessorKey: "description",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
            cell: ({ getValue }) => {
                const text = getValue<string>() || "N/A";
                return <span title={text}>{text.length > 30 ? `${text.slice(0, 30)}...` : text}</span>;
            },
        },
        {
            accessorKey: "recruiterName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Recruiter" />,
            cell: ({ row }) => <span>{row.original.recruiterName}</span>,
        },
        {
            accessorKey: "departmentName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
            cell: ({ row }) => <span>{row.original.departmentName}</span>,
        },
        {
            accessorKey: "collaborators",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Collaborators" />,
            cell: ({ row }) => {
                const collaborators = row.original.collaborators || [];
                return (
                    <div className="flex items-center gap-1">
                        {collaborators.map((name, index) => (
                            <Badge key={index} className="px-1 py-0.5 text-xs">{name}</Badge>
                        ))}
                    </div>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Posted On" />,
            cell: ({ row }) => format(new Date(row.original.createdAt), "MMM dd, yyyy, h:mm a"),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const job = row.original as Job;
                return (
                    <div className="flex justify-end">
                        {/* Add other actions like "Update Job" here if needed */}
                     
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit Role"
                            onClick={() => router.push(`/jobs/update/${job._id}`)}
                        >
                            <Edit size={16} strokeWidth={2} aria-hidden="true" />
                        </Button>
                        <DeleteJobDialog
                            triggerText="Delete"
                            title="Confirm Job Deletion"
                            description={`Are you sure you want to delete the job "${job.title}"? This action cannot be undone.`}
                            jobId={job._id as Id<"jobs">}
                            jobTitle={job.title}
                            cancelText="Cancel"
                            confirmText="Delete"
                        />
                    </div>
                );
            },
            size: 40,
        },
    ];

    const table = useReactTable({
        data: jobs,
        columns,
        state: { sorting, columnFilters, columnVisibility },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div>
            {/* Floating bar */}
            {selectedRows.size > 0 && (
                <StaticTasksTableFloatingBar
                    table={table}
                    setSelectedRows={setSelectedRows}
                />
            )}

            <div className="flex items-center justify-between py-4">
                {/* Search Input, Filters, and Date Range Picker */}
                <div className="flex items-center space-x-4 flex-grow">

                    {/* Title Filter */}
                    {/*   <Input
                        placeholder="Filter by title..."
                        value={(table.getColumn("title")?.getFilterValue() as string) || ""}
                        onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
                        className="w-full max-w-sm"
                    /> */}

                    {/* Status Filter Dropdown */}
                    {/*  <DataTableFacetedFilter
                        title="Permissions"
                        options={uniquePermissions}
                        selectedValues={selectedPermissions}
                        renderOption={(option) => (
                            <div className="flex items-center space-x-2">
                                <span>{option.label}</span>
                            </div>
                        )}
                        onChange={setSelectedPermissions}
                    />
 */}
                    {/* Reset Filters Button */}
                    {isFiltered && (
                        <Button
                            aria-label="Reset filters"
                            variant="ghost"
                            className="h-8 px-2 lg:px-3"
                            onClick={resetFilters} // Call resetFilters function
                        >
                            Reset
                            <XCircle className="ml-2 size-4" aria-hidden="true" />
                        </Button>
                    )}
                </div>

                {/* Export and View Buttons */}
                <div className="flex items-center space-x-2">
                    {/* Date Range Picker */}
                    <DateRangePicker
                        dateRange={dateRange}
                        placeholder="Select Date Range"
                        triggerVariant="outline"
                        triggerSize="sm"
                        onDateRangeChange={setDateRange} // Update the date range
                    />

                    <ExportButton
                        table={table}
                        filename="stories"
                        excludeColumns={["select", "actions"]}
                    />
                    <TableViewOptions
                        columns={table
                            .getAllColumns()
                            .filter((column) => column.id !== "select" && column.id !== "actions") // Exclude "select" and "actions" columns
                            .map((column) => ({
                                id: column.id,
                                isVisible: column.getIsVisible(),
                                toggleVisibility: () =>
                                    column.toggleVisibility(!column.getIsVisible()),
                                canHide: column.getCanHide(),
                            }))}
                    />

                </div>
            </div>



            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="w-auto whitespace-nowrap overflow-hidden text-ellipsis" style={{
                                        ...getCommonPinningStyles({ column: header.column }),
                                    }}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-2 w-auto whitespace-nowrap overflow-hidden text-ellipsis">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                >
                                    <div
                                        className="flex justify-center items-center text-center "
                                    >
                                        <EmptyState
                                            title="No Stories Yet"
                                            description="Begin your creative journey by adding a new story today!"
                                            imageSrc="/stories-empty-2.png"
                                            actionComponent={<Button onClick={() => router.push("/jobs/add")}>
                                                <Plus size={16} strokeWidth={2} aria-hidden="true" />
                                                <span>Add Job</span>
                                            </Button>}
                                        />

                                    </div>

                                </TableCell>
                            </TableRow>

                        )}
                    </TableBody>



                </Table>
            </div>
            <div className="flex justify-between items-center py-4">
                <DataTablePagination table={table} />

            </div>
        </div>
    );
}
