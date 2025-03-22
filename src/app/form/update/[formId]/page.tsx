"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

type QuestionType = "single-choice" | "multiple-choice" | "open-ended";

type Question = {
  _id: Id<"questions">;
  text: string;
  type: QuestionType;
  options?: string[];
  answer?: string | string[];
};

export default function UpdateFormPage({ params }: { params: { formId: string } }) {
  const router = useRouter();
  const form = useQuery(api.mutations.form.getFormWithQuestions, { formId: params.formId as Id<"forms"> });
  const updateForm = useMutation(api.mutations.form.updateForm);
  const updateQuestion = useMutation(api.mutations.form.updateQuestion);
  const deleteQuestion = useMutation(api.mutations.form.deleteQuestion);
  const addQuestion = useMutation(api.mutations.form.addQuestion);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Mettre à jour le titre et la description lorsque le formulaire est chargé
  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description);
      setQuestions(form.questions);
    }
  }, [form]);

  // Update the form
  const handleUpdateForm = async () => {
    if (!form) return;

    setIsSaving(true);
    try {
      // Update the form
      await updateForm({
        formId: form._id,
        title,
        description,
      });

      // Update the questions
      for (const question of questions) {
        await updateQuestion({
          questionId: question._id,
          text: question.text,
          type: question.type,
          options: question.options,
        });
      }

      toast.success("Form updated successfully!");
    } catch (error) {
      toast.error("Failed to update the form.");
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new question
  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      _id: "" as Id<"questions">, // Temporary ID
      text: "New question",
      type,
      options: type !== "open-ended" ? [] : undefined,
      answer: type === "open-ended" ? "" : undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  // Update a question
  const handleUpdateQuestion = (questionId: Id<"questions">, field: keyof Question, value: string | string[]) => {
    const updatedQuestions = questions.map((question) =>
      question._id === questionId ? { ...question, [field]: value } : question
    );
    setQuestions(updatedQuestions);
  };

  // Add an option to a question
  const handleAddOption = (questionId: Id<"questions">, option: string) => {
    const updatedQuestions = questions.map((question) =>
      question._id === questionId
        ? { ...question, options: [...(question.options || []), option] }
        : question
    );
    setQuestions(updatedQuestions);
  };

  // Delete an option from a question
  const handleDeleteOption = (questionId: Id<"questions">, optionIndex: number) => {
    const updatedQuestions = questions.map((question) =>
      question._id === questionId
        ? { ...question, options: question.options?.filter((_, index) => index !== optionIndex) }
        : question
    );
    setQuestions(updatedQuestions);
  };

  // Delete a question
  const handleDeleteQuestion = async (questionId: Id<"questions">) => {
    try {
      await deleteQuestion({ questionId });
      setQuestions(questions.filter((question) => question._id !== questionId));
      toast.success("Question deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete the question.");
    }
  };

  if (!form) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AdminPanelLayout>
      <ContentLayout title="Update Form">
        <div className="p-6 space-y-6">
          {/* Main form */}
          <Card>
            <CardHeader>
              <CardTitle>Update Form</CardTitle>
              <CardDescription>Update the form details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Form title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Form description"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleUpdateForm} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Questions list */}
          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
              <CardDescription>Edit or delete questions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question) => (
                <Card key={question._id}>
                  <CardHeader>
                    <CardTitle>
                      <Input
                        value={question.text}
                        onChange={(e) => handleUpdateQuestion(question._id, "text", e.target.value)}
                        placeholder="Enter a question"
                      />
                    </CardTitle>
                    <Badge variant="outline">{question.type}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {question.type === "single-choice" && (
                      <RadioGroup>
                        {question.options?.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <RadioGroupItem value={option} />
                            <Input
                              value={option}
                              onChange={(e) => {
                                const updatedOptions = [...question.options!];
                                updatedOptions[index] = e.target.value;
                                handleUpdateQuestion(question._id, "options", updatedOptions);
                              }}
                              placeholder="Option"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteOption(question._id, index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          onClick={() => handleAddOption(question._id, "New option")}
                          className="w-full"
                        >
                          + Add option
                        </Button>
                      </RadioGroup>
                    )}

                    {question.type === "multiple-choice" && (
                      <div className="space-y-2">
                        {question.options?.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Checkbox />
                            <Input
                              value={option}
                              onChange={(e) => {
                                const updatedOptions = [...question.options!];
                                updatedOptions[index] = e.target.value;
                                handleUpdateQuestion(question._id, "options", updatedOptions);
                              }}
                              placeholder="Option"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteOption(question._id, index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          onClick={() => handleAddOption(question._id, "New option")}
                          className="w-full"
                        >
                          + Add option
                        </Button>
                      </div>
                    )}

                    {question.type === "open-ended" && (
                      <Textarea
                        value={question.answer as string}
                        onChange={(e) => handleUpdateQuestion(question._id, "answer", e.target.value)}
                        placeholder="Open-ended answer"
                      />
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question._id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button onClick={() => handleAddQuestion("single-choice")} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add single-choice question
              </Button>
              <Button onClick={() => handleAddQuestion("multiple-choice")} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add multiple-choice question
              </Button>
              <Button onClick={() => handleAddQuestion("open-ended")} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add open-ended question
              </Button>
            </CardFooter>
          </Card>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}