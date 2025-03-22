"use client";

import * as React from "react";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Edit, Search, Plus, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { DataTableFacetedFilter } from "@/components/JobManagement/datatable/DataTableFacetedFilter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";

export default function FormsPage() {
  const router = useRouter();
  const forms = useQuery(api.mutations.form.getFormsWithQuestions);
  const deleteForm = useMutation(api.mutations.form.deleteForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Set<string>>(new Set());
  const [selectedForm, setSelectedForm] = useState<any>(null); // Selected form for dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Dialog state

  // Filter forms
  const filteredForms = forms?.filter((form: any) => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus.size === 0 || selectedStatus.has(form.status || "");
    return matchesSearch && matchesStatus;
  });

  // Delete a form
  const handleDeleteForm = async (formId: Id<"forms">) => {
    try {
      await deleteForm({ formId });
      toast.success("Form deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete form.");
    }
  };

  // Open form details in a dialog
  const handleViewForm = (form: any) => {
    setSelectedForm(form);
    setIsDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedForm(null);
  };

  // Redirect to update form page
  const handleUpdateForm = (formId: Id<"forms">) => {
    router.push(`/form/update/${formId}`);
  };

  // Status filter options
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ];
  if (forms?.length === 0) {
    // No open jobs found
    return (
      <AdminPanelLayout>
        <ContentLayout title="Recent Jobs">
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
             <Image
               src="/img/NoResultFound.png" // Chemin relatif depuis le dossier public
               alt="No offers available"
                         width={700} // Desired width of the image
                         height={700} // Desired height of the image
                         className="object-cover" // Ensures the image scales properly
                       />
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  No forms available at the moment
                </h3>
                <p className="text-gray-600">
                  Check back later to discover new opportunities.
                </p>
              </div>
            </div>
        </ContentLayout>
      </AdminPanelLayout>
    );
  }
  return (
    <AdminPanelLayout>
      <ContentLayout title="Form Management">
        <div className="p-6 space-y-6">
          
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Forms Management
            </h1>          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Search forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            
            </div>
            <Button onClick={() => router.push("/form/add")} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Form
            </Button>
          </div>

          {/* Form list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms?.map((form: any) => (
              <Card key={form._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{form.title}</CardTitle>
                  <CardDescription>{form.description}</CardDescription>
                  <Badge className="w-fit mt-2" variant={form.status === "draft" ? "secondary" : "default"}>
                    {form.status || "Public"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {form.questions.length} questions
                  </p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewForm(form)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateForm(form._id)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteForm(form._id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Dialog to view form details */}
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedForm?.title}</DialogTitle>
              <DialogDescription>{selectedForm?.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <h3 className="font-semibold">Questions</h3>
              {selectedForm?.questions.map((question: any, index: number) => (
                <Card key={index} className="p-4">
                  <CardHeader className="p-0">
                    <CardTitle className="text-lg">{question.text}</CardTitle>
                    <Badge variant="outline" className="mt-2">
                      {question.type}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0 mt-2">
                    {question.type === "single-choice" || question.type === "multiple-choice" ? (
                      <ul className="list-disc pl-6">
                        {question.options?.map((option: string, optionIndex: number) => (
                          <li key={optionIndex}>{option}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">Open-ended question</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </ContentLayout>
    </AdminPanelLayout>
  );
}