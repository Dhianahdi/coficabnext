import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "../_generated/dataModel";

/**
 * Create a new job posting
 */

export const createJob = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    departmentId: v.optional(v.id("departments")),
    requirements: v.optional(v.string()),
    salaryRange: v.optional(v.string()),
    employmentType: v.optional(v.string()),
    location: v.optional(v.string()),
    experienceLevel: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    applicationDeadline: v.optional(v.float64()),
    interviewProcess: v.optional(v.string()),
    collaborators: v.optional(v.array(v.id("users"))),
    formIds: v.optional(v.array(v.id("forms"))), // Liste des IDs des formulaires à associer
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    // Vérifier que le recruteur existe
    const recruiter = await ctx.db.get(userId as Id<"users">);
    if (!recruiter) throw new Error("Recruiter not found");

    // Vérifier que le département existe si fourni
    if (args.departmentId) {
      const department = await ctx.db.get(args.departmentId);
      if (!department) throw new Error("Department not found");
    }

    // Vérifier que les collaborateurs existent si fournis
    if (args.collaborators) {
      for (const collaboratorId of args.collaborators) {
        const collaborator = await ctx.db.get(collaboratorId);
        if (!collaborator) throw new Error(`Collaborator ID ${collaboratorId} not found`);
      }
    }

    // Vérifier que les formulaires existent si fournis
    if (args.formIds) {
      for (const formId of args.formIds) {
        const form = await ctx.db.get(formId);
        if (!form) throw new Error(`Form ID ${formId} not found`);
      }
    }

    // Insérer le job dans la base de données
    const jobId = await ctx.db.insert("jobs", {
      title: args.title,
      description: args.description,
      recruiterId: userId as Id<"users">,
      departmentId: args.departmentId,
      requirements: args.requirements,
      salaryRange: args.salaryRange,
      employmentType: args.employmentType,
      location: args.location,
      experienceLevel: args.experienceLevel,
      tags: args.tags,
      applicationDeadline: args.applicationDeadline,
      interviewProcess: args.interviewProcess,
      collaborators: args.collaborators,
      updatedAt: Date.now(),
      status: "Pending", // Statut par défaut
    });

    // Associer les formulaires au job dans la table de jointure
    if (args.formIds) {
      for (const formId of args.formIds) {
        await ctx.db.insert("jobForms", {
          jobId,
          formId,
        });
      }
    }

    return jobId;
  },
});
export const deleteJob = mutation({
  args: {
    jobId: v.id("jobs"), // The ID of the job to delete
  },
  handler: async (ctx, { jobId }) => {
    // Delete the job from the database
    await ctx.db.delete(jobId);
  },
});

export const bulkDeleteJobs = mutation({
  args: {
    jobIds: v.array(v.id("jobs")), // Array of job IDs to delete
  },
  handler: async (ctx, { jobIds }) => {
    // Delete each job in the array
    await Promise.all(jobIds.map((jobId) => ctx.db.delete(jobId)));
    return jobIds.length; // Return the number of deleted jobs
  },
});

/**
 * Update an existing job posting
 */
export const updateJob = mutation({
  args: {
    jobId: v.id("jobs"), // The ID of the job to update
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    departmentId: v.optional(v.id("departments")),
    requirements: v.optional(v.string()),
    salaryRange: v.optional(v.string()),
    employmentType: v.optional(v.string()),
    location: v.optional(v.string()),
    experienceLevel: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    applicationDeadline: v.optional(v.float64()),
    interviewProcess: v.optional(v.string()), 
    collaborators: v.optional(v.array(v.id("users"))),
    formIds: v.optional(v.array(v.id("forms"))), // Ajout des formIds comme dans createJob
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    // Ensure the job exists
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    // Ensure the recruiter is the owner of the job
    if (job.recruiterId !== userId) throw new Error("Unauthorized to update this job");

    // Ensure the department exists if provided
    if (args.departmentId) {
      const department = await ctx.db.get(args.departmentId);
      if (!department) throw new Error("Department not found");
    }

    // Ensure collaborators exist if provided
    if (args.collaborators) {
      for (const collaboratorId of args.collaborators) {
        const collaborator = await ctx.db.get(collaboratorId);
        if (!collaborator) throw new Error(`Collaborator ID ${collaboratorId} not found`);
      }
    }
    
    // Vérifier que les formulaires existent si fournis
    if (args.formIds) {
      for (const formId of args.formIds) {
        const form = await ctx.db.get(formId);
        if (!form) throw new Error(`Form ID ${formId} not found`);
      }
    }

    // Prepare the update object, excluding undefined values
    const updateData = {
      title: args.title,
      description: args.description,
      departmentId: args.departmentId,
      requirements: args.requirements,
      salaryRange: args.salaryRange,
      employmentType: args.employmentType,
      location: args.location,
      experienceLevel: args.experienceLevel,
      tags: args.tags,
      applicationDeadline: args.applicationDeadline,
      interviewProcess: args.interviewProcess,
      collaborators: args.collaborators,
      updatedAt: Date.now(),
    };

    // Filter out undefined values
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    // Update the job in the database
    await ctx.db.patch(args.jobId, filteredUpdateData);

    // Gérer la mise à jour des formulaires associés si fournis
    if (args.formIds) {
      // Supprimer les associations existantes
      const existingAssociations = await ctx.db
        .query("jobForms")
        .filter((q) => q.eq(q.field("jobId"), args.jobId))
        .collect();
      
      for (const association of existingAssociations) {
        await ctx.db.delete(association._id);
      }
      
      // Créer les nouvelles associations
      for (const formId of args.formIds) {
        await ctx.db.insert("jobForms", {
          jobId: args.jobId,
          formId,
        });
      }
    }

    return args.jobId;
  },
});
// Add a new experience level option
export const addExperienceLevelOption = mutation({
  args: { value: v.string(), label: v.string() },
  handler: async (ctx, { value, label }) => {
    await ctx.db.insert("experienceLevelOptions", { value, label });
  },
});

// Add a new employment type option
export const addEmploymentTypeOption = mutation({
  args: { value: v.string(), label: v.string() },
  handler: async (ctx, { value, label }) => {
    await ctx.db.insert("employmentTypeOptions", { value, label });
  },
});

export const deleteEmploymentTypeOption = mutation({
  args: { value: v.string() },
  handler: async (ctx, { value }) => {
    const option = await ctx.db
      .query("employmentTypeOptions")
      .filter((q) => q.eq("value", value))
      .first();
    if (option) {
      await ctx.db.delete(option._id); // Deletes the document
    }
  },
});


export const deleteExperienceLevelOption = mutation({
  args: { value: v.string() },
  handler: async (ctx, { value }) => {
    const option = await ctx.db.query("experienceLevelOptions").filter(q => q.eq("value", value)).first();
    if (option) {
      await ctx.db.delete(option._id);
    }
  },
});
export const updateJobStatus = mutation({
  args: {
    jobId: v.id("jobs"), // The ID of the job to update
    status: v.union(v.literal("Pending"), v.literal("Open"), v.literal("Closed")), // New status
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    // Ensure the job exists
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    // Ensure the recruiter is the owner of the job
    if (job.recruiterId !== userId) throw new Error("Unauthorized to update this job");

    // Update the job status
    await ctx.db.patch(args.jobId, { status: args.status });

    return args.jobId;
  },
});
export const closeExpiredJobs = mutation({
  handler: async (ctx) => {
    const jobs = await ctx.db.query("jobs").collect();

    const now = Date.now();
    for (const job of jobs) {
      if (job.applicationDeadline && job.applicationDeadline < now && job.status !== "Closed") {
        await ctx.db.patch(job._id, { status: "Closed" });
      }
    }
  },
});

export const addFormToJob = mutation({
  args: {
    jobId: v.id("jobs"), // ID du job
    formId: v.id("forms"), // ID du formulaire à associer
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("User not authenticated");

    // Vérifier que le job existe
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    // Vérifier que le formulaire existe
    const form = await ctx.db.get(args.formId);
    if (!form) throw new Error("Form not found");

    // Convertir les IDs en chaînes de caractères pour la comparaison
    const jobIdString = args.jobId.toString();
    const formIdString = args.formId.toString();

    // Vérifier que l'association n'existe pas déjà
    const existingAssociation = await ctx.db
      .query("jobForms")
      .filter((q) => q.eq("jobId", jobIdString) && q.eq("formId", formIdString))
      .first();

    if (existingAssociation) {
      throw new Error("This form is already associated with the job.");
    }

    // Insérer l'association dans la table de jointure
    await ctx.db.insert("jobForms", {
      jobId: args.jobId,
      formId: args.formId,
    });

    return args.jobId;
  },
});

