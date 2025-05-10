import { v } from "convex/values";
import { query } from "../_generated/server";

export const getFormWithQuestions = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form) {
      throw new Error("Formulaire non trouvé");
    }

    const questions = await ctx.db
      .query("questions")
      .withIndex("formId", (q) => q.eq("formId", args.formId))
      .collect();

    return {
      ...form,
      questions,
    };
  },
});