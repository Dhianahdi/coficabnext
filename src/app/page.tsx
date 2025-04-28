"use client";

import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Button } from "@/components/ui/button";
import { Rocket, Briefcase, Users, FileText, MessageSquare, Bell, Search, Settings, UserCheck, BarChart, Calendar, Award, ArrowRight, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <AdminPanelLayout>
      <ContentLayout title="Welcome to CoRecSpace">
        {/* Hero Section */}
        <div className="bg-primary text-primary-foreground p-8 rounded-lg shadow-sm mb-8">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-4">
            Welcome to CoRecSpace
          </h1>
          <p className="text-xl text-muted mb-6">
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
  
        {/* How It Works Section */}
        <div className="bg-background p-8 rounded-lg shadow-sm mb-8">
          <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mb-6 text-center">
            How CoRecSpace Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-4 mb-4">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Post Jobs</h3>
              <p className="text-muted-foreground">
                Create detailed job listings with custom requirements and qualifications.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-4 mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Match Candidates</h3>
              <p className="text-muted-foreground">
                Our AI algorithm finds and ranks the most suitable candidates for your positions.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 rounded-full p-4 mb-4">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Hire the Best</h3>
              <p className="text-muted-foreground">
                Streamline interviews, evaluations, and make data-driven hiring decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-primary/5 p-8 rounded-lg shadow-sm mb-8">
          <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mb-6 text-center">
            Recruitment Made Efficient
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-background border-none shadow-sm">
              <CardContent className="p-6 text-center">
                <BarChart className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-3xl font-bold mb-2">85%</h3>
                <p className="text-muted-foreground">Faster Hiring Process</p>
              </CardContent>
            </Card>
            <Card className="bg-background border-none shadow-sm">
              <CardContent className="p-6 text-center">
                <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-3xl font-bold mb-2">10K+</h3>
                <p className="text-muted-foreground">Active Users</p>
              </CardContent>
            </Card>
            <Card className="bg-background border-none shadow-sm">
              <CardContent className="p-6 text-center">
                <Briefcase className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-3xl font-bold mb-2">50K+</h3>
                <p className="text-muted-foreground">Jobs Posted</p>
              </CardContent>
            </Card>
            <Card className="bg-background border-none shadow-sm">
              <CardContent className="p-6 text-center">
                <Award className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-3xl font-bold mb-2">95%</h3>
                <p className="text-muted-foreground">Satisfaction Rate</p>
              </CardContent>
            </Card>
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

        {/* Latest Features Section */}
        <div className="bg-background p-8 rounded-lg shadow-sm mb-8">
          <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mb-6 text-center">
            Latest Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="relative h-48 w-full bg-muted">
                <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                  <Calendar className="h-16 w-16 text-primary/50" />
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Smart Scheduling</h3>
                <p className="text-muted-foreground mb-4">
                  Our new AI-powered scheduling system automatically finds the best times for interviews based on everyone's availability.
                </p>
                <Link href="/features" className="text-primary hover:underline inline-flex items-center">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
            <Card className="border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="relative h-48 w-full bg-muted">
                <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                  <BarChart className="h-16 w-16 text-primary/50" />
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Gain deeper insights into your recruitment process with our new analytics dashboard and custom reports.
                </p>
                <Link href="/features" className="text-primary hover:underline inline-flex items-center">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
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