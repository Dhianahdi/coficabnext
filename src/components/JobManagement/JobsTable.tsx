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
import { Bell, CheckCircle, Circle, CircleCheck, CircleCheckBig, CircleX, Clock, Ellipsis, FileText, Heart, Home, Loader, Settings, Star, Lock, Unlock, User, XCircle, EditIcon, Tags, TrashIcon, Plus, Edit, Calendar } from "lucide-react";
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
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export type Job = {
    _id: string;
    title: string;
    description: string;
    recruiterName: string;
    recruiterImage: string;
    recruiterEmail: string;
    departmentName: string;
    collaborators: string[];
    tags?: string[]; // Keywords for filtering
    employmentType?: string; // Full-time, Part-time, Contract, Internship
    experienceLevel?: string; // Experience level
    status: "Pending" | "Open" | "Closed"; // Job status
    createdAt: string; // Date when the job was created
};


type JobsTableProps = {
    jobs: Job[];
};

export function JobsTable({ jobs }: JobsTableProps) {
    const router = useRouter();
    const updateJobStatus = useMutation(api.mutations.jobs.updateJobStatus);
    const experienceLevelOptions = useQuery(api.queries.jobs.getExperienceLevelOptions) || [];
    const employmentTypeOptions = useQuery(api.queries.jobs.getEmploymentTypeOptions) || [];

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
    const [selectedStatus, setSelectedStatus] = React.useState<Set<string>>(new Set());
    const [selectedEmploymentType, setSelectedEmploymentType] = React.useState<Set<string>>(new Set());
    const [selectedExperienceLevel, setSelectedExperienceLevel] = React.useState<Set<string>>(new Set());
    const [dateRange, setDateRange] = React.useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    });

    const statusIcons = {
        Pending: <Clock size={12} className="text-yellow-500 -ms-0.5 " strokeWidth={2} aria-hidden="true" />,
        Open: <CheckCircle size={12} className="text-green-500 -ms-0.5 " strokeWidth={2} aria-hidden="true" />,
        Closed: <XCircle size={12} className="text-red-500 -ms-0.5 " strokeWidth={2} aria-hidden="true" />,
    };

    const statusColors = {
        Pending: "yellow",
        Open: "green",
        Closed: "red",
    };

    // Determine if any filters are applied
    const isFiltered = selectedStatus.size > 0 || selectedEmploymentType.size > 0 || selectedExperienceLevel.size > 0;

    // Filter jobs based on selected status, employment type, and experience level
    const filteredJobs = React.useMemo(() => {
        return jobs.filter((job) => {
            const statusMatch = selectedStatus.size === 0 || selectedStatus.has(job.status);
            const employmentTypeMatch = selectedEmploymentType.size === 0 || selectedEmploymentType.has(job.employmentType || "N/A");
            const experienceLevelMatch = selectedExperienceLevel.size === 0 || selectedExperienceLevel.has(job.experienceLevel || "N/A");
            return statusMatch && employmentTypeMatch && experienceLevelMatch;
        });
    }, [jobs, selectedStatus, selectedEmploymentType, selectedExperienceLevel]);

    const resetFilters = () => {
        setSelectedStatus(new Set());
        setSelectedEmploymentType(new Set());
        setSelectedExperienceLevel(new Set());
    };

    const defaultRenderOption = (option: { value: string; label: string }) => (
        <div className="flex items-center space-x-2">
            <span>{option.label}</span>
        </div>
    );

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
            maxSize: 50,
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
            minSize: 150,
            size: 200,
            maxSize: 300,
        },
        {
            accessorKey: "recruiterName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Recruiter" />,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    {row.original.recruiterImage && (
                        <img
                            src={row.original.recruiterImage}
                            alt={`${row.original.recruiterName}'s avatar`}
                            className="h-8 w-8 rounded-full flex-shrink-0"
                        />
                    )}
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold truncate">{row.original.recruiterName}</span>
                        <span className="text-sm text-muted-foreground truncate">{row.original.recruiterEmail}</span>
                    </div>
                </div>
            ),
            minSize: 200,
            size: 300,
            maxSize: 450,
        },
        {
            accessorKey: "departmentName",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
            cell: ({ row }) => (
                <Badge variant="outline" className="truncate px-2 py-1">
                    {row.original.departmentName}
                </Badge>
            ),
            minSize: 120,
            size: 150,
            maxSize: 200,
        },
        {
            accessorKey: "experienceLevel",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Experience" />,
            cell: ({ row }) => (
                <Badge variant="outline" className="truncate px-2 py-1">
                    {row.original.experienceLevel || "N/A"}
                </Badge>
            ),
            minSize: 100,
            size: 130,
            maxSize: 160,
        },
        {
            accessorKey: "tags",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Tags" />,
            cell: ({ row }) => {
                const tags = row.original.tags || [];
                const maxVisibleTags = 2;
                const visibleTags = tags.slice(0, maxVisibleTags);
                const remainingTags = tags.slice(maxVisibleTags);

                return (
                    <div className="flex items-center gap-1 min-w-0">
                        {visibleTags.map((tag, index) => (
                            <Badge key={index} className="px-1 py-0.5 text-xs whitespace-nowrap">
                                {tag}
                            </Badge>
                        ))}
                        {remainingTags.length > 0 && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Badge className="px-1 py-0.5 text-xs whitespace-nowrap">
                                            +{remainingTags.length} more
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <span>{remainingTags.join(", ")}</span>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                );
            },
            minSize: 150,
            size: 200,
            maxSize: 300,
        },
        {
            accessorKey: "employmentType",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Employment" />,
            cell: ({ row }) => (
                <Badge variant="outline" className="truncate px-2 py-1">
                    {row.original.employmentType || "N/A"}
                </Badge>
            ),
            minSize: 120,
            size: 150,
            maxSize: 200,
        },
       
        {
            accessorKey: "status",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
            cell: ({ row }) => {
                const status = row.original.status;
                const statusColor = statusColors[status] || "gray";
                const icon = statusIcons[status];

                return (
                    <Badge className="gap-1 whitespace-nowrap">
                        {icon}
                        {status}
                    </Badge>
                );
            },
            minSize: 100,
            size: 120,
            maxSize: 150,
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => <DataTableColumnHeader column={column} title="Posted On" />,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <span>{format(new Date(row.original.createdAt), "MMM dd, yyyy, h:mm a")}</span>
                </div>
            ),
            minSize: 160,
            size: 180,
            maxSize: 200,
        },
        {
            id: "actions",

            accessorKey: "Actions",
            cell: ({ row }) => {
                const job = row.original as Job;
                return (
                    <div className="flex justify-end items-center ">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit Role"
                            onClick={() => router.push(`/Recruiterjobs/update/${job._id}`)}
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Update Status">
                                    <Ellipsis size={16} strokeWidth={2} aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuRadioGroup
                                    value={job.status}
                                    onValueChange={async (newStatus) => {
                                        try {
                                            await updateJobStatus({
                                                jobId: job._id as Id<"jobs">,
                                                status: newStatus as "Pending" | "Open" | "Closed",
                                            });
                                        } catch (error) {
                                            console.error("Failed to update job status:", error);
                                        }
                                    }}
                                >
                                    {Object.entries(statusIcons).map(([status, icon]) => (
                                        <DropdownMenuRadioItem key={status} value={status}>
                                            <div className="flex justify-between w-full items-center">
                                                <span>{status}</span>
                                                {icon}
                                            </div>
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
            size: 120,
            maxSize: 120,
        },
    ];


    const table = useReactTable({
        data: filteredJobs,
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
                    {/* Status Filter Dropdown */}
                    <DataTableFacetedFilter
                        title="Status"
                        options={["Pending", "Open", "Closed"].map((status) => ({
                            value: status,
                            label: status,
                        }))}
                        selectedValues={selectedStatus}
                        onChange={setSelectedStatus}
                        renderOption={defaultRenderOption}
                    />

                    {/* Employment Type Filter Dropdown */}
                    <DataTableFacetedFilter
                        title="Employment Type"
                        options={employmentTypeOptions.map((type) => ({
                            value: type.value,
                            label: type.label,
                        }))}
                        selectedValues={selectedEmploymentType}
                        onChange={setSelectedEmploymentType}
                        renderOption={defaultRenderOption}
                    />

                    {/* Experience Level Filter Dropdown */}
                    <DataTableFacetedFilter
                        title="Experience Level"
                        options={experienceLevelOptions.map((level) => ({
                            value: level.value,
                            label: level.label,
                        }))}
                        selectedValues={selectedExperienceLevel}
                        onChange={setSelectedExperienceLevel}
                        renderOption={defaultRenderOption}
                    />

                    {/* Reset Filters Button */}
                    {isFiltered && (
                        <Button
                            aria-label="Reset filters"
                            variant="ghost"
                            className="h-8 px-2 lg:px-3"
                            onClick={resetFilters}
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
                        onDateRangeChange={setDateRange}
                    />

                    <ExportButton
                        table={table}
                        filename="jobs"
                        excludeColumns={["select", "actions"]}
                    />
                    <TableViewOptions
                        columns={table
                            .getAllColumns()
                            .filter((column) => column.id !== "select" && column.id !== "actions")
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
                                            actionComponent={<Button onClick={() => router.push("/Recruiterjobs/add")}>
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
