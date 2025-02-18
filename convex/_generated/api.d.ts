/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as files from "../files.js";
import type * as functions_setup from "../functions/setup.js";
import type * as http from "../http.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as mutations_departments from "../mutations/departments.js";
import type * as mutations_jobs from "../mutations/jobs.js";
import type * as mutations_offers from "../mutations/offers.js";
import type * as mutations_permissions from "../mutations/permissions.js";
import type * as mutations_roles from "../mutations/roles.js";
import type * as mutations_user from "../mutations/user.js";
import type * as queries_departments from "../queries/departments.js";
import type * as queries_jobs from "../queries/jobs.js";
import type * as queries_permissions from "../queries/permissions.js";
import type * as queries_roles from "../queries/roles.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  files: typeof files;
  "functions/setup": typeof functions_setup;
  http: typeof http;
  "lib/permissions": typeof lib_permissions;
  "mutations/departments": typeof mutations_departments;
  "mutations/jobs": typeof mutations_jobs;
  "mutations/offers": typeof mutations_offers;
  "mutations/permissions": typeof mutations_permissions;
  "mutations/roles": typeof mutations_roles;
  "mutations/user": typeof mutations_user;
  "queries/departments": typeof queries_departments;
  "queries/jobs": typeof queries_jobs;
  "queries/permissions": typeof queries_permissions;
  "queries/roles": typeof queries_roles;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
