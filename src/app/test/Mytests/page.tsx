"use client";

import { useQuery, useMutation } from "convex/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, FileText, Check, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function MyFormsPage() {
  // Récupérer l'utilisateur actuel
  const user = useQuery(api.auth.getMe);
  const userId = user?.id as Id<"users">;

  // Récupérer les formulaires assignés à l'utilisateur
  const userForms = useQuery(api.mutations.form.getUserForms, { userId });

  // Mutation pour vérifier si l'utilisateur a répondu au formulaire
  const hasUserRespondedToForm = useMutation(api.mutations.form.hasUserRespondedToForm);

  // Si les données sont en cours de chargement
  if (!userForms) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  return (
    <AdminPanelLayout>
      <ContentLayout title="Dashboard">
        <div className="min-h-screen bg-white p-6"> {/* Fond blanc */}
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Forms</h1>
              <p className="text-lg text-gray-600">
                Here are the forms assigned to you. Complete them at your convenience.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userForms.map(async (userForm) => {
                // Vérifier si form est défini
                if (!userForm.form) {
                  return null; // Ignorer cet élément si form n'existe pas
                }

                // Vérifier si l'utilisateur a répondu au formulaire
                const hasResponded = await hasUserRespondedToForm({
                  userId,
                  formId: userForm.formId,
                });

                return (
                  <motion.div
                    key={userForm.formId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                      <CardHeader>
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-blue-100 rounded-full">
                            <FileText className="h-6 w-6 text-blue-500" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold text-gray-900">
                              {userForm.form.title} {/* Accès à form.title */}
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                              {userForm.form.description} {/* Accès à form.description */}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>
                            Assigned on: {new Date(userForm.assignedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center space-x-2">
                          {hasResponded ? (
                            <>
                              <Check className="h-4 w-4 text-green-500" />
                              <span className="text-green-600">Completed</span>
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4 text-red-500" />
                              <span className="text-red-600">Not Completed</span>
                            </>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/test/${userForm.formId}`} passHref>
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-300"
                            disabled={hasResponded} // Désactiver le bouton si le formulaire est déjà complété
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {hasResponded ? "View Form" : "Start Form"}
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {userForms.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mt-12"
              >
                <h2 className="text-2xl font-bold text-gray-900">No Forms Assigned</h2>
                <p className="text-gray-600">You currently have no forms to complete.</p>
              </motion.div>
            )}
          </div>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}