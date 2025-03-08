import { type Id } from "@convex/_generated/dataModel";
import { type ActionCtx } from "@convex/_generated/server";
import { type HonoWithConvex } from "convex-helpers/server/hono";

type UserRole = `ADMIN` | `USER`

type JWTVariables = {
    sub: Id<`users`>;
    name: string;
    email: string;
    role: UserRole,
    tokenVersion: number,
    exp: number,
}

type APIResponse = {
    success: boolean;
    message: string;
    data?: object | Array
    errors?: object | Array
}

type HonoConvexApp = HonoWithConvex<ActionCtx>

type UpdateUser = {
    _id: Id<`users`>;
} & Partial<{ name: string; email: string; role: UserRole }>