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
  const createNotification = useMutation(api.mutations.notifications.createNotification);

  // Récupérer le département de l'utilisateur actuel

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
         // Envoyer une notification à l'organisateur et au participant
         const notificationTitle = "Message";
         const notificationMessage = `New message from${Me.name}.`;
         const notificationLink = ``; // Lien vers la réunion
     
         await createNotification({
           userId: selectedUserId,
           title: notificationTitle,
           message: notificationMessage,
           link: notificationLink,
           type: "success",
         });

      
      
      toast.success("Message sent!");
    } catch (error) {
      toast.error("Failed to send message.");
    }
  };


  return (
    <AdminPanelLayout>
      <ContentLayout title="Messages">
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Messaging Center
              </h1>
              <p className="text-muted-foreground mt-1">
                Connect and communicate with your colleagues
              </p>
            </div>
          </div>
          
          <div className="flex h-[calc(100vh-200px)] bg-background rounded-lg shadow-md border border-border overflow-hidden">
            {/* Sidebar - User list */}
            <div className="w-full md:w-1/3 lg:w-1/4 bg-background border-r border-border flex flex-col">
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name..."
                    className="pl-9 bg-background text-foreground border-border"
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="overflow-y-auto flex-1">
                {sortedUsers.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {sortedUsers.map((user) => {
                      const unreadCount = unreadCounts[user._id] || 0;
                      return (
                        <li
                          key={user._id}
                          onClick={() => setSelectedUserId(user._id)}
                          className={`flex items-center p-4 cursor-pointer transition-all ${
                            selectedUserId === user._id
                              ? "bg-primary/10 border-l-4 border-l-primary"
                              : "hover:bg-muted/30 border-l-4 border-l-transparent"
                          }`}
                        >
                          <div className="relative">
                            <Avatar className="h-10 w-10 border border-border">
                              <AvatarImage alt={user.name} src={user.image} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {user.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                              </AvatarFallback>
                            </Avatar>
                            {/* Online indicator */}
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                          </div>
                          
                          <div className="ml-3 flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                              <p className="font-medium text-foreground truncate">{user.name}</p>
                              <span className="text-xs text-muted-foreground">
                                {/* Show time of last message if exists */}
                                {messages?.find(m => m.senderId === user._id || m.receiverId === user._id) ? 
                                  new Date(
                                    Math.max(
                                      ...messages
                                        .filter(m => m.senderId === user._id || m.receiverId === user._id)
                                        .map(m => m.timestamp)
                                    )
                                  ).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                                  ''
                                }
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-muted-foreground truncate">
                                {/* Show preview of last message if exists */}
                                {messages?.find(m => m.senderId === user._id || m.receiverId === user._id) ? 
                                  messages
                                    .filter(m => m.senderId === user._id || m.receiverId === user._id)
                                    .sort((a, b) => b.timestamp - a.timestamp)[0]?.content.substring(0, 20) + 
                                    (messages.filter(m => m.senderId === user._id || m.receiverId === user._id)
                                      .sort((a, b) => b.timestamp - a.timestamp)[0]?.content.length > 20 ? '...' : '') : 
                                  user.email
                                }
                              </p>
                              {unreadCount > 0 && (
                                <div className="min-w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground text-xs font-medium rounded-full px-1.5">
                                  {unreadCount}
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="bg-muted/20 p-4 rounded-full mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                        <path d="M17 6.1H3"></path>
                        <path d="M21 12.1H3"></path>
                        <path d="M15.1 18H3"></path>
                      </svg>
                    </div>
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Conversation area */}
            <div className="hidden md:flex flex-1 flex-col bg-background">
              {selectedUserId ? (
                <>
                  {/* Conversation header */}
                  <div className="bg-background border-b border-border p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3 border border-border">
                        <AvatarImage
                          src={users.find((u) => u._id === selectedUserId)?.image}
                          alt={users.find((u) => u._id === selectedUserId)?.name || "User"}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {users.find((u) => u._id === selectedUserId)?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {users.find((u) => u._id === selectedUserId)?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {users.find((u) => u._id === selectedUserId)?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-6 overflow-y-auto bg-muted/5 space-y-4">
                    {messages?.length ? (
                      messages.map((message, index) => {
                        const isCurrentUser = message.senderId === Me._id;
                        const showAvatar = index === 0 || 
                          messages[index - 1].senderId !== message.senderId;
                        
                        return (
                          <div
                            key={message._id}
                            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} items-end gap-2`}
                          >
                            {!isCurrentUser && showAvatar && (
                              <Avatar className="h-8 w-8 mb-1">
                                <AvatarImage
                                  src={users.find((u) => u._id === message.senderId)?.image}
                                  alt={users.find((u) => u._id === message.senderId)?.name || "User"}
                                />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {users.find((u) => u._id === message.senderId)?.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div
                              className={`max-w-[75%] p-3 rounded-lg ${
                                isCurrentUser
                                  ? "bg-primary text-primary-foreground rounded-br-none"
                                  : "bg-card text-card-foreground shadow-sm rounded-bl-none"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <small className="text-xs opacity-70">
                                  {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </small>
                                {isCurrentUser && (
                                  <span className="text-xs">
                                    {message.status === 'read' ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                                        <path d="M18 6 7 17l-5-5"></path>
                                        <path d="m22 10-8 8-4-4"></path>
                                      </svg>
                                    ) : message.status === 'delivered' ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m5 12 5 5L20 7"></path>
                                      </svg>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                                        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                                      </svg>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {isCurrentUser && showAvatar && (
                              <Avatar className="h-8 w-8 mb-1">
                                <AvatarImage src={Me.image} alt={Me.name} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {Me.name?.charAt(0).toUpperCase() || "M"}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="bg-muted/20 p-4 rounded-full mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No messages yet</h3>
                        <p className="text-muted-foreground mt-1">Start the conversation by sending a message below</p>
                      </div>
                    )}
                  </div>

                  {/* Message input */}
                  <div className="bg-background border-t border-border p-4">
                    <div className="flex gap-3">
                      <Input
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-background text-foreground border-border"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleSendMessage();
                        }}
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-4"
                        disabled={!messageContent.trim()}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="bg-muted/20 p-6 rounded-full mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Select a conversation</h3>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    Choose a user from the list to start messaging or continue a conversation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ContentLayout>
    </AdminPanelLayout>
  );
}