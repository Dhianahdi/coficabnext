"use client";

import * as React from "react";
import { CheckCircle2, Loader, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Portal } from "../../ui/portal";
import { Id } from "../../../../convex/_generated/dataModel";
import BulkDeleteDepartmentsDialog from "../CRUD/BulkDeleteDepartmentsDialog";

type StaticTasksTableFloatingBarProps = {
    table: any; // L'instance de React Table
    setSelectedRows: React.Dispatch<React.SetStateAction<Set<string>>>; // Prop pour gérer les lignes sélectionnées
};

export function StaticTasksTableFloatingBar({
    table,
    setSelectedRows,
}: StaticTasksTableFloatingBarProps) {
    const [isPending, setIsPending] = React.useState(false);

    const selectedRows = table.getSelectedRowModel().rows;
    
    // Extraire les IDs
    const selectedRowIds = selectedRows
        .map((row: any) => row.original?._id)
        .filter(Boolean); // Supprimer les IDs invalides

    // Effacer les lignes sélectionnées
    const handleClearSelection = () => {
        setSelectedRows(new Set());
        table.getRowModel().rows.forEach((row: any) => row.toggleSelected(false));
    };

    return (
        <TooltipProvider>
            <Portal>
                <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit px-2.5">
                    <div className="w-full overflow-x-auto">
                        <div className="mx-auto flex w-fit items-center gap-2 rounded-md border bg-background p-2 text-foreground shadow">
                            <div className="flex h-7 items-center rounded-md border border-dashed pl-2.5 pr-1">
                                <span className="whitespace-nowrap text-xs">
                                    {selectedRows.length} sélectionnés
                                </span>
                                <Separator orientation="vertical" className="ml-2 mr-1" />
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-5 hover:border"
                                            onClick={handleClearSelection}
                                        >
                                            <X className="size-3.5 shrink-0" aria-hidden="true" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Effacer la sélection</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <Separator orientation="vertical" className="hidden h-5 sm:block" />
                            <div className="flex items-center gap-1.5">
                                {/* Boutons d'action */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="size-7 border"
                                            disabled={isPending}
                                        >
                                            {isPending ? (
                                                <Loader className="size-3.5 animate-spin" aria-hidden="true" />
                                            ) : (
                                                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Mettre à jour le statut</p>
                                    </TooltipContent>
                                </Tooltip>
                                {/* BulkDeleteDepartmentsDialog */}
                                <BulkDeleteDepartmentsDialog
                                    triggerText={
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="size-7 border"
                                            disabled={selectedRows.length === 0}
                                        >
                                            <Trash2 className="size-3.5" aria-hidden="true" />
                                        </Button>
                                    }
                                    title="Supprimer les départements sélectionnés"
                                    description="Êtes-vous sûr de vouloir supprimer les départements sélectionnés ? Cette action ne peut pas être annulée."
                                    selectedDepartmentIds={selectedRowIds as Id<"departments">[]}
                                    confirmText="Confirmer la suppression"
                                    onSuccess={handleClearSelection}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Portal>
        </TooltipProvider>
    );
}