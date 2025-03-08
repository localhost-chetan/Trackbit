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
import type * as collections_user_mutations from "../collections/user/mutations.js";
import type * as collections_user_queries from "../collections/user/queries.js";
import type * as config_JWTConfig from "../config/JWTConfig.js";
import type * as controllers_user_getMyProfile from "../controllers/user/getMyProfile.js";
import type * as helpers_generateTokens from "../helpers/generateTokens.js";
import type * as helpers_isAdmin from "../helpers/isAdmin.js";
import type * as helpers_JWTMiddleware from "../helpers/JWTMiddleware.js";
import type * as helpers_sanitizeUser from "../helpers/sanitizeUser.js";
import type * as http from "../http.js";
import type * as models_user from "../models/user.js";
import type * as routers_auth from "../routers/auth.js";
import type * as routers_user from "../routers/user.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "collections/user/mutations": typeof collections_user_mutations;
  "collections/user/queries": typeof collections_user_queries;
  "config/JWTConfig": typeof config_JWTConfig;
  "controllers/user/getMyProfile": typeof controllers_user_getMyProfile;
  "helpers/generateTokens": typeof helpers_generateTokens;
  "helpers/isAdmin": typeof helpers_isAdmin;
  "helpers/JWTMiddleware": typeof helpers_JWTMiddleware;
  "helpers/sanitizeUser": typeof helpers_sanitizeUser;
  http: typeof http;
  "models/user": typeof models_user;
  "routers/auth": typeof routers_auth;
  "routers/user": typeof routers_user;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
