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