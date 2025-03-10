import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";


export const fetchAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    // Charger les rôles et départements pour chaque utilisateur
    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        const role = user.roleId ? await ctx.db.get(user.roleId as Id<"roles">) : null;
        const department = user.departmentId ? await ctx.db.get(user.departmentId as Id<"departments">) : null;

        return {
          ...user,
          role: role ? { _id: role._id, name: role.name } : { _id: null, name: "N/A" },
          department: department ? { _id: department._id, name: department.name } : { _id: null, name: "N/A" },
        };
      })
    );

    return usersWithDetails;
  },
});

/**
 * Create a new user
 */
export const createUser = mutation({
  args: {
    name: v.string(),
    status: v.optional(v.string()),

    email: v.string(),
    image: v.optional(v.string()),
    phone: v.optional(v.string()),
    roleId: v.optional(v.id("roles")),
    departmentId: v.optional(v.id("departments")),
    resumeURL: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    certifications: v.optional(v.array(v.string())),
    availability: v.optional(v.string()),
    notificationPreferences: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      ...args,
      lastLogin: Date.now(), // Set last login time on creation
    });
    return userId;
  },
});

/**
 * Update an existing user
 */
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
        status: v.optional(v.string()),
    
    image: v.optional(v.string()),
    phone: v.optional(v.string()),
    roleId: v.optional(v.id("roles")),
    departmentId: v.optional(v.id("departments")),
    resumeURL: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    certifications: v.optional(v.array(v.string())),
    availability: v.optional(v.string()),
    notificationPreferences: v.optional(v.string()),
  },
  handler: async (ctx, { userId, ...updates }) => {
    await ctx.db.patch(userId, updates);
    return { success: true };
  },
});

/**
 * Delete a user
 */
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    await ctx.db.delete(userId);
    return { success: true };
  },
});

/**
 * Assign a role to a user
 */
export const assignRole = mutation({
  args: {
    userId: v.id("users"),
    roleId: v.id("roles"),
  },
  handler: async (ctx, { userId, roleId }) => {
    await ctx.db.patch(userId, { roleId });
    return { success: true };
  },
});

/**
 * Assign a department to a user
 */
export const assignDepartment = mutation({
  args: {
    userId: v.id("users"),
    departmentId: v.id("departments"),
  },
  handler: async (ctx, { userId, departmentId }) => {
    await ctx.db.patch(userId, { departmentId });
    return { success: true };
  },
});

/**
 * Update last login timestamp
 */
export const updateLastLogin = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    await ctx.db.patch(userId, { lastLogin: Date.now() });
    return { success: true };
  },
});

export const blockUser = mutation({
  args: { userId: v.id("users"), isBlocked: v.boolean() },
  handler: async ({ db }, { userId, isBlocked }) => {
    await db.patch(userId, { isBlocked });
  },
});


export const inviteUser = mutation({
  args: {
    email: v.string(), // Email de l'utilisateur invité
    departmentId: v.optional(v.id("departments")), // ID du département sélectionné
  },
  handler: async (ctx, args) => {
    const { email, departmentId } = args;

    // Vérifiez si l'utilisateur existe déjà
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email)) // Utiliser l'index "by_email"
      .unique();

    if (existingUser) {
      throw new Error("User with this email already exists.");
    }

    // Créez un nouvel utilisateur avec un statut "invited"
    await ctx.db.insert("users", {
      email,
      departmentId,
      status: "invited", // Statut pour indiquer que l'utilisateur est invité
    });

    // Retournez un message de succès
    return { success: true, message: "User invited successfully!" };
  },
});

export const createInvitation = mutation({
  args: {
    email: v.string(),
    departmentId: v.id("departments"),
  },
  handler: async (ctx, args) => {
    // Vérifier si une invitation existe déjà pour cet e-mail
    const existingInvitation = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingInvitation) {
      throw new Error("Invitation already exists for this email.");
    }

    // Créer une nouvelle invitation
    await ctx.db.insert("invitations", {
      email: args.email,
      departmentId: args.departmentId,
      status: "pending", // Statut initial
    });

    return { message: "Invitation created successfully!" };
  },
});

export const getInvitationByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!invitation) {
      throw new Error("Invitation not found.");
    }

    return invitation;
  },
});


// convex/mutations/invitations.ts
export const deleteExpiredInvitations = mutation({
  args: {},
  handler: async (ctx) => {
    const invitations = await ctx.db
      .query("invitations")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const now = Date.now();
    const expirationTime = 24 * 60 * 60 * 1000; // 24 heures

    for (const invitation of invitations) {
      if (now - invitation._creationTime > expirationTime) {
        await ctx.db.patch(invitation._id, {
          status: "expired", // Marquer comme expirée
        });
        await ctx.db.delete(invitation._id); // Supprimer l'invitation
      }
    }

    return { message: "Expired invitations deleted successfully." };
  },
});

export const markInvitationAsCompleted = mutation({
  args: {
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invitationId, {
      status: "completed",
    });

    return { message: "Invitation marked as completed." };
  },
});


export const updateUserDepartmentAndStatus = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, { email }) => {
    // Récupérer les utilisateurs avec le même email
    const users = await ctx.db.query("users").withIndex("email", (q) => q.eq("email", email)).collect();

    if (users.length !== 2) {
      throw new Error("There should be exactly two users with the same email.");
    }

    // Trouver l'utilisateur qui a un name et celui qui n'en a pas
    const userWithName = users.find((user) => user.name);
    const userWithoutName = users.find((user) => !user.name);

    if (!userWithName || !userWithoutName) {
      throw new Error("Could not find the correct users to update.");
    }

    // Mettre à jour le departmentId et le status de l'utilisateur avec un name
    await ctx.db.patch(userWithName._id, {
      departmentId: userWithoutName.departmentId,
      status: "Accepted",
    });

    // Supprimer l'utilisateur sans name
    await ctx.db.delete(userWithoutName._id);

    return { success: true };
  },
});
