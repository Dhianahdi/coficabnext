"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Clock, CheckCircle, XCircle } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

// Définition de l'interface Offer
interface Offer {
  _id: Id<"offers">;
  jobId: Id<"jobs">;
  candidateId: Id<"users">;
  status: "Pending" | "Interview" | "Accepted" | "Rejected";
  appliedAt: number;
  jobTitle: string;
  companyName: string;
  resume?: string;
  coverLetter?: string;
  notes?: string;
  score?: number;
  reportPdf?: string;
}

// Composant Dashboard
interface CandidateDashboardProps {
  offers: Offer[];
}

function CandidateDashboard({ offers }: CandidateDashboardProps) {
  // Calculer le nombre d'offres par statut
  const statusCounts = offers.reduce(
    (acc, offer) => {
      acc[offer.status] = (acc[offer.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Carte pour les offres en attente */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Pending</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="mr-2 h-4 w-4" />
            {statusCounts["Pending"] || 0}
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
            {statusCounts["Interview"] || 0}
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
            {statusCounts["Accepted"] || 0}
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
            {statusCounts["Rejected"] || 0}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant OfferCard
interface OfferCardProps {
  offer: Offer;
}

function OfferCard({ offer }: OfferCardProps) {
  const statusBadge = {
    Pending: { icon: <Clock size={16} className="text-yellow-500" />, color: "bg-yellow-100 text-yellow-800" },
    Interview: { icon: <CheckCircle size={16} className="text-blue-500" />, color: "bg-blue-100 text-blue-800" },
    Accepted: { icon: <CheckCircle size={16} className="text-green-500" />, color: "bg-green-100 text-green-800" },
    Rejected: { icon: <XCircle size={16} className="text-red-500" />, color: "bg-red-100 text-red-800" },
  }[offer.status];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle>{offer.jobTitle}</CardTitle>
        <CardDescription>{offer.companyName}</CardDescription>
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
}
