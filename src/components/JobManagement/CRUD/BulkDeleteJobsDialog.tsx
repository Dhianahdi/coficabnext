import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CircleAlert } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface BulkDeleteJobsDialogProps {
    triggerText: React.ReactNode; // ReactNode for flexible trigger styling
    title: string; // Title of the dialog
    description: React.ReactNode; // Allow JSX elements in description
    selectedJobIds: Id<"jobs">[]; // Array of selected job IDs to delete
    cancelText?: string; // Custom text for the cancel button (optional)
    confirmText?: string; // Custom text for the confirm button (optional)
    onSuccess?: () => void; // Callback on successful deletion (optional)
}

export default function BulkDeleteJobsDialog({
    triggerText,
    title,
    description,
    selectedJobIds,
    cancelText = "Cancel",
    confirmText = "Delete",
    onSuccess,
}: BulkDeleteJobsDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const bulkDeleteJobs = useMutation(api.mutations.jobs.bulkDeleteJobs);

    const handleConfirm = async () => {
        if (isDeleting || selectedJobIds.length === 0) return;

        setIsDeleting(true);

        try {
            const deletedCount = await bulkDeleteJobs({ jobIds: selectedJobIds });
            toast.success(`${deletedCount} jobs deleted successfully.`); // Show success notification
            onSuccess?.(); // Trigger success callback
        } catch (error) {
            console.error("Error deleting jobs:", error);
            toast.error("An unexpected error occurred. Please try again."); // Show error notification
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>{triggerText}</AlertDialogTrigger>
            <AlertDialogContent>
                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                    <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
                        aria-hidden="true"
                    >
                        <CircleAlert className="opacity-80" size={16} strokeWidth={2} />
                    </div>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{title}</AlertDialogTitle>
                        <AlertDialogDescription>{description}</AlertDialogDescription>
                    </AlertDialogHeader>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} disabled={isDeleting}>
                        {isDeleting ? (
                            <>
                                <Loader2 className="animate-spin mr-2 h-4 w-4" aria-hidden="true" />
                                Deleting...
                            </>
                        ) : (
                            confirmText
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}