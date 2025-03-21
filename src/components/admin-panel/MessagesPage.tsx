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
import { useCurrentUser } from "@/app/api/use-current-user";

export default function MessagesPage() {
  const users = useQuery(api.mutations.user.fetchAllUsers) || [];
  const [selectedUserId, setSelectedUserId] = React.useState<Id<"users"> | null>(null);
  const [messageContent, setMessageContent] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [unreadCounts, setUnreadCounts] = React.useState<Record<string, number>>({});
  const Me = useQuery(api.auth.getMe);
  const { data, isLoading } = useCurrentUser();

  const sendMessage = useMutation(api.mutations.messages.sendMessage);
  const markMessageAsRead = useMutation(api.mutations.messages.markMessageAsRead);
  const markMessageAsDelivered = useMutation(api.mutations.messages.markMessageAsDelivered);
  const getUnreadMessagesCountByConversation = useMutation(
    api.mutations.messages.getUnreadMessagesCountByConversation
  );
  const createNotification = useMutation(api.mutations.notifications.createNotification);

  const messages = useQuery(
    api.mutations.messages.getMessagesBetweenUsers,
    Me?._id && selectedUserId
      ? {
          senderId: Me._id,
          receiverId: selectedUserId,
        }
      : "skip"
  );

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

  const filteredUsers = users.filter((user) => {
    if (user._id === Me._id) return false;

    if (Me.departmentId) return true;

    return (
      user.department.name === "RH" ||
      messages?.some((msg) => msg.senderId === user._id || msg.receiverId === user._id)
    );
  });

  const searchedUsers = filteredUsers.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedUsers = searchedUsers.sort((a, b) => {
    const lastMessageA = messages
      ?.filter((msg) => msg.senderId === a._id || msg.receiverId === a._id)
      .sort((msg1, msg2) => msg2.timestamp - msg1.timestamp)[0]?.timestamp || 0;

    const lastMessageB = messages
      ?.filter((msg) => msg.senderId === b._id || msg.receiverId === b._id)
      .sort((msg1, msg2) => msg2.timestamp - msg1.timestamp)[0]?.timestamp || 0;

    return lastMessageB - lastMessageA;
  });

  const handleSendMessage = async () => {
    if (!selectedUserId || !messageContent.trim()) {
      toast.error("Please select a user and enter a message.");
      return;
    }

    try {
      await sendMessage({
        senderId: Me._id,
        receiverId: selectedUserId,
        content: messageContent,
        type: "text",
      });
      setMessageContent("");
      const notificationTitle = "Message";
      const notificationMessage = `New message from ${Me.name}.`;
      const notificationLink = ``;

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
     <div className="p-6">
             <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6 text-foreground">
               Messaging
             </h1>
             <div className="flex h-[calc(100vh-160px)] bg-background rounded-lg shadow-lg overflow-hidden">
               {/* Sidebar - Liste des utilisateurs */}
               <div className="w-1/4 bg-background border-r border-border p-6 overflow-y-auto">
                 <h2 className="text-xl font-bold text-foreground mb-6">Users</h2>
                 {/* Barre de recherche */}
                 <Input
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search by name..."
                   className="mb-6 bg-background text-foreground border-border"
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
                             ? "bg-secondary text-secondary-foreground shadow-sm"
                             : "hover:bg-secondary/50"
                         }`}
                       >
                         <Avatar className="mr-3">
                           <AvatarImage alt={user.name} src={user.image} />
                           <AvatarFallback>
                             <User className="w-5 h-5" />
                           </AvatarFallback>
                         </Avatar>
                         <div className="flex-1">
                           <p className="font-semibold text-foreground">{user.name}</p>
                           <p className="text-sm text-muted-foreground">{user.email}</p>
                         </div>
                         {/* Indicateur de nouveaux messages non lus */}
                         {unreadCount > 0 && (
                           <div className="w-5 h-5 flex items-center justify-center bg-destructive text-destructive-foreground text-xs rounded-full">
                             {unreadCount}
                           </div>
                         )}
                       </li>
                     );
                   })}
                 </ul>
               </div>
   
               {/* Zone de conversation */}
               <div className="flex-1 flex flex-col bg-background">
                 {/* En-tête de la conversation */}
                 <div className="bg-background border-b border-border p-6">
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
                         <p className="font-semibold text-foreground">
                           {users.find((u) => u._id === selectedUserId)?.name}
                         </p>
                         <p className="text-sm text-muted-foreground">Online</p>
                       </div>
                     </div>
                   ) : (
                     <p className="text-muted-foreground">Select a user to start chatting</p>
                   )}
                 </div>
   
                 {/* Messages */}
                 <div className="flex-1 p-6 overflow-y-auto bg-secondary/10">
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
                                 ? "bg-primary text-primary-foreground"
                                 : "bg-background shadow-sm"
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
                       <p className="text-muted-foreground text-center">No messages yet.</p>
                     )
                   ) : (
                     <p className="text-muted-foreground text-center">Select a user to view messages.</p>
                   )}
                 </div>
   
                 {/* Zone de saisie de message */}
                 {selectedUserId && (
                   <div className="bg-background border-t border-border p-6">
                     <div className="flex gap-4">
                       <Input
                         value={messageContent}
                         onChange={(e) => setMessageContent(e.target.value)}
                         placeholder="Type a message..."
                         className="flex-1 bg-background text-foreground border-border"
                         onKeyPress={(e) => {
                           if (e.key === "Enter") handleSendMessage();
                         }}
                       />
                       <Button onClick={handleSendMessage} className="bg-primary text-primary-foreground hover:bg-primary/90">
                         <Send className="w-5 h-5" />
                       </Button>
                     </div>
                   </div>
                 )}
               </div>
             </div>
           </div>
  );
}