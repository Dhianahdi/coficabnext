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
import { Loader2, X } from "lucide-react";
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
  const [isSaving, setIsSaving] = useState(false); // État de chargement

  // Mutations Convex
  const createForm = useMutation(api.mutations.form.createForm);
  const addQuestion = useMutation(api.mutations.form.addQuestion);

  // Récupérer l'utilisateur actuel
  const Me = useQuery(api.auth.getMe);

  // Générer des questions avec Gemini
  const generateQuestionsWithGemini = async () => {
    if (!formTitle.trim() || !formDescription.trim()) {
      toast.error("Veuillez remplir le titre et la description du formulaire.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBX_Yq9iRL7hqCEwpZeUP4zepSaEk33yag",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Génère une liste de ${numberOfQuestions} questions pour un formulaire basé sur le titre suivant : ${formTitle} et la description suivante : ${formDescription}.
                    Inclus des questions à choix unique, à choix multiple et des questions ouvertes.
                    Formatte la réponse en JSON comme ceci :
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
          throw new Error("Aucun JSON valide détecté dans la réponse.");
        }

        const generatedQuestions = JSON.parse(jsonMatch[0]);
        setQuestions(generatedQuestions);
        toast.success("Questions générées avec succès !");
      } else {
        console.error("Erreur API :", data);
        toast.error("Erreur lors de la génération des questions.");
      }
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
      toast.error("Impossible de générer les questions.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Ajouter une question manuellement
  const addQuestionLocal = (type: QuestionType) => {
    const newQuestion: Question = {
      text: "Nouvelle question",
      type,
      options: type !== "open-ended" ? [] : undefined,
      answer: type === "open-ended" ? "" : undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  // Mettre à jour une question
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

  // Ajouter une option à une question à choix
  const addOption = (index: number, option: string) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[index].options) {
      updatedQuestions[index].options!.push(option);
    }
    setQuestions(updatedQuestions);
  };

  // Supprimer une option d'une question
  const deleteOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options!.splice(optionIndex, 1);
    }
    setQuestions(updatedQuestions);
  };

  // Supprimer une question
  const deleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  // Sauvegarder le formulaire
  const handleSaveForm = async () => {
    if (!formTitle.trim() || !formDescription.trim()) {
      toast.error("Veuillez remplir le titre et la description du formulaire.");
      return;
    }

    if (questions.length === 0) {
      toast.error("Veuillez ajouter au moins une question.");
      return;
    }

    if (!Me) {
      toast.error("Vous devez être connecté pour enregistrer un formulaire.");
      return;
    }

    setIsSaving(true); // Activer l'état de chargement

    try {
      // Créer le formulaire
      const formId = await createForm({
        title: formTitle,
        description: formDescription,
        createdBy:Me.id as Id<"users">, // Utilisez Me._id
      });

      // Ajouter les questions au formulaire
      for (const question of questions) {
        await addQuestion({
          formId,
          text: question.text,
          type: question.type,
          options: question.options,
        });
      }

      toast.success("Formulaire enregistré avec succès !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du formulaire :", error);
      toast.error("Une erreur est survenue lors de la sauvegarde du formulaire.");
    } finally {
      setIsSaving(false); // Désactiver l'état de chargement
    }
  };

  return (
    <AdminPanelLayout>
      <ContentLayout title="Créer un Formulaire">
        <div className="max-w-7xl mx-auto mt-10 p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Colonne de gauche : Prévisualisation du formulaire */}
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Prévisualisation du Formulaire</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={index} className="p-4 shadow-sm relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
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
                        <Textarea placeholder="Votre réponse..." className="mt-2" />
                      )}
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Colonne de droite : Création du formulaire */}
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Créer un Formulaire</CardTitle>
                  <CardDescription>
                    Utilisez cette page pour créer un formulaire en générant des questions avec Gemini ou en les ajoutant manuellement.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Titre et description du formulaire */}
                    <div className="space-y-2">
                      <Label htmlFor="formTitle">Titre du Formulaire</Label>
                      <Input
                        id="formTitle"
                        placeholder="Ex: Formulaire d'évaluation des compétences"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="formDescription">Description du Formulaire</Label>
                      <Textarea
                        id="formDescription"
                        placeholder="Ex: Ce formulaire vise à évaluer les compétences techniques des candidats."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                      />
                    </div>

                    {/* Nombre de questions à générer */}
                    <div className="space-y-2">
                      <Label htmlFor="numberOfQuestions">Nombre de questions à générer</Label>
                      <Input
                        id="numberOfQuestions"
                        type="number"
                        value={numberOfQuestions}
                        onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                        min="1"
                        max="20"
                      />
                    </div>

                    {/* Basculer entre Gemini et manuel */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="useGemini"
                        checked={useGemini}
                        onCheckedChange={setUseGemini}
                      />
                      <Label htmlFor="useGemini">Utiliser Gemini pour générer les questions</Label>
                    </div>

                    {/* Bouton pour générer ou ajouter des questions */}
                    {useGemini ? (
                      <Button
                        onClick={generateQuestionsWithGemini}
                        disabled={isGenerating}
                        className="w-full"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Génération en cours...
                          </>
                        ) : (
                          "Générer les Questions avec Gemini"
                        )}
                      </Button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => addQuestionLocal("single-choice")} className="w-full" variant="outline">
                          Ajouter une Question à Choix Unique
                        </Button>
                        <Button onClick={() => addQuestionLocal("multiple-choice")} className="w-full" variant="outline">
                          Ajouter une Question à Choix Multiple
                        </Button>
                        <Button onClick={() => addQuestionLocal("open-ended")} className="w-full" variant="outline">
                          Ajouter une Question Ouverte
                        </Button>
                      </div>
                    )}

                    {/* Liste des questions */}
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
                              placeholder="Entrez une question"
                            />

                            {/* Options pour les questions à choix */}
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
                                  onClick={() => addOption(index, "Nouvelle option")}
                                  className="w-full"
                                >
                                  + Ajouter une option
                                </Button>
                              </div>
                            )}

                            {/* Champ de réponse pour les questions ouvertes */}
                            {question.type === "open-ended" && (
                              <Textarea
                                value={question.answer as string}
                                onChange={(e) => updateQuestion(index, "answer", e.target.value)}
                                placeholder="Réponse libre"
                                className="mt-4"
                              />
                            )}
                          </CardContent>
                          <CardFooter className="flex justify-end">
                            <Button
                              onClick={() => deleteQuestion(index)}
                              variant="destructive"
                            >
                              Supprimer
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
                        Enregistrement en cours...
                      </>
                    ) : (
                      "Enregistrer le Formulaire"
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