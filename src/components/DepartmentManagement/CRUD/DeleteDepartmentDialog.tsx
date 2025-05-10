"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2 } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface DeleteDepartmentDialogProps {
  triggerText: React.ReactNode;
  title: string;
  description: string;
  departmentId: Id<"departments">;
  departmentName: string;
  cancelText?: string;
  confirmText?: string;
}

export default function DeleteDepartmentDialog({
  triggerText,
  title,
  description,
  departmentId,
  departmentName,
  cancelText = "Annuler",
  confirmText = "Supprimer",
}: DeleteDepartmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteDepartment = useMutation(api.mutations.departments.deleteDepartment);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteDepartment({ departmentId });
      toast.success(`Le département "${departmentName}" a été supprimé avec succès.`);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(`Échec de la suppression du département: ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {typeof triggerText === "string" ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        ) : (
          triggerText
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? "Suppression en cours..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}