// app/filled-forms/page.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState } from "react";

export default function FilledFormsPage() {
  const [email, setEmail] = useState(""); // État pour stocker l'e-mail de recherche
  const [searchEmail, setSearchEmail] = useState(""); // État pour déclencher la recherche

  // Récupérer les formulaires remplis par l'utilisateur
  const filledForms = useQuery(api.mutations.form.getFilledFormsByEmail, {
    email: searchEmail,
  });

  const handleSearch = () => {
    setSearchEmail(email); // Déclencher la recherche lorsque l'utilisateur clique sur le bouton
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Filled Forms</h1>
        <div className="flex gap-4 mb-6">
          <Input
            placeholder="Enter user email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>

        {filledForms && filledForms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filledForms.map((form) => (
              <Card key={form._id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {form.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {form.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <p>Submitted by: {form.userEmail}</p>
                    <p>Submitted on: {new Date(form.submittedAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No forms found for this email.</p>
        )}
      </div>
    </div>
  );
}