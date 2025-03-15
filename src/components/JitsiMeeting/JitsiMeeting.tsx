"use client";

import { useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../../convex/_generated/api";
import { Loader2 } from "lucide-react";

declare global {
  interface JitsiMeetExternalAPI {
    new (domain: string, options: any): any;
  }

  interface Window {
    JitsiMeetExternalAPI: JitsiMeetExternalAPI;
  }
}

interface JitsiMeetingProps {
  roomName?: string; // Optionnel, car il sera défini dynamiquement
  userInfo?: {
    displayName: string;
    email: string;
  }; // Optionnel, car il sera défini dynamiquement
}

const JitsiMeeting = ({ roomName, userInfo }: JitsiMeetingProps) => {
  const jitsiContainer = useRef<HTMLDivElement>(null);

  // Récupérer l'utilisateur actuel
  const currentUser = useQuery(api.auth.getMe);

  // Définir roomName et userInfo dynamiquement
  const dynamicRoomName = currentUser ? `room-${currentUser._id}` : roomName || "default-room";
  const dynamicUserInfo = {
    displayName: currentUser?.name || userInfo?.displayName || "Guest",
    email: currentUser?.email || userInfo?.email || "guest@example.com",
  };

  useEffect(() => {
    if (!currentUser) return; // Ne pas initialiser Jitsi si l'utilisateur n'est pas chargé

    const loadJitsiScript = () => {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = initializeJitsi;
      document.body.appendChild(script);
    };

    const initializeJitsi = () => {
      const domain = "meet.jit.si";
      const options = {
        roomName: dynamicRoomName,
        width: "100%",
        height: "100%",
        parentNode: jitsiContainer.current,
        userInfo: {
          displayName: dynamicUserInfo.displayName,
          email: dynamicUserInfo.email,
        },
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          enableWelcomePage: false,
          disableSimulcast: false,
          enableNoisyMicDetection: true,
          enableClosePage: false,
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);

      api.on("participantJoined", (participant: any) => {
        console.log(`${participant.displayName} a rejoint la réunion.`);
      });

      api.on("participantLeft", (participant: any) => {
        console.log(`${participant.displayName} a quitté la réunion.`);
      });

      api.on("readyToClose", () => {
        console.log("La réunion est prête à être fermée.");
        window.location.href = "/";
      });
    };

    loadJitsiScript();

    return () => {
      const scriptElement = document.querySelector("script[src*='external_api.js']");
      if (scriptElement) {
        document.body.removeChild(scriptElement);
      }
    };
  }, [currentUser, dynamicRoomName, dynamicUserInfo]);

  // Afficher un loader pendant le chargement des données
  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <div ref={jitsiContainer} style={{ height: "100vh", width: "100%" }} />;
};

export default JitsiMeeting;