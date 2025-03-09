// app/filled-forms/[jobId]/page.tsx
"use client";

import { useQuery } from "convex/react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useParams } from "next/navigation";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Spinner } from "@/components/ui/spinner";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";

export default function FilledFormsPage() {
  // Récupérer le jobId depuis les paramètres de l'URL
  const params = useParams();
  const jobId = params.id as Id<"jobs">;

  // Récupérer les formulaires remplis groupés par e-mail
  const filledFormsByEmail = useQuery(api.mutations.form.getFilledFormsByJobId, {
    jobId,
  });
console.log(filledFormsByEmail)
  // Si les données sont en cours de chargement
  if (!filledFormsByEmail) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  return (
    <AdminPanelLayout>
      <ContentLayout title="Dashboard">
        <div className="mt-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Filled Forms by Job ID</h1>

          {filledFormsByEmail && Object.keys(filledFormsByEmail).length > 0 ? (
            Object.entries(filledFormsByEmail).map(([email, forms]) => (
              <div key={email} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">User: {email}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {forms.map((form) => (
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
                          <p>Submitted on: {new Date(form.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No forms found for this job ID.</p>
          )}
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}