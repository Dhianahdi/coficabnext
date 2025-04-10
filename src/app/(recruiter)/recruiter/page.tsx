"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RecruiterDashboard() {
  // Pagination states
  const [candidatesPage, setCandidatesPage] = useState(1);
  const [jobsPage, setJobsPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const Me = useQuery(api.auth.getMe);
  const router = useRouter();
  
  useEffect(() => {
    if (Me && Me.department?.name !== "RH") {
      router.push("/access-denied");
    }
  }, [Me, router]);

  // Récupérer les données depuis Convex
  const topCandidates = useQuery(api.mutations.stats.getTopCandidates);
  const jobStats = useQuery(api.mutations.stats.getJobStats);
  const recentJobs = useQuery(api.mutations.stats.getRecentJobs);

  // Gérer les états de chargement
  if (!topCandidates || !jobStats || !recentJobs) {
    return <div>Loading...</div>;
  }

  // Pagination logic for candidates
  const totalCandidatesPages = Math.ceil(topCandidates.length / itemsPerPage);
  const paginatedCandidates = topCandidates.slice(
    (candidatesPage - 1) * itemsPerPage,
    candidatesPage * itemsPerPage
  );

  // Pagination logic for jobs
  const totalJobsPages = Math.ceil(recentJobs.length / itemsPerPage);
  const paginatedJobs = recentJobs.slice(
    (jobsPage - 1) * itemsPerPage,
    jobsPage * itemsPerPage
  );

  // Pagination controls
  const handleCandidatesPageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalCandidatesPages) {
      setCandidatesPage(newPage);
    }
  };

  const handleJobsPageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalJobsPages) {
      setJobsPage(newPage);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCandidatesPage(1); // Reset to first page when changing items per page
    setJobsPage(1);
  };

  return (
    <AdminPanelLayout>
      <ContentLayout title="Recruiter Dashboard">
        <div className="p-6 space-y-6">
          {/* Titre et barre de recherche */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground">Recruiter Dashboard</h1>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search candidates..." className="pl-8 bg-background border-input" />
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {jobStats.map((stat: any, index: any) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                  <Progress value={stat.progress} className="h-2 mt-2 bg-secondary" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Liste des meilleurs candidats */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-xl font-semibold text-card-foreground">Top Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Score</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCandidates.map((candidate: any) => (
                    <TableRow key={candidate._id} className="hover:bg-muted border-border">
                      <TableCell className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage src={candidate.image} />
                          <AvatarFallback className="bg-primary text-primary-foreground">{candidate.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{candidate.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 border-primary/20">
                          {candidate.score}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            candidate.status === "Accepted"
                              ? "default"
                              : candidate.status === "Interview"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {candidate.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination for candidates */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((candidatesPage - 1) * itemsPerPage) + 1} to {Math.min(candidatesPage * itemsPerPage, topCandidates.length)} of {topCandidates.length} candidates
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleCandidatesPageChange(candidatesPage - 1)}
                    disabled={candidatesPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {candidatesPage} of {totalCandidatesPages}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleCandidatesPageChange(candidatesPage + 1)}
                    disabled={candidatesPage === totalCandidatesPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dernières offres d'emploi */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-xl font-semibold text-card-foreground">Recent Job Postings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Title</TableHead>
                    <TableHead className="text-muted-foreground">Department</TableHead>
                    <TableHead className="text-muted-foreground">Applications</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedJobs.map((job: any) => (
                    <TableRow key={job._id} className="hover:bg-muted border-border">
                      <TableCell className="font-medium text-foreground">{job.title}</TableCell>
                      <TableCell className="text-foreground">{job.department}</TableCell>
                      <TableCell className="text-foreground">{job.applications}</TableCell>
                      <TableCell>
                        <Badge variant={job.status === "Open" ? "default" : "destructive"}>
                          {job.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination for jobs */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((jobsPage - 1) * itemsPerPage) + 1} to {Math.min(jobsPage * itemsPerPage, recentJobs.length)} of {recentJobs.length} jobs
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleJobsPageChange(jobsPage - 1)}
                    disabled={jobsPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {jobsPage} of {totalJobsPages}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleJobsPageChange(jobsPage + 1)}
                    disabled={jobsPage === totalJobsPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <div className="flex justify-between items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-16 h-8">
                  <SelectValue placeholder="5" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" className="flex items-center border-border text-foreground">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort
              </Button>
            </div>
          </div>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}