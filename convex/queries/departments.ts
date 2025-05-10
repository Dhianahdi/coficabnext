import { v } from "convex/values";
import { query } from "../_generated/server";

export const getDepartments = query(async ({ db }) => {
  return await db.query("departments").collect();
});

export const getDepartmentById = query({
  args: { id: v.id("departments") },
  handler: async ({ db }, { id }) => {
    return await db.get(id);
  },
});

export const getUserDepartment = query({
  args: { userId: v.id("users") },
  handler: async ({ db }, { userId }) => {
    const user = await db.get(userId);
    if (!user || !user.departmentId) return null;
    return await db.get(user.departmentId);
  },
});