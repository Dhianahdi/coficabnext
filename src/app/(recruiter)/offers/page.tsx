"use client";

import { useEffect, useState } from "react";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/spinner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Import du composant Badge
import { Clock, CheckCircle, XCircle } from "lucide-react"; // Icônes pour les statuts

export default function JobsPage() {
  const router = useRouter();
  const rawJobs = useQuery(api.queries.jobs.getJobs);
  const offers = useQuery(api.queries.offres.getOffers);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // État pour la recherche
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // État pour le tri

  // Ajouter le nombre d'offres à chaque job
  const jobs =
    rawJobs?.map((job) => {
      const createdAt = new Date(job._creationTime).toISOString();
      const jobOffers = offers?.filter((offer) => offer.jobId === job._id) || [];
      return {
        ...job,
        createdAt,
        collaborators: job.collaborators ? job.collaborators.map(() => "Unknown Collaborator") : [],
        offerCount: jobOffers.length, // Ajouter le nombre d'offres
      };
    }) || [];

  // Filtrer et trier les jobs
  const filteredJobs = jobs
    .filter((job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.departmentName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.offerCount - b.offerCount;
      } else {
        return b.offerCount - a.offerCount;
      }
    });

  const isLoading = !rawJobs || !offers;

  useEffect(() => {
    console.log("Jobs:", jobs);
  }, [jobs]);

  // Gérer le clic sur le bouton "Add Job"
  const handleAddJobClick = () => {
    setIsRedirecting(true); // Afficher le spinner

    setTimeout(() => {
      router.push("/Recruiterjobs/add"); // Naviguer après un court délai
      setIsRedirecting(false); // Masquer le spinner
    }, 1000); // 300ms de délai pour que le spinner apparaisse
  };

  // Fonction pour obtenir l'icône et la couleur du statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return {
          icon: <Clock size={16} className="text-yellow-500" />,
          color: "bg-yellow-100 text-yellow-800",
        };
      case "Open":
        return {
          icon: <CheckCircle size={16} className="text-green-500" />,
          color: "bg-green-100 text-green-800",
        };
      case "Closed":
        return {
          icon: <XCircle size={16} className="text-red-500" />,
          color: "bg-red-100 text-red-800",
        };
      default:
        return {
          icon: null,
          color: "bg-gray-100 text-gray-800",
        };
    }
  };

  return (
    <AdminPanelLayout>
      <ContentLayout title="Dashboard">
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Job And Offers
            </h1>
         
          </div>

          <p className="leading-7 [&:not(:first-child)]:mb-6">
            Manage and oversee job postings within the system. Jobs can be posted,
            updated.
          </p>

          {/* Barre de recherche et filtre de tri */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search jobs by title or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by offers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Most offers first</SelectItem>
                <SelectItem value="asc">Fewest offers first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-[300px] w-full">
              <Spinner variant="ring" size={40} className="text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map((job) => {
                const statusBadge = getStatusBadge(job.status);

                return (
                    <Card
                    key={job._id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/offers/${job._id}`)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{job.title}</span>
                        <Badge className={`${statusBadge.color} flex items-center gap-1`}>
                          {statusBadge.icon}
                          {job.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{job.departmentName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        Created At: {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Offers: <span className="font-bold">{job.offerCount}</span>
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}