import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  // --- Users Table ---
  users: defineTable({
    name: v.optional(v.string()),
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
    jobId: v.id("jobs"),                     // Reference to the job the candidate applied for
    candidateId: v.id("users"),              // The candidate who applied
    coverLetter: v.optional(v.string()),     // Cover letter text
    status: v.string(),                      // Pending, Interview, Accepted, Rejected, etc.
    appliedAt: v.float64(),                  // Timestamp when the application was submitted
    reviewedAt: v.optional(v.float64()),     // Timestamp when the application was reviewed
    recruiterNotes: v.optional(v.string()),
    updatedAt: v.optional(v.float64()), // Track status updates
    // Notes from recruiter about the application
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

});

export default schema;
