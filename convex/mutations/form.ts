import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Mutation pour créer un formulaire
export const createForm = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    createdBy: v.id("users"), // ID de l'utilisateur qui crée le formulaire
  },
  handler: async (ctx, args) => {
    const formId = await ctx.db.insert("forms", {
      title: args.title,
      description: args.description,
      createdAt: Date.now(),
      updatedAt: 0,
      createdBy: args.createdBy,
    });
    return formId;
  },
});

// Mutation pour mettre à jour un formulaire
export const updateForm = mutation({
  args: {
    formId: v.id("forms"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { formId, ...rest } = args;
    await ctx.db.patch(formId, {
      ...rest,
      updatedAt: Date.now(),
    });
  },
});

// Mutation pour supprimer un formulaire
export const deleteForm = mutation({
  args: {
    formId: v.id("forms"),
  },
  handler: async (ctx, args) => {
    // Supprimer toutes les questions associées au formulaire
    const questions = await ctx.db
      .query("questions")
      .withIndex("formId", (q) => q.eq("formId", args.formId))
      .collect();

    for (const question of questions) {
      await ctx.db.delete(question._id);
    }

    // Supprimer le formulaire
    await ctx.db.delete(args.formId);
  },
});

// Mutation pour ajouter une question à un formulaire
export const addQuestion = mutation({
  args: {
    formId: v.id("forms"),
    text: v.string(),
    type: v.union(
      v.literal("single-choice"),
      v.literal("multiple-choice"),
      v.literal("open-ended")
    ),
    options: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const questionId = await ctx.db.insert("questions", {
      formId: args.formId,
      text: args.text,
      type: args.type,
      options: args.options,
      answer: "",
    });
    return questionId;
  },
});

// Mutation pour mettre à jour une question
export const updateQuestion = mutation({
  args: {
    questionId: v.id("questions"),
    text: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("single-choice"),
        v.literal("multiple-choice"),
        v.literal("open-ended")
      )
    ),
    options: v.optional(v.array(v.string())),
    answer: v.optional(v.union(v.string(), v.array(v.string()))),
  },
  handler: async (ctx, args) => {
    const { questionId, ...rest } = args;
    await ctx.db.patch(questionId, rest);
  },
});

// Mutation pour supprimer une question
export const deleteQuestion = mutation({
  args: {
    questionId: v.id("questions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.questionId);
  },
});

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

// Dans votre fichier mutations.ts
export const submitResponse = mutation({
  args: {
    formId: v.id("forms"),
    userId: v.id("users"), // Ajouter l'ID de l'utilisateur
    responses: v.array(
      v.object({
        questionId: v.string(),
        answer: v.union(v.string(), v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const submittedAt = Date.now();
    for (const response of args.responses) {
      await ctx.db.insert("responses", {
        formId: args.formId,
        questionId: response.questionId,
        answer: response.answer,
        userId: args.userId, // Inclure l'ID de l'utilisateur
        submittedAt,
      });
    }
  },
});