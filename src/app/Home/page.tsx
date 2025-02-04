"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
// Import the ReusableTabs component and its TabItem type
import ReusableTabs from "./components/ReusableTabs";

export default function Home() {
  const me = useQuery(api.auth.getMe);
  const currentUser = useQuery(api.users.CurrentUser);

  const [showDialog, setShowDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Detect when userCompany is done loading
 

  return (
    <AdminPanelLayout>
      <ContentLayout title="Recent Stories">
        {me?.role === "admin" && (
          <Card className="w-96 h-64 flex items-center justify-center">Hello Admin</Card>
        )}
        {me?.role === "read" && (
          <Card className="w-96 h-64 flex items-center justify-center">Hello Reader</Card>
        )}
        {me?.role === "write" && (
          <>
            <h3 className="text-2xl font-semibold">Home</h3>
            <p>Overview of your activities and trends.</p>
          </>
        )}
        
      

      
      {/* Render the reusable tabs component */}
      <div className="mt-8 w-full">
        <ReusableTabs  />
      </div>

      </ContentLayout>

    </AdminPanelLayout>
  );
}
