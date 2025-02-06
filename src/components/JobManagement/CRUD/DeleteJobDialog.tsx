"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { CircleAlert, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";

interface DeleteJobDialogProps {
  triggerText: string; // Text for the trigger button
  title: string; // Title of the dialog
  description: React.ReactNode; // Allow JSX elements in description
  jobId: Id<"jobs">; // Correctly typed ID for the job
  jobTitle: string; // Title of the job to confirm deletion
  cancelText?: string; // Custom text for the cancel button (optional)
  confirmText?: string; // Custom text for the confirm button (optional)
}

export default function DeleteJobDialog({
  triggerText,
  title,
  description,
  jobId,
  jobTitle,
  cancelText = "Cancel",
  confirmText = "Delete",
}: DeleteJobDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteJob = useMutation(api.mutations.jobs.deleteJob); // Hook for Convex mutation

  const isConfirmed = inputValue === jobTitle;

  const handleConfirm = async () => {
    if (!isConfirmed || isDeleting) return;

    setIsDeleting(true);

    try {
      await deleteJob({ jobId }); // Call mutation with the job ID
      toast.success(`The job "${jobTitle}" was deleted successfully.`); // Success message with job title
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error(`Failed to delete the job "${jobTitle}". Please try again.`); // Error message with job title
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" aria-label="Delete Job" size="icon">
          <Trash2 size={18} aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border"
            aria-hidden="true"
          >
            <CircleAlert className="opacity-80" size={16} strokeWidth={2} />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center mb-4">{title}</DialogTitle>
            <DialogDescription className="sm:text-center">{description}</DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5">
          <div className="space-y-2">
            <Input
              id="job-title"
              type="text"
              placeholder={`Type "${jobTitle}" to confirm`} // Use the jobTitle here
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isDeleting}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1" disabled={isDeleting}>
                {cancelText}
              </Button>
            </DialogClose>
            <Button
              type="button"
              className="flex-1"
              disabled={!isConfirmed || isDeleting}
              onClick={handleConfirm}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" aria-hidden="true" />
                  Deleting...
                </>
              ) : (
                confirmText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}