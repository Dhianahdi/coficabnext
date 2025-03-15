"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutGrid, Loader, LogOut, User, Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useCurrentUser } from "@/app/api/use-current-user";
import { useAuthActions } from "@convex-dev/auth/react";

export function UserNav() {
  const { signOut } = useAuthActions();
  const { data, isLoading } = useCurrentUser();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simuler le chargement des notifications
  useEffect(() => {
    // Remplacez cette partie par un appel API pour récupérer les notifications
    const fetchNotifications = async () => {
      const fakeNotifications = [
        { id: 1, title: "Nouveau message", message: "Vous avez un nouveau message de John.", isRead: false, link: "/messages" },
        { id: 2, title: "Candidature acceptée", message: "Votre candidature pour le poste de Développeur a été acceptée.", isRead: true, link: "/jobs" },
      ];
      setNotifications(fakeNotifications);
      setUnreadCount(fakeNotifications.filter((n) => !n.isRead).length);
    };

    fetchNotifications();
  }, []);

  if (isLoading) {
    return <Loader className="size-4 animate-spin text-muted-foreground" />;
  }

  if (!data) {
    return null;
  }

  const { image, name, email, role } = data;
  const avatarFallback = name!.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-4">
      {/* Icône de notifications */}
      <DropdownMenu>
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full p-0"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Notifications</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Menu des notifications */}
        <DropdownMenuContent className="w-96" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Notifications</p>
              <Button variant="link" className="text-sm text-primary">
                Marquer tout comme lu
              </Button>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">
                Aucune notification pour le moment.
              </p>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 p-3 hover:bg-muted/50"
                  asChild
                >
                  <Link href={notification.link || "#"}>
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    {!notification.isRead && (
                      <span className="text-xs text-primary">Non lu</span>
                    )}
                  </Link>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Menu de l'utilisateur */}
      <DropdownMenu>
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage alt={name} src={image} />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">Profile</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenuContent className="w-70" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                <strong>{name}</strong>
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                <strong>{email}</strong>
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                <strong>{role}</strong>
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="hover:cursor-pointer" asChild>
              <Link href="/dashboard" className="flex items-center">
                <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:cursor-pointer">
            <Link href="/Profile" className="flex items-center">

              <User className="w-4 h-4 mr-3 text-muted-foreground" />
              Profile
              </Link>

            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="hover:cursor-pointer"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}