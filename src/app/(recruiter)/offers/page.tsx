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
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";

export default function JobsPage() {
  const Me = useQuery(api.auth.getMe);
  const router = useRouter();

  useEffect(() => {
    if (Me && Me.department?.name !== "RH") {
      router.push("/access-denied");
    }
  }, [Me, router]);
  const rawJobs = useQuery(api.queries.jobs.getJobs);
  const offers = useQuery(api.queries.offres.getOffers);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("All");

  const jobs =
    rawJobs?.filter(job => Me?.department?.name === "RH" || job.departmentName === Me?.department?.name)
      .map((job) => {
        const createdAt = new Date(job._creationTime).toISOString();
        const jobOffers = offers?.filter((offer) => offer.jobId === job._id) || [];
        return {
          ...job,
          createdAt,
          collaborators: job.collaborators ? job.collaborators.map(() => "Unknown Collaborator") : [],
          offerCount: jobOffers.length,
        };
      }) || [];

  const filteredJobs = jobs
    .filter((job) =>
      (searchQuery === "" || job.title.toLowerCase().includes(searchQuery.toLowerCase()) || job.departmentName.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (statusFilter === "All" || job.status === statusFilter)
    )
    .sort((a, b) => (sortOrder === "asc" ? a.offerCount - b.offerCount : b.offerCount - a.offerCount));

  const isLoading = !rawJobs || !offers;

  useEffect(() => {
    console.log("Jobs:", jobs);
  }, [jobs]);

  const handleAddJobClick = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      router.push("/Recruiterjobs/add");
      setIsRedirecting(false);
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return { icon: <Clock size={16} className="text-yellow-500" />, color: "bg-yellow-100 text-yellow-800" };
      case "Open":
        return { icon: <CheckCircle size={16} className="text-green-500" />, color: "bg-green-100 text-green-800" };
      case "Closed":
        return { icon: <XCircle size={16} className="text-red-500" />, color: "bg-red-100 text-red-800" };
      default:
        return { icon: null, color: "bg-gray-100 text-gray-800" };
    }
  };

  return (
    <AdminPanelLayout>
      <ContentLayout title="Dashboard">
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Job And Offers</h1>
          </div>

          <p className="leading-7 [&:not(:first-child)]:mb-6">
            Manage and oversee job postings within the system. Jobs can be posted, updated.
          </p>

          <div className="flex gap-4 mb-6">
            <Input placeholder="Search jobs by title or department..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1" />
            <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by offers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Most offers first</SelectItem>
                <SelectItem value="asc">Fewest offers first</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
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
                  <Card key={job._id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/offers/${job._id}`)}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{job.title}</span>
                        <Badge className={`${statusBadge.color} flex items-center gap-1`}>{statusBadge.icon}{job.status}</Badge>
                      </CardTitle>
                      <CardDescription>{job.departmentName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">Created At: {new Date(job.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">Offers: <span className="font-bold">{job.offerCount}</span></p>
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
