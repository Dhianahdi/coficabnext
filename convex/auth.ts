import { convexAuth, getAuthUserId, modifyAccountCredentials } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";
import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { checkPermission } from "./lib/permissions";
import { Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";

const CustomPassword = Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      name: params.name as string,
    };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [GitHub, Google, CustomPassword,],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      if (args.existingUserId) return;

      let defaultRole = await ctx.db
        .query("roles")
        .filter(q => q.eq(q.field("name"), "Default"))
        .first();

      if (!defaultRole) {
        const roleId = await ctx.db.insert("roles", {
          companyId: undefined,
          name: "Default",
          permissions: [],
        });

        defaultRole = await ctx.db.get(roleId);
      }

      if (defaultRole?._id) {
        await ctx.db.patch(args.userId, {
          roleId: defaultRole._id as Id<"roles">,

        });
      }
    }
  },
});
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const role = user.roleId ? await ctx.db.get(user.roleId as Id<"roles">) : null;
    const department = user.departmentId ? await ctx.db.get(user.departmentId as Id<"departments">) : null;

    return {
      ...user, // Toutes les propriétés de l'utilisateur
      role: role?.name || "Guest", // Nom du rôle
      permissions: role?.permissions || [], // Permissions du rôle
      department: department ? { id: department._id, name: department.name } : null, // Nom du département
    };
  },
});


export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    newRoleId: v.id("roles"),
  },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new Error("Not signed in");

    const canUpdateRoles = await checkPermission(ctx, adminId, "manage_users");
    if (!canUpdateRoles) throw new Error("Insufficient permissions");

    await ctx.db.patch(args.userId, { roleId: args.newRoleId });
  },
});




export const changePassword = mutation({
  args: {
    currentPassword: v.string(), // Mot de passe actuel
    newPassword: v.string(), // Nouveau mot de passe
  },
  handler: async (ctx, { currentPassword, newPassword }) => {
    // Vérifier l'identité de l'utilisateur
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Récupérer l'ID du compte
    const accountId = identity.tokenIdentifier;

      // Planifier l'action pour s'exécuter après la mutation
      await ctx.scheduler.runAfter(0, api.actions.modifyAccountCredentials.modifyAccountCredentialsAction, {
        accountId,
        providerId: "password",
        currentSecret: currentPassword,
        newSecret: newPassword,
      });
    return { success: true }; // Retourner un succès
  },
});