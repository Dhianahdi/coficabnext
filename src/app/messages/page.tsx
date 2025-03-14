"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, Send, User } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "../api/use-current-user";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function MessagesPage() {
  const users = useQuery(api.mutations.user.fetchAllUsers) || [];
  const [selectedUserId, setSelectedUserId] = React.useState<Id<"users"> | null>(null);
  const [messageContent, setMessageContent] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [unreadCounts, setUnreadCounts] = React.useState<Record<string, number>>({}); // État pour stocker les messages non lus par utilisateur
  const Me = useQuery(api.auth.getMe);
  const { data, isLoading } = useCurrentUser();

  const sendMessage = useMutation(api.mutations.messages.sendMessage);
  const markMessageAsRead = useMutation(api.mutations.messages.markMessageAsRead);
  const markMessageAsDelivered = useMutation(api.mutations.messages.markMessageAsDelivered);
  const getUnreadMessagesCountByConversation = useMutation(
    api.mutations.messages.getUnreadMessagesCountByConversation
  );

  // Récupérer le département de l'utilisateur actuel
  const department = useQuery(
    api.queries.departments.getDepartmentById,
    Me?.departmentId
      ? { id: Me.departmentId as Id<"departments"> }
      : "skip"
  );

  // Appeler la query uniquement si senderId et receiverId sont définis
  const messages = useQuery(
    api.mutations.messages.getMessagesBetweenUsers,
    Me?._id && selectedUserId
      ? {
          senderId: Me._id, // Utiliser l'ID de l'utilisateur actuel
          receiverId: selectedUserId,
        }
      : "skip" // Ne pas appeler la query si senderId ou receiverId est null/undefined
  );

  // Marquer les messages comme "livrés" ou "lus" lorsque la conversation est ouverte
  React.useEffect(() => {
    if (selectedUserId && messages) {
      messages.forEach(async (message) => {
        if (message.receiverId === Me?._id && message.status === "sent") {
          await markMessageAsDelivered({ messageId: message._id });
        }
        if (message.receiverId === Me?._id && message.status === "delivered") {
          await markMessageAsRead({ messageId: message._id });
        }
      });
    }
  }, [selectedUserId, messages, Me?._id, markMessageAsDelivered, markMessageAsRead]);

  // Charger les messages non lus pour chaque utilisateur
  React.useEffect(() => {
    const fetchUnreadCounts = async () => {
      const counts: Record<string, number> = {};
      for (const user of users) {
        if (user._id !== Me?._id && Me) {
          const count = await getUnreadMessagesCountByConversation({
            userId: Me._id,
            conversationUserId: user._id,
          });
          counts[user._id] = count;
        }
      }
      setUnreadCounts(counts);
    };

    if (Me?._id && users.length > 0) {
      fetchUnreadCounts();
    }
  }, [Me?._id, users, getUnreadMessagesCountByConversation]);

  if (isLoading) {
    return <Loader className="size-4 animate-spin text-muted-foreground" />;
  }

  if (!data || !Me) {
    return null;
  }

  const { image, name, email, role } = data;

  // Filtrer les utilisateurs à afficher
  const filteredUsers = users.filter((user) => {
    if (user._id === Me._id) return false;

    if (Me.departmentId) return true;

    return (
      user.department.name === "RH" ||
      messages?.some((msg) => msg.senderId === user._id || msg.receiverId === user._id)
    );
  });

  // Filtrer les utilisateurs en fonction de la barre de recherche
  const searchedUsers = filteredUsers.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trier les utilisateurs par date du dernier message
  const sortedUsers = searchedUsers.sort((a, b) => {
    const lastMessageA = messages
      ?.filter((msg) => msg.senderId === a._id || msg.receiverId === a._id)
      .sort((msg1, msg2) => msg2.timestamp - msg1.timestamp)[0]?.timestamp || 0;

    const lastMessageB = messages
      ?.filter((msg) => msg.senderId === b._id || msg.receiverId === b._id)
      .sort((msg1, msg2) => msg2.timestamp - msg1.timestamp)[0]?.timestamp || 0;

    return lastMessageB - lastMessageA; // Tri décroissant
  });

  const handleSendMessage = async () => {
    if (!selectedUserId || !messageContent.trim()) {
      toast.error("Please select a user and enter a message.");
      return;
    }

    try {
      await sendMessage({
        senderId: Me._id, // Utiliser l'ID de l'utilisateur actuel
        receiverId: selectedUserId,
        content: messageContent,
        type: "text",
      });
      setMessageContent("");
      toast.success("Message sent!");
    } catch (error) {
      toast.error("Failed to send message.");
    }
  };

  return (
    <AdminPanelLayout>
      <ContentLayout title="Recent Jobs">
        <div className="p-6">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Messaging
          </h1>
          <div className="flex h-[calc(100vh-160px)] bg-gray-50 rounded-lg shadow-lg overflow-hidden">
            {/* Sidebar - Liste des utilisateurs */}
            <div className="w-1/4 bg-white border-r border-gray-200 p-6 overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Users</h2>
              {/* Barre de recherche */}
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name..."
                className="mb-6"
              />
              <ul className="space-y-4">
                {sortedUsers.map((user) => {
                  const unreadCount = unreadCounts[user._id] || 0;
                  return (
                    <li
                      key={user._id}
                      onClick={() => setSelectedUserId(user._id)}
                      className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                        selectedUserId === user._id
                          ? "bg-blue-50 shadow-sm"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <Avatar className="mr-3">
                        <AvatarImage alt={user.name} src={user.image} />
                        <AvatarFallback>
                          <User className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      {/* Indicateur de nouveaux messages non lus */}
                      {unreadCount > 0 && (
                        <div className="w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
                          {unreadCount}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Zone de conversation */}
            <div className="flex-1 flex flex-col bg-white">
              {/* En-tête de la conversation */}
              <div className="bg-white border-b border-gray-200 p-6">
                {selectedUserId ? (
                  <div className="flex items-center">
                    <Avatar className="mr-3">
                      <AvatarImage
                        src={users.find((u) => u._id === selectedUserId)?.image}
                      />
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {users.find((u) => u._id === selectedUserId)?.name}
                      </p>
                      <p className="text-sm text-gray-500">Online</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Select a user to start chatting</p>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                {selectedUserId ? (
                  messages?.length ? (
                    messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${
                          message.senderId === Me._id
                            ? "justify-end"
                            : "justify-start"
                        } mb-4`}
                      >
                        <div
                          className={`max-w-[70%] p-4 rounded-lg ${
                            message.senderId === Me._id
                              ? "bg-blue-500 text-white"
                              : "bg-white shadow-sm"
                          }`}
                        >
                          <p>{message.content}</p>
                          <small className="text-xs opacity-70 block mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center">No messages yet.</p>
                  )
                ) : (
                  <p className="text-gray-500 text-center">Select a user to view messages.</p>
                )}
              </div>

              {/* Zone de saisie de message */}
              {selectedUserId && (
                <div className="bg-white border-t border-gray-200 p-6">
                  <div className="flex gap-4">
                    <Input
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                      }}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}