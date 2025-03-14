// convex/mutations/messages.ts
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const sendMessage = mutation({
  args: {
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
  },
  handler: async (ctx, args) => {
    // Créer un nouveau message
    const messageId = await ctx.db.insert("messages", {
      senderId: args.senderId,
      receiverId: args.receiverId,
      content: args.content,
      timestamp: Date.now(),
      status: "sent", // Statut initial
      type: args.type,
    });

    return { messageId, message: "Message sent successfully!" };
  },
});
// convex/mutations/messages.ts
export const markMessageAsRead = mutation({
    args: {
      messageId: v.id("messages"),
    },
    handler: async (ctx, args) => {
      // Mettre à jour le statut du message
      await ctx.db.patch(args.messageId, {
        status: "read",
      });
  
      return { message: "Message marked as read." };
    },
  });

  // convex/mutations/messages.ts
export const markMessageAsDelivered = mutation({
    args: {
      messageId: v.id("messages"),
    },
    handler: async (ctx, args) => {
      // Mettre à jour le statut du message
      await ctx.db.patch(args.messageId, {
        status: "delivered",
      });
  
      return { message: "Message marked as delivered." };
    },
  });

  // convex/mutations/messages.ts
export const deleteMessage = mutation({
    args: {
      messageId: v.id("messages"),
    },
    handler: async (ctx, args) => {
      // Supprimer le message
      await ctx.db.delete(args.messageId);
  
      return { message: "Message deleted successfully." };
    },
  });

  export const getMessagesBetweenUsers = query({
    args: {
      senderId: v.id("users"),
      receiverId: v.id("users"),
    },
    handler: async (ctx, args) => {
      // Récupérer les messages entre les deux utilisateurs
      const messages = await ctx.db
        .query("messages")
        .filter((q) =>
          q.or(
            q.and(
              q.eq(q.field("senderId"), args.senderId),
              q.eq(q.field("receiverId"), args.receiverId)
            ),
            q.and(
              q.eq(q.field("senderId"), args.receiverId),
              q.eq(q.field("receiverId"), args.senderId)
            )
          )
        )
        .order("asc") // Trier par timestamp croissant
        .collect();
  
      return messages;
    },
  });

  export const getUnreadMessagesCount = mutation({
    args: {
      userId: v.id("users"), // ID de l'utilisateur actuel
    },
    handler: async (ctx, args) => {
      // Récupérer tous les messages non lus pour l'utilisateur
      const unreadMessages = await ctx.db
        .query("messages")
        .filter((q) =>
          q.and(
            q.eq(q.field("receiverId"), args.userId), // Messages destinés à l'utilisateur
            q.eq(q.field("status"), "sent") // Messages non lus
          )
        )
        .collect();
  
      // Retourner le nombre de messages non lus
      return unreadMessages.length;
    },
  });

export const getUnreadMessagesCountByConversation = mutation({
  args: {
    userId: v.id("users"), // ID de l'utilisateur actuel
    conversationUserId: v.id("users"), // ID de l'autre utilisateur dans la conversation
  },
  handler: async (ctx, args) => {
    const unreadMessages = await ctx.db
      .query("messages")
      .filter((q) =>
        q.and(
          q.eq(q.field("receiverId"), args.userId), // Messages destinés à l'utilisateur actuel
          q.eq(q.field("senderId"), args.conversationUserId), // Messages envoyés par l'autre utilisateur
          q.eq(q.field("status"), "sent") // Messages non lus
        )
      )
      .collect();

    // Retourner le nombre de messages non lus
    return unreadMessages.length;
  },
});
  