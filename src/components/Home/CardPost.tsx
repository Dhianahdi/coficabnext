"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import { formatTimeAgo, formatDate } from "@/lib/dateUtils";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import { Button } from "@/components/ui/button";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Archive, CheckCircle, Clock, XCircle, CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CardPostProps {
  user: {
    avatar: string;
    name: string;
  };
  post: {
    _id: string;
    title: string;
    content: string;
    tags?: string[];
    createdAt?: string | number;
    recruiterName: string;
    departmentName: string;
    collaboratorNames: string[];
    requirements?: string;
    salaryRange?: string;
    employmentType?: string;
    location?: string;
    experienceLevel?: string;
    applicationDeadline?: number;
    interviewProcess?: string;
    status: "Pending" | "Open" | "Closed";
  };
}

export default function CardPost({ user, post }: CardPostProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cv, setCv] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState("");

  const timeAgo = formatTimeAgo(post.createdAt);

  const handleClick = async () => {
    setLoading(true);
    try {
      await router.push(`/jobDetails/${post._id}`);
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!cv || !coverLetter) {
      alert("Veuillez ajouter votre CV et lettre de motivation.");
      return;
    }
    alert("Candidature soumise avec succès !");
    setIsDialogOpen(false);
  };

  const statusIcons = {
    Pending: <Clock size={12} className="text-yellow-500 -ms-0.5" strokeWidth={2} aria-hidden="true" />, 
    Open: <CheckCircle size={12} className="text-green-500 -ms-0.5" strokeWidth={2} aria-hidden="true" />, 
    Closed: <XCircle size={12} className="text-red-500 -ms-0.5" strokeWidth={2} aria-hidden="true" />, 
  };

  const icon = statusIcons[post.status];

  return (
    <>
     <Card className="w-full max-w-lg shadow-none flex flex-col hover:shadow-md transition-shadow h-full">
      <CardHeader className="flex flex-row items-center justify-between py-4 px-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                className="rounded-full object-contain"
                alt={`${user.name}'s avatar`}
                height={40}
                width={40}
              />
            ) : (
              <span className="text-lg font-medium text-foreground">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h6 className="text-sm leading-none font-medium">{user.name}</h6>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timeAgo}
            </span>
          </div>
        </div>
        {post.status && (
          <Badge className="gap-1">
            {icon}
            {post.status}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col justify-between">
        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between">
          {post.location && (
            <div className="flex items-center text-sm mb-4">
              <FaMapMarkerAlt className="mr-1" />
              <span>{post.location}</span>
            </div>
          )}
          <div className="flex items-center mb-6">
            <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0 truncate">
              {post.title}
            </h2>
            {post.employmentType && (
              <>
                <span className="mx-2">|</span>
                <span className="text-sm text-muted-foreground truncate">
                  {post.employmentType}
                </span>
              </>
            )}
          </div>
          {post.requirements && (
            <div className="mb-4 flex items-start">
              <CheckCircle size={20} className="mr-4 self-start flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                  Requirements
                </h3>
                <small className="text-sm text-muted-foreground line-clamp-2">
                  {post.requirements}
                </small>
              </div>
            </div>
          )}
          {post.interviewProcess && (
            <div className="mb-4 flex items-start">
              <Clock size={20} className="mr-4 self-start flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                  Interview Process
                </h3>
                <small className="text-sm text-muted-foreground line-clamp-2">
                  {post.interviewProcess}
                </small>
              </div>
            </div>
          )}
          {post.applicationDeadline && (
            <div className="flex items-center gap-2 text-sm mt-4 justify-end">
              <CalendarDays size={16} className="text-red-500" /> {/* Added CalendarDays icon */}
              <span className="font-bold">Deadline :</span> {formatDate(new Date(post.applicationDeadline).toISOString())}
            </div>
          )}
          <Separator className="my-4" />
          <div className="flex items-center">
            {post.salaryRange && (
              <div className="flex items-baseline">
                <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                  {post.salaryRange} DT
                </h2>
                <p className="text-sm text-muted-foreground ml-2">
                  <span className="font-medium">/ Month</span>
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <Button
            variant="outline"
            onClick={handleClick}
            className="w-full flex items-center justify-center"
            disabled={loading}
          >
            {loading ? "Loading..." : "View Details"}
          </Button>
          <Button onClick={handleApply} className="w-full flex items-center justify-center">
              <CheckCircle className="mr-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
              Apply Now
            </Button>
        </div>
      </CardContent>
    </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {post.title}</DialogTitle>
            <DialogDescription>Complete your application by submitting your CV and a cover letter.</DialogDescription>
          </DialogHeader>
          <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCv(e.target.files?.[0] || null)} />
          <Textarea placeholder="Write your cover letter here..." value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Submit Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
