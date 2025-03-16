"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

type QuestionType = "multiple-choice" | "single-choice" | "open-ended";

type Question = {
  question: string;
  type: QuestionType;
  options?: string[];
  answer?: string;
};

export default function FormBuilder() {
  const [keywords, setKeywords] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [manualQuestion, setManualQuestion] = useState("");
  const [manualOptions, setManualOptions] = useState<string[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);

  // Ajouter une nouvelle question
  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      type,
      question: `Nouvelle question ${type === "multiple-choice" ? "à choix multiple" : type === "single-choice" ? "à choix unique" : "ouverte"}`,
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
    } else if (field === "answer" && typeof value === "string") {
      updatedQuestions[index].answer = value;
    } else if (field === "question" && typeof value === "string") {
      updatedQuestions[index].question = value;
    }
    setQuestions(updatedQuestions);
  };

  // Ajouter une option à une question à choix multiple ou unique
  const addOption = (index: number, option: string) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[index].options) {
      updatedQuestions[index].options!.push(option);
    }
    setQuestions(updatedQuestions);
  };

  // Fonction pour ajouter une question manuelle
  const addManualQuestion = () => {
    if (manualQuestion.trim()) {
      setQuestions([
        ...questions,
        { question: manualQuestion, type: "open-ended" },
      ]);
      setManualQuestion("");
    }
  };

  // Fonction pour supprimer une question
  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // Fonction pour générer un test technique avec Gemini
  const generateTechnicalTest = async () => {
    setLoading(true);
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
                    text: `Génère ${numberOfQuestions} questions techniques sur ${keywords}. 
                    Formatte la réponse uniquement en JSON comme ceci :
                    [
                      { "question": "Question 1", "type": "multiple-choice", "options": ["Option 1", "Option 2", "Option 3"] },
                      { "question": "Question 2", "type": "single-choice", "options": ["Option 1", "Option 2"] },
                      { "question": "Question 3", "type": "open-ended" }
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
        toast.success("Test technique généré avec succès !");
      } else {
        console.error("Erreur API :", data);
        toast.error("Erreur lors de la génération du test technique.");
      }
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
      toast.error("Impossible de générer le test technique.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Générateur de Test Technique</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Formulaire pour saisir les mots-clés et le nombre de questions */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="keywords">Mots-clés :</Label>
              <Input
                id="keywords"
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Ex: React, Node.js, JavaScript"
              />
            </div>

            <div>
              <Label htmlFor="numberOfQuestions">Nombre de questions :</Label>
              <Input
                id="numberOfQuestions"
                type="number"
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                min="1"
                max="20"
              />
            </div>

            <Button
              onClick={generateTechnicalTest}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Génération en cours..." : "Générer le Test Technique"}
            </Button>
          </div>

          {/* Ajout manuel de questions */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Ajouter une question manuelle</h2>
            <div className="space-y-4">
              <Textarea
                value={manualQuestion}
                onChange={(e) => setManualQuestion(e.target.value)}
                placeholder="Entrez votre question"
              />
              <Button onClick={addManualQuestion} className="w-full">
                Ajouter la question
              </Button>
            </div>
          </div>

          {/* Liste des questions */}
          <div className="mt-6 space-y-4">
            {questions.map((question, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Question {index + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    value={question.question}
                    onChange={(e) => updateQuestion(index, "question", e.target.value)}
                    placeholder="Entrez votre question"
                  />

                  {/* Options pour les questions à choix multiple ou unique */}
                  {question.type !== "open-ended" && (
                    <div className="mt-4 space-y-2">
                      {question.options?.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          {question.type === "multiple-choice" ? (
                            <Checkbox />
                          ) : (
                            <RadioGroupItem value={option} />
                          )}
                          <Input
                            value={option}
                            onChange={(e) => {
                              const updatedOptions = [...question.options!];
                              updatedOptions[optionIndex] = e.target.value;
                              updateQuestion(index, "options", updatedOptions);
                            }}
                            placeholder="Option"
                          />
                        </div>
                      ))}
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
                      value={question.answer}
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
        </CardContent>
      </Card>
    </div>
  );
}