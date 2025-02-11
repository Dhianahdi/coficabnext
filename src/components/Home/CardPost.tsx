"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { formatTimeAgo } from "@/lib/dateUtils";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import { Button } from "@/components/ui/button";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Archive, CheckCircle, Clock, XCircle } from "lucide-react";

interface CardPostProps {
  user: {
    avatar: string;
    name: string;
  };
  post: {
    _id: string; // Job ID
    title: string;
    content: string;
    tags?: string[]; // Job tags (e.g., skills, technologies)
    createdAt?: string | number; // Allow both string and number
    recruiterName: string; // Recruiter name
    departmentName: string; // Department name
    collaboratorNames: string[]; // Collaborator names
    requirements?: string;
    salaryRange?: string;
    employmentType?: string;
    location?: string;
    experienceLevel?: string;
    applicationDeadline?: number;
    interviewProcess?: string;
    status: "Pending" | "Open" | "Closed"; // Job status
  };
}

export default function CardPost({ user, post }: CardPostProps) {
  const router = useRouter();
  const timeAgo = formatTimeAgo(post.createdAt);

  // Handle click to navigate to job details
  const handleClick = () => {
    router.push(`/job/${post._id}`);
  };

  const statusIcons = {
    Pending: <Clock size={12} className="text-yellow-500 -ms-0.5 " strokeWidth={2} aria-hidden="true" />,
    Open: <CheckCircle size={12} className="text-green-500 -ms-0.5 " strokeWidth={2} aria-hidden="true" />,
    Closed: <XCircle size={12} className="text-red-500 -ms-0.5 " strokeWidth={2} aria-hidden="true" />,
  };

  const statusColors = {
    Pending: "yellow",
    Open: "green",
    Closed: "red",
  };

  const icon = statusIcons[post.status];

  return (
    <Card
      className="w-full max-w-lg shadow-none flex flex-col cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
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
      <CardContent className="p-6 flex-1 flex flex-col justify-center">
        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-center">
          {post.location && (
            <div className="flex items-center text-sm mb-1">
              <FaMapMarkerAlt className="mr-1" />
              <span>{post.location}</span>
            </div>
          )}
          <div className="flex items-center mb-6">
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
              {post.title}
            </h4>
            {post.employmentType && (
              <>
                <span className="mx-2">|</span>
                <span className="text-sm text-muted-foreground">
                  {post.employmentType}
                </span>
              </>
            )}
          </div>
          {post.requirements && (
            <div className="mb-4 flex items-start">
              <CheckCircle size={20} className="mr-4 self-center" />
              <div>
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                  Requirements
                </h3>
                <small className="text-sm text-muted-foreground">{post.requirements}</small>
              </div>
            </div>
          )}
          {post.interviewProcess && (
            <div className="mb-4 flex items-start">
              <Clock size={20} className="mr-4 self-center" />
              <div>
                <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                  Interview Process
                </h3>
                <small className="text-sm text-muted-foreground">{post.interviewProcess}</small>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 mt-4">
          <Button variant="outline" onClick={handleClick} className="w-full flex items-center justify-center">
            View Details
          </Button>
          <Button onClick={() => alert("Apply Now clicked!")} className="w-full flex items-center justify-center">
            <CheckCircle className="mr-2 opacity-60" size={16} strokeWidth={2} aria-hidden="true" />
            Apply Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}