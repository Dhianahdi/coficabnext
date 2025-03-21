"use client";

import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Button } from "@/components/ui/button";
import { Rocket, Briefcase, Users, FileText, MessageSquare, Bell, Search, Settings, UserCheck } from "lucide-react";

export default function Home() {
  return (
    <AdminPanelLayout>
      <ContentLayout title="Welcome to CoRecSpace">
        {/* Hero Section */}
        <div className="bg-primary text-primary-foreground p-8 rounded-lg shadow-sm mb-8">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-4">
            Welcome to CoRecSpace
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Revolutionize your recruitment process with our modern, AI-powered platform.
          </p>
          <div className="flex gap-4">
            <Button className="bg-background text-foreground hover:bg-secondary">
              <Rocket className="mr-2 h-4 w-4" />
              Get Started
            </Button>
            <Button variant="outline" className="bg-background text-foreground hover:bg-secondary">
              <Briefcase className="mr-2 h-4 w-4" />
              Explore Features
            </Button>
          </div>
        </div>
  
        {/* Key Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-background p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Search className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
            <p className="text-muted-foreground">
              Find the best candidates with our advanced AI-powered matching system.
            </p>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Users className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Candidate Management</h3>
            <p className="text-muted-foreground">
              Efficiently manage and track candidates throughout the recruitment process.
            </p>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <FileText className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Job Posting</h3>
            <p className="text-muted-foreground">
              Create and publish job offers with ease, tailored to your needs.
            </p>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <MessageSquare className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Communication</h3>
            <p className="text-muted-foreground">
              Stay connected with candidates through our integrated messaging system.
            </p>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Settings className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Customizable Workflows</h3>
            <p className="text-muted-foreground">
              Adapt the platform to your unique recruitment processes.
            </p>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <UserCheck className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Candidate Evaluation</h3>
            <p className="text-muted-foreground">
              Evaluate candidates with customizable tests and scoring systems.
            </p>
          </div>
        </div>
  
        {/* Testimonials Section */}
        <div className="bg-primary text-primary-foreground p-8 rounded-lg shadow-sm mb-8">
          <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mb-6">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-background text-foreground p-6 rounded-lg shadow-sm">
              <p className="text-muted-foreground italic">
                "CoRecSpace has transformed our recruitment process. The AI matching is incredibly accurate, and the platform is easy to use."
              </p>
              <p className="font-semibold mt-4">— John Doe, HR Manager</p>
            </div>
            <div className="bg-background text-foreground p-6 rounded-lg shadow-sm">
              <p className="text-muted-foreground italic">
                "The candidate management tools are a game-changer. We've never been more organized!"
              </p>
              <p className="font-semibold mt-4">— Jane Smith, Recruiter</p>
            </div>
          </div>
        </div>
  
        {/* Call to Action Section */}
        <div className="bg-background p-8 rounded-lg shadow-sm text-center">
          <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mb-4">
            Ready to Transform Your Recruitment Process?
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            Join CoRecSpace today and experience the future of talent management.
          </p>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Rocket className="mr-2 h-4 w-4" />
            Get Started
          </Button>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}