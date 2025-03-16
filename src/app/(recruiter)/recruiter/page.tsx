"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, Filter } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecruiterDashboard() {

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

  return (
    <AdminPanelLayout>
      <ContentLayout title="Admin Meetings">
        <div className="p-6 space-y-6">
          {/* Titre et barre de recherche */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search candidates..." className="pl-8" />
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {jobStats.map((stat: any, index: any) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <Progress value={stat.progress} className="h-2 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Liste des meilleurs candidats */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Top Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCandidates.map((candidate: any) => (
                    <TableRow key={candidate._id} className="hover:bg-gray-50">
                      <TableCell className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage src={candidate.image} />
                          <AvatarFallback>{candidate.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{candidate.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
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
            </CardContent>
          </Card>

          {/* Dernières offres d'emploi */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Recent Job Postings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentJobs.map((job: any) => (
                    <TableRow key={job._id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.department}</TableCell>
                      <TableCell>{job.applications}</TableCell>
                      <TableCell>
                        <Badge variant={job.status === "Open" ? "default" : "destructive"}>
                          {job.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button className="flex items-center">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort
            </Button>
          </div>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}