"use client"; // Assurez-vous que cette directive est présente pour utiliser des hooks côté client

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import JitsiMeeting from "@/components/JitsiMeeting/JitsiMeeting";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Loader2 } from "lucide-react";

const VideoCallPage = () => {
  // Récupérer l'utilisateur actuel
  let currentUser :any;

  // Définir roomName et userInfo dynamiquement
  const roomName = currentUser ? `room-${currentUser._id}` : "default-room"; // Utiliser l'ID de l'utilisateur pour le nom de la salle
  const userInfo = {
    displayName: currentUser?.name || "Guest", // Utiliser le nom de l'utilisateur ou "Guest" par défaut
    email: currentUser?.email || "guest@example.com", // Utiliser l'email de l'utilisateur ou une valeur par défaut
  };



  return (
          <ContentLayout title="Meeting Room">
    
      <div className="p-6 space-y-6">
        {/* Conteneur de la réunion Jitsi */}
          <JitsiMeeting roomName={roomName} userInfo={userInfo} />
      </div>
      </ContentLayout>

  );
};

export default VideoCallPage;