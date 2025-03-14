import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  // --- Users Table ---
  users: defineTable({
    name: v.optional(v.string()),
    status: v.optional(v.string()),

    image: v.optional(v.string()),
    email: v.string(),
    emailVerificationTime: v.optional(v.float64()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.float64()),
    roleId: v.optional(v.string()),
    lastLogin: v.optional(v.float64()),
    isBlocked: v.optional(v.boolean()), // ✅ Ajout du champ pour bloquer/débloquer un utilisateur
    departmentId: v.optional(v.id("departments")),  // Linking user to a department
  }).index("email", ["email"]),

  // --- Roles Table ---
  roles: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    permissions: v.array(v.id("permissions")),
  }).index("name", ["name"]),

  // --- Permissions Table ---
  permissions: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    assignedRoles: v.array(v.id("roles")),
  }),

  // --- Departments Table ---
  departments: defineTable({
    name: v.string(),                   // Department name (e.g., "HR", "Engineering")
    description: v.optional(v.string()), // Brief description of the department
    headId: v.optional(v.id("users")),  // User ID of the department head
    createdAt: v.float64(),             // Timestamp for department creation
  }).index("name", ["name"]),

// --- Jobs Table (Posted by Recruiters) ---
jobs: defineTable({
  title: v.string(),                      // Job title
  description: v.string(),                 // Job description
  recruiterId: v.id("users"),              // Recruiter who posted the job
  departmentId: v.optional(v.id("departments")), // Associated department
  requirements: v.optional(v.string()),    // Job requirements
  salaryRange: v.optional(v.string()),     // Salary range (e.g., "50k-70k/year")
  employmentType: v.optional(v.string()),  // Full-time, part-time, contract, internship
  location: v.optional(v.string()),        // Work location or remote option
  experienceLevel: v.optional(v.string()), // Entry, mid, senior level
  tags: v.optional(v.array(v.string())),   // Keywords for filtering
  applicationDeadline: v.optional(v.float64()), // Deadline for applications
  interviewProcess: v.optional(v.string()), // Ensure interviewProcess is included
  updatedAt: v.optional(v.float64()), // Track last modification time
  collaborators: v.optional(v.array(v.id("users"))), // List of users collaborating on the job post
  status: v.union(
    v.literal("Pending"),
    v.literal("Open"),
    v.literal("Closed")
  ), // Job status
})
  .index("title", ["title"])
  .index("departmentId", ["departmentId"]) // Index for filtering jobs by department
  .index("recruiterId", ["recruiterId"]) // Index for filtering jobs by recruiter
  .index("collaborators", ["collaborators"]), // Index for searching jobs by collaborators

  // --- Offers Table (Applications submitted by candidates) ---
  offers: defineTable({
    jobId: v.id("jobs"),                     // Référence à l'offre d'emploi
    candidateId: v.id("users"),              // Le candidat qui a postulé
    coverLetter: v.optional(v.string()),     // Lettre de motivation
    resume: v.optional(v.string()), 
    notes: v.optional(v.string()),          
    status: v.string(),                      // Pending, Interview, Accepted, Rejected, etc.
    appliedAt: v.float64(),                  // Date de candidature
    reviewedAt: v.optional(v.float64()),     // Date de révision
    recruiterNotes: v.optional(v.string()),  // Notes du recruteur
    updatedAt: v.optional(v.float64()),  
    score: v.optional(v.number()), 
    reportPdf: v.optional(v.string()), 

  }).index("jobId", ["jobId"])
    .index("candidateId", ["candidateId"]),
  
    experienceLevelOptions: defineTable({
      value: v.string(),
      label: v.string(),
    }).index("value", ["value"]),
  
    // --- Employment Type Options Table ---
    employmentTypeOptions: defineTable({
      value: v.string(),
      label: v.string(),
    }).index("value", ["value"]),

  // --- Forms Table ---
  forms: defineTable({
    title: v.string(),
    description: v.string(),
    createdAt: v.float64(),
    updatedAt: v.optional(v.float64()),
    createdBy: v.id("users"), // L'utilisateur qui a créé le formulaire
  }).index("createdBy", ["createdBy"]),

  // --- Questions Table ---
  questions: defineTable({
    formId: v.id("forms"), // Référence au formulaire
    text: v.string(), // Le texte de la question
    type: v.union(
      v.literal("single-choice"),
      v.literal("multiple-choice"),
      v.literal("open-ended")
    ), // Le type de question
    options: v.optional(v.array(v.string())), // Les options pour les questions à choix
    answer: v.optional(v.union(v.string(), v.array(v.string()))), // La réponse (texte ou tableau d'options sélectionnées)
  }).index("formId", ["formId"]),
