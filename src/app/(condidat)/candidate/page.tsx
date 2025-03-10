"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Clock, CheckCircle, XCircle } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function CandidatePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const Me = useQuery(api.auth.getMe);

  // Récupérer les offres depuis Convex
  const offers = useQuery(api.queries.offres.getOffersByCandidateId, {
    candidateId: Me?._id as Id<"users">, // Utilise l'ID du candidat connecté
  });

  // Filtrer et trier les offres
  const filteredOffers = offers
    ?.filter((offer: any) =>
      offer.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) 
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return (a.score || 0) - (b.score || 0);
      } else {
        return (b.score || 0) - (a.score || 0);
      }
    });

  // Calculer le nombre d'offres par statut
  const statusCounts = offers?.reduce(
    (acc, offer) => {
      acc[offer.status] = (acc[offer.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Afficher un loader pendant le chargement
  if (!offers) {
    return (
      <AdminPanelLayout>
        <ContentLayout title="Job Details">
          <div className="flex justify-center items-center h-screen">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 ml-4">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        </ContentLayout>
      </AdminPanelLayout>
    );
  }

  return (
    <AdminPanelLayout>
      <ContentLayout title="Job Details">
 

        {/* Dashboard des offres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Carte pour les offres en attente */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Pending</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Badge className="bg-blue-100 text-blue-800">
                <Clock className="mr-2 h-4 w-4" />
                {statusCounts?.["Pending"] || 0}
              </Badge>
            </CardContent>
          </Card>

          {/* Carte pour les offres en entretien */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800">Interview</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Badge className="bg-purple-100 text-purple-800">
                <CheckCircle className="mr-2 h-4 w-4" />
                {statusCounts?.["Interview"] || 0}
              </Badge>
            </CardContent>
          </Card>

          {/* Carte pour les offres acceptées */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Accepted</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="mr-2 h-4 w-4" />
                {statusCounts?.["Accepted"] || 0}
              </Badge>
            </CardContent>
          </Card>

          {/* Carte pour les offres rejetées */}
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800">Rejected</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Badge className="bg-red-100 text-red-800">
                <XCircle className="mr-2 h-4 w-4" />
                {statusCounts?.["Rejected"] || 0}
              </Badge>
            </CardContent>
          </Card>
        </div>
        <div className="flex items-center justify-between mb-4">
          {/* Barre de recherche */}
          <input
            type="text"
            placeholder="Search offers by title or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
     
        </div>
        {/* Liste des offres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers?.map((offer) => {
            const statusBadge = {
              Pending: { icon: <Clock size={16} className="text-yellow-500" />, color: "bg-yellow-100 text-yellow-800" },
              Interview: { icon: <CheckCircle size={16} className="text-blue-500" />, color: "bg-blue-100 text-blue-800" },
              Accepted: { icon: <CheckCircle size={16} className="text-green-500" />, color: "bg-green-100 text-green-800" },
              Rejected: { icon: <XCircle size={16} className="text-red-500" />, color: "bg-red-100 text-red-800" },
            }[offer.status];

            if (!statusBadge) {
              return null; // Ignorer les offres avec un statut inconnu
            }

            return (
              <Card key={offer._id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle>{offer.jobTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Applied At:</span>
                    <span className="text-sm font-medium">
                      {new Date(offer.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Badge className={`${statusBadge.color} flex items-center gap-1`}>
                    {statusBadge.icon}
                    {offer.status}
                  </Badge>
                  {offer.resume && (
                    <Button variant="outline" size="sm">
                      <Download size={16} className="mr-2" />
                      Download CV
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}