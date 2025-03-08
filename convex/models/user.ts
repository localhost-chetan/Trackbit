import { v } from "convex/values";
import * as valibot from "valibot"
import { defineTable } from "convex/server";

export const userSchema = defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    tokenVersion: v.number(),
    role: v.union(v.literal(`USER`), v.literal(`ADMIN`))
}).index(`email`, ["email"])


// Reusable Valibot field definitions
const nameField = valibot.pipe(
    valibot.string(),
    valibot.minLength(2, `Name must be at least 2 characters`),
    valibot.maxLength(35, `Name must be less than 35 characters`)
);

const emailField = valibot.pipe(
    valibot.string(),
    valibot.email(`Invalid email format`)
);

const passwordField = valibot.pipe(
    valibot.string(),
    valibot.minLength(8, `Password must be at least 8 characters long`),
    valibot.maxLength(25, `Password must be less than 25 characters`)
);

const roleField = valibot.union(
    [valibot.literal(`USER`), valibot.literal(`ADMIN`)],
    `Role must be either 'USER' or 'ADMIN'`
)

const authFields = {
    email: valibot.nonOptional(emailField, `Email is required`),
    password: valibot.nonOptional(passwordField, `Password is required`),
}

// Compose schemas using the reusable fields
export const signUpSchema = valibot.object({
    ...authFields,
    name: valibot.nonOptional(nameField, `Name is required`),
});

export const loginSchema = valibot.object(authFields);

const updateUserFields = {
    name: valibot.optional(nameField),
    email: valibot.optional(emailField),
};

export const adminUpdateUserSchema = valibot.object({ ...updateUserFields, role: valibot.optional(roleField) });
export const userUpdateSchema = valibot.object(updateUserFields);

// Infer TypeScript types
export type SignUpData = valibot.InferOutput<typeof signUpSchema>;
export type LoginData = valibot.InferOutput<typeof loginSchema>;