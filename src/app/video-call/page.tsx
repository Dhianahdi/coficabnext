"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import JitsiMeeting from "@/components/JitsiMeeting/JitsiMeeting";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "recharts";
const generateRandomRoomName = (length: number = 8): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
const VideoCallPage = () => {
  // Récupérer l'utilisateur actuel
  let currentUser :any;

  // Définir roomName et userInfo dynamiquement
  const roomName = generateRandomRoomName();
  const userInfo = {
    displayName: currentUser?.name || "Guest",
    email: currentUser?.email || "guest@example.com",
  };

  // Générer le lien de réunion
  const meetingLink = `https://meet.jit.si/${roomName}`;

  // État pour copier le lien
  const [isCopied, setIsCopied] = useState(false);

  // Fonction pour copier le lien dans le presse-papiers
  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetingLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Réinitialiser après 2 secondes
    });
  };

  

  return (
    <ContentLayout title="Meeting Room">
      <div className="p-6 space-y-6">
        {/* Afficher le lien de réunion */}
        <div className="space-y-4">
          <Label className="text-lg font-medium">Lien de la réunion :</Label>
          <div className="flex items-center gap-2">
            <Input
              value={meetingLink}
              readOnly
              className="flex-1"
            />
            <Button onClick={copyToClipboard}>
              {isCopied ? "Copié !" : "Copier le lien"}
            </Button>
          </div>
        </div>

        {/* Conteneur de la réunion Jitsi */}
        <div style={{ flex: 1, position: "relative" }}>
          <JitsiMeeting roomName={roomName} userInfo={userInfo} />
        </div>
      </div>
    </ContentLayout>
  );
};

export default VideoCallPage;