import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";








export const getAllDepartments = query(async ({ db }) => {
  return await db.query("departments").collect();
});
/**
 * Créer un nouveau département (Authentification requise)
 */
export const createDepartment = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    headId: v.optional(v.id("users")), // Chef du département
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Utilisateur non authentifié");

    const departmentId = await ctx.db.insert("departments", {
      ...args,
      createdAt: Date.now(),
    });
    return departmentId;
  },
});

/**
 * Mettre à jour un département (Authentification requise)
 */
export const updateDepartment = mutation({
  args: {
    departmentId: v.id("departments"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    headId: v.optional(v.id("users")),
  },
  handler: async (ctx, { departmentId, ...updates }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Utilisateur non authentifié");

    await ctx.db.patch(departmentId, updates);
    return { success: true };
  },
});

/**
 * Supprimer un département (Authentification requise)
 */
export const deleteDepartment = mutation({
  args: {
    departmentId: v.id("departments"),
  },
  handler: async (ctx, { departmentId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Utilisateur non authentifié");

    await ctx.db.delete(departmentId);
    return { success: true };
  },
});
