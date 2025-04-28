"use client";

import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

type QuestionType = "single-choice" | "multiple-choice" | "open-ended";

type Question = {
  text: string;
  type: QuestionType;
  options?: string[];
  answer?: string | string[];
};

export default function CreateFormPage() {
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useGemini, setUseGemini] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

  // Convex mutations
  const createForm = useMutation(api.mutations.form.createForm);
  const addQuestion = useMutation(api.mutations.form.addQuestion);

  // Get current user
  const Me = useQuery(api.auth.getMe);

  // Generate questions with Gemini
  const generateQuestionsWithGemini = async () => {
    if (!formTitle.trim() || !formDescription.trim()) {
      toast.error("Please fill in the form title and description.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${ process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`,    
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate a list of ${numberOfQuestions} questions for a form based on the following title: ${formTitle} and description: ${formDescription}.
                    Include single-choice questions, multiple-choice questions, and open-ended questions.
                    Format the response in JSON like this:
                    [
                      { "text": "Question 1", "type": "single-choice", "options": ["Option 1", "Option 2", "Option 3"] },
                      { "text": "Question 2", "type": "multiple-choice", "options": ["Option 1", "Option 2"] },
                      { "text": "Question 3", "type": "open-ended" }
                    ]`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = rawText.match(/\[\s*{[\s\S]*}\s*\]/);
        if (!jsonMatch) {
          throw new Error("No valid JSON detected in the response.");
        }

        const generatedQuestions = JSON.parse(jsonMatch[0]);
        setQuestions(generatedQuestions);
        toast.success("Questions generated successfully!");
      } else {
        console.error("API Error:", data);
        toast.error("Error generating questions.");
      }
    } catch (error) {
      console.error("Request error:", error);
      toast.error("Unable to generate questions.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Add a question manually
  const addQuestionLocal = (type: QuestionType) => {
    const newQuestion: Question = {
      text: "New question",
      type,
      options: type !== "open-ended" ? [] : undefined,
      answer: type === "open-ended" ? "" : undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  // Update a question
  const updateQuestion = (index: number, field: keyof Question, value: string | string[]) => {
    const updatedQuestions = [...questions];
    if (field === "options" && Array.isArray(value)) {
      updatedQuestions[index].options = value;
    } else if (field === "text" && typeof value === "string") {
      updatedQuestions[index].text = value;
    } else if (field === "answer") {
      updatedQuestions[index].answer = value;
    }
    setQuestions(updatedQuestions);
  };

  // Add an option to a choice question
  const addOption = (index: number, option: string) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[index].options) {
      updatedQuestions[index].options!.push(option);
    }
    setQuestions(updatedQuestions);
  };

  // Delete an option from a question
  const deleteOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options!.splice(optionIndex, 1);
    }
    setQuestions(updatedQuestions);
  };

  // Delete a question
  const deleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  // Save the form
  const handleSaveForm = async () => {
    if (!formTitle.trim() || !formDescription.trim()) {
      toast.error("Please fill in the form title and description.");
      return;
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question.");
      return;
    }

    if (!Me) {
      toast.error("You must be logged in to save a form.");
      return;
    }

    setIsSaving(true);

    try {
      // Create the form
      const formId = await createForm({
        title: formTitle,
        description: formDescription,
        createdBy: Me._id as Id<"users">,
      });

      // Add questions to the form
      for (const question of questions) {
        await addQuestion({
          formId,
          text: question.text,
          type: question.type,
          options: question.options,
        });
      }

      toast.success("Form saved successfully!");
    } catch (error) {
      console.error("Error saving the form:", error);
      toast.error("An error occurred while saving the form.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminPanelLayout>
      <ContentLayout title="Create Form">
        <div className="max-w-7xl mx-auto mt-10 p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left column: Form preview */}
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Form Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={index} className="p-4 shadow-sm relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 hover:bg-red-100 hover:text-red-500"
                        onClick={() => deleteQuestion(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <h3 className="font-semibold mb-2">{question.text}</h3>
                      {question.type === "single-choice" && (
                        <RadioGroup>
                          {question.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={`option-${index}-${optionIndex}`} />
                              <Label htmlFor={`option-${index}-${optionIndex}`}>{option}</Label>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteOption(index, optionIndex)}
                                className="hover:bg-red-100 hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </RadioGroup>
                      )}
                      {question.type === "multiple-choice" && (
                        <div className="space-y-2">
                          {question.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <Checkbox id={`option-${index}-${optionIndex}`} />
                              <Label htmlFor={`option-${index}-${optionIndex}`}>{option}</Label>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteOption(index, optionIndex)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      {question.type === "open-ended" && (
                        <Textarea placeholder="Your answer..." className="mt-2" />
                      )}
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right column: Form creation */}
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Create a Form</CardTitle>
                  <CardDescription>
                    Use this page to create a form by generating questions with Gemini or adding them manually.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Form title and description */}
                    <div className="space-y-2">
                      <Label htmlFor="formTitle">Form Title</Label>
                      <Input
                        id="formTitle"
                        placeholder="Ex: Skills Assessment Form"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="formDescription">Form Description</Label>
                      <Textarea
                        id="formDescription"
                        placeholder="Ex: This form aims to assess the technical skills of candidates."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                      />
                    </div>

                    {/* Number of questions to generate */}
                    <div className="space-y-2">
                      <Label htmlFor="numberOfQuestions">Number of questions to generate</Label>
                      <Input
                        id="numberOfQuestions"
                        type="number"
                        value={numberOfQuestions}
                        onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                        min="1"
                        max="20"
                      />
                    </div>

                    {/* Toggle between Gemini and manual */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="useGemini"
                        checked={useGemini}
                        onCheckedChange={setUseGemini}
                      />
                      <Label htmlFor="useGemini">Use Gemini to generate questions</Label>
                    </div>

                    {/* Button to generate or add questions */}
                    {useGemini ? (
                      <Button
                        onClick={generateQuestionsWithGemini}
                        disabled={isGenerating}
                        className="w-full"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          "Generate Questions with Gemini"
                        )}
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => addQuestionLocal("single-choice")} className="w-full" variant="outline">
                          Add Single Choice Question
                        </Button>
                        <Button onClick={() => addQuestionLocal("multiple-choice")} className="w-full" variant="outline">
                          Add Multiple Choice Question
                        </Button>
                        <Button onClick={() => addQuestionLocal("open-ended")} className="w-full" variant="outline">
                          Add Open-Ended Question
                        </Button>
                      </div>
                    )}

                    {/* List of questions */}
                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle>Question {index + 1}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Input
                              value={question.text}
                              onChange={(e) => updateQuestion(index, "text", e.target.value)}
                              placeholder="Enter a question"
                            />

                            {/* Options for choice questions */}
                            {question.type !== "open-ended" && (
                              <div className="mt-4 space-y-2">
                                {question.type === "single-choice" ? (
                                  <RadioGroup>
                                    {question.options?.map((option, optionIndex) => (
                                      <div key={optionIndex} className="flex items-center gap-2">
                                        <RadioGroupItem value={option} />
                                        <Input
                                          value={option}
                                          onChange={(e) => {
                                            const updatedOptions = [...question.options!];
                                            updatedOptions[optionIndex] = e.target.value;
                                            updateQuestion(index, "options", updatedOptions);
                                          }}
                                          placeholder="Option"
                                        />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => deleteOption(index, optionIndex)}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                ) : (
                                  <>
                                    {question.options?.map((option, optionIndex) => (
                                      <div key={optionIndex} className="flex items-center gap-2">
                                        <Checkbox />
                                        <Input
                                          value={option}
                                          onChange={(e) => {
                                            const updatedOptions = [...question.options!];
                                            updatedOptions[optionIndex] = e.target.value;
                                            updateQuestion(index, "options", updatedOptions);
                                          }}
                                          placeholder="Option"
                                        />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => deleteOption(index, optionIndex)}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </>
                                )}
                                <Button
                                  onClick={() => addOption(index, "New option")}
                                  className="w-full"
                                >
                                  + Add option
                                </Button>
                              </div>
                            )}

                            {/* Answer field for open-ended questions */}
                            {question.type === "open-ended" && (
                              <Textarea
                                value={question.answer as string}
                                onChange={(e) => updateQuestion(index, "answer", e.target.value)}
                                placeholder="Free response"
                                className="mt-4"
                              />
                            )}
                          </CardContent>
                          <CardFooter className="flex justify-end">
                            <Button
                              onClick={() => deleteQuestion(index)}
                              variant="outline"
                              size="icon"
                              className="hover:bg-red-100 hover:text-red-500 hover:border-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleSaveForm} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Form"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}