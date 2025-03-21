"use node";
import { v } from "convex/values";
import { modifyAccountCredentials } from "@convex-dev/auth/server";
import { action } from "../_generated/server";

export const modifyAccountCredentialsAction = action({
  args: {
    accountId: v.string(), // ID du compte
    providerId: v.string(), // ID du fournisseur
    currentSecret: v.string(), // Mot de passe actuel
    newSecret: v.string(), // Nouveau mot de passe
  },
  handler: async (ctx, args) => {
    // Appeler la fonction `modifyAccountCredentials` avec les arguments corrects
    await modifyAccountCredentials(ctx, {
      provider: args.providerId, // Le fournisseur d'authentification
      account: {
        id: args.accountId, // L'ID du compte
        secret: args.newSecret, // Le nouveau mot de passe
      },
    });
  },
});