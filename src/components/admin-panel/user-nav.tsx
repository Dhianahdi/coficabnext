"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutGrid, Loader, LogOut, User, Bell, Info, AlertTriangle, CheckCircle, XCircle, MessageCircle } from "lucide-react";

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
import { Dialog, DialogContent } from "../ui/dialog";
import MessagesPage from "./MessagesPage";

export function UserNav() {
  const { signOut } = useAuthActions();
  const { data, isLoading } = useCurrentUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const Me = useQuery(api.auth.getMe);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0); // Exemple : 3 messages non lus

  const notifications = useQuery(api.mutations.notifications.getNotificationsForUser, {
    userId: Me?._id as Id<"users">,
  });

  const markAllAsRead = useMutation(api.mutations.notifications.markAllNotificationsAsRead);
  const markAsRead = useMutation(api.mutations.notifications.markNotificationAsRead);
  const getUnreadMessagesCount = useMutation(api.mutations.messages.getUnreadMessagesCount);
  useEffect(() => {
    const fetchUnreadMessagesCount = async () => {
      if (!Me?._id) return; // Ensure the user ID exists

      try {
        const count = await getUnreadMessagesCount({ userId: Me._id });
        const numericValue = Number(count); // Converts to number

        setUnreadMessagesCount(numericValue); // Update the state with the count
      } catch (error) {
        console.error("Failed to fetch unread messages count:", error);
      }
    };

    fetchUnreadMessagesCount(); // Call the function to fetch the count
  }, [Me?._id, getUnreadMessagesCount]);

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

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({ userId: data._id });
      toast.success("All notifications have been marked as read.");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Une erreur s'est produite.");
    }
  };

  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    try {
      await markAsRead({ notificationId });
      toast.success("Notification marked as read.");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Une erreur s'est produite.");
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return ` ${minutes} minute${minutes > 1 ? "s" : ""}`;
    } else if (hours < 24) {
      return ` ${hours} heure${hours > 1 ? "s" : ""}`;
    } else {
      return ` ${days} jour${days > 1 ? "s" : ""}`;
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Bouton de messagerie */}
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMessagesOpen(true)}
              className="relative hover:bg-muted/50 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              {/* Indicateur de nouveaux messages non lus */}
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadMessagesCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Messages</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={isMessagesOpen} onOpenChange={setIsMessagesOpen}>
        <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
          <MessagesPage />
        </DialogContent>
      </Dialog>

      {/* Bouton de notifications */}
      <DropdownMenu>
        <TooltipProvider disableHoverableContent>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-muted/50 transition-colors"
                >
                  <Bell className="w-5 h-5" />
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
                    onClick={() => handleMarkAsRead(notification._id)}
                  >
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
                      <span className="text-xs text-primary">Unread </span>
                    )}
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
                  size="icon"
                  className="relative h-8 w-8 rounded-full hover:bg-muted/50 transition-colors"
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
              <p className="text-sm font-medium leading-none">{name}</p>
              <p className="text-xs leading-none text-muted-foreground">{email}</p>
              <p className="text-xs leading-none text-muted-foreground">{role}</p>
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
            <DropdownMenuItem className="hover:cursor-pointer" asChild>
              <Link href="/profile" className="flex items-center">
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