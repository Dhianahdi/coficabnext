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
import { Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface BulkDeleteDepartmentsDialogProps {
  triggerText: React.ReactNode;
  title: string;
  description: string;
  selectedDepartmentIds: Id<"departments">[];
  confirmText?: string;
  onSuccess?: () => void;
}

export default function BulkDeleteDepartmentsDialog({
  triggerText,
  title,
  description,
  selectedDepartmentIds,
  confirmText = "Confirmer la suppression",
  onSuccess,
}: BulkDeleteDepartmentsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteDepartment = useMutation(api.mutations.departments.deleteDepartment);

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      
      // Supprimer chaque département sélectionné
      for (const departmentId of selectedDepartmentIds) {
        await deleteDepartment({ departmentId });
      }
      
      toast.success(`${selectedDepartmentIds.length} départements ont été supprimés avec succès.`);
      setIsOpen(false);
      
      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      toast.error(`Échec de la suppression des départements: ${error instanceof Error ? error.message : "Erreur inconnue"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerText}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? "Suppression..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}