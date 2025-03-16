"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutGrid, Loader, LogOut, User, Bell, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

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
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export function UserNav() {
  const { signOut } = useAuthActions();
  const { data, isLoading } = useCurrentUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const Me = useQuery(api.auth.getMe);

  const notifications = useQuery(api.mutations.notifications.getNotificationsForUser, {
    userId: Me?._id as Id<"users">, // ID de l'utilisateur actuel
  });

  // Mutation pour marquer toutes les notifications comme lues
  const markAllAsRead = useMutation(api.mutations.notifications.markAllNotificationsAsRead);

  // Mettre à jour le compteur de notifications non lues
  useEffect(() => {
    if (notifications) {
      const unread = notifications.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    }
  }, [notifications]);

  if (isLoading) {
    return <Loader className="size-4 animate-spin text-muted-foreground" />;
  }

  if (!data) {
    return null;
  }

  const { image, name, email, role } = data;
  const avatarFallback = name!.charAt(0).toUpperCase();

  // Fonction pour marquer toutes les notifications comme lues
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({ userId: data._id });
      toast.success("All notifications have been marked as read.");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Une erreur s'est produite.");
    }
  };

  // Fonction pour formater la date
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `Il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
    } else if (hours < 24) {
      return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`;
    } else {
      return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
    }
  };

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
              <Button
                variant="link"
                className="text-sm text-primary"
                onClick={handleMarkAllAsRead}
              >
Mark all as read
</Button>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-64 overflow-y-auto">
            {notifications?.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">
                Aucune notification pour le moment.
              </p>
            ) : (
              notifications?.map((notification: any) => {
                // Icône en fonction du type de notification
                let icon;
                switch (notification.type) {
                  case "info":
                    icon = <Info className="h-4 w-4 text-blue-500" />;
                    break;
                  case "warning":
                    icon = <AlertTriangle className="h-4 w-4 text-yellow-500" />;
                    break;
                  case "error":
                    icon = <XCircle className="h-4 w-4 text-red-500" />;
                    break;
                  case "success":
                    icon = <CheckCircle className="h-4 w-4 text-green-500" />;
                    break;
                  default:
                    icon = <Info className="h-4 w-4 text-blue-500" />;
                }

                return (
                  <DropdownMenuItem
                    key={notification._id}
                    className="flex flex-col items-start gap-1 p-3 hover:bg-muted/50 transition-colors duration-200"
                    asChild
                  >
                    <Link href={notification.link || "#"}>
                      <div className="flex items-center gap-2">
                        {icon}
                        <p className="text-sm font-medium">{notification.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                      {!notification.isRead && (
                        <span className="text-xs text-primary">Non lu</span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                );
              })
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