// Dans votre fichier schema.ts
responses: defineTable({
  formId: v.id("forms"), // Référence au formulaire
  questionId: v.string(), // Référence à la question
  answer: v.union(v.string(), v.array(v.string())), // Réponse (texte ou tableau d'options)
  userId: v.id("users"), // Référence à l'utilisateur
  submittedAt: v.float64(), // Date de soumission
}).index("formId", ["formId"])
.index("userId", ["userId"]), // Add this line to define an index on userId,

// Dans votre fichier schema.ts
jobForms: defineTable({
  jobId: v.id("jobs"), // Référence au job
  formId: v.id("forms"), // Référence au formulaire
}).index("jobId", ["jobId"]) // Index pour rechercher les formulaires par jobId
  .index("formId", ["formId"]),
  
  
 // --- UserForms Table ---
userForms: defineTable({
  userId: v.id("users"), // Référence à l'utilisateur
  formId: v.id("forms"), // Référence au formulaire
  jobId: v.id("jobs"), // Référence au job (nouvel attribut)
  assignedAt: v.float64(), // Date d'assignation
  completed: v.boolean(), // Indique si le formulaire est complété
})
  .index("userId", ["userId"]) // Index pour rechercher les formulaires par utilisateur
  .index("formId", ["formId"]) // Index pour rechercher les formulaires par formulaire
  .index("userId_formId", ["userId", "formId"]) // Index composite pour rechercher par userId et formId
  .index("completed", ["completed"]) // Index pour rechercher par statut de complétion
  .index("jobId", ["jobId"]), // Nouvel index pour rechercher par jobId
    
  meetings: defineTable({
    title: v.string(), // Titre de la réunion
    description: v.optional(v.string()), // Description de la réunion
    type: v.union(v.literal("online"), v.literal("in-person")), // Type de réunion
    meetingLink: v.optional(v.string()), // Lien de la réunion (si en ligne)
    date: v.number(), // Date de la réunion (timestamp)
    startTime: v.number(), // Heure de début (timestamp)
    organizerId: v.id("users"), // ID de l'organisateur
    participantId: v.id("users"), // ID du participant (un seul participant)
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("canceled")
    ), // Statut de la réunion
  })
    .index("organizerId", ["organizerId"])
    .index("startTime", ["startTime"])
    .index("date", ["date"]), // Index pour la date
    
    invitations: defineTable({
      email: v.string(),
      departmentId: v.id("departments"),
      status: v.union(v.literal("pending"), v.literal("completed"), v.literal("expired")),
    }).index("by_email", ["email"]), // Index pour rechercher par e-mail
    
    messages: defineTable({
      senderId: v.id("users"), // ID de l'expéditeur
      receiverId: v.id("users"), // ID du destinataire
      content: v.string(), // Contenu du message
      timestamp: v.number(), // Timestamp du message
      status: v.union(v.literal("sent"), v.literal("delivered"), v.literal("read")), // Statut du message
      type: v.union(v.literal("text"), v.literal("image"), v.literal("file")), // Type de message
    })
    .index("by_sender", ["senderId"]) // Index pour rechercher par expéditeur
    .index("by_receiver", ["receiverId"]) // Index pour rechercher par destinataire
    .index("by_timestamp", ["timestamp"]), // Index pour trier par timestamp
    
    });




export default schema;
