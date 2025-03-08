import { Hono } from "hono";
import { compare } from "bcryptjs";
import { loginSchema } from "@convex/models/user";
import { internal } from "@convex/_generated/api";
import { HTTPException } from "hono/http-exception";
import { vValidator } from "@hono/valibot-validator";
import { getJWTTokenSecret } from "@config/JWTConfig";
import { generateTokens } from "@convex/helpers/generateTokens";
import { type HonoConvexApp, type APIResponse } from "@convex/config/types";

export const auth: HonoConvexApp = new Hono()

auth
    .post(`/login`, vValidator(`json`, loginSchema), async (ctx) => {
        const { email, password } = ctx.req.valid(`json`);

        // Check if user exists
        const existingUser = await ctx.env.runQuery(internal.collections.user.queries.getUserPassword, { email });

        if (!existingUser) {
            throw new HTTPException(404, { message: `No user found with ${email}` });
        }

        // Verify password
        const isPasswordValid = await compare(password, existingUser.password);

        if (!isPasswordValid) {
            throw new HTTPException(401, { message: `Invalid password` });
        }

        const { accessToken, refreshToken } = await generateTokens(existingUser._id, existingUser.name, existingUser.email, existingUser.role, existingUser.tokenVersion, getJWTTokenSecret());

        return ctx.json<APIResponse>({
            success: true,
            data: {
                user: {
                    _id: existingUser._id,
                    email: existingUser.email,
                    loginType: `email-password`
                },
                accessToken,
                refreshToken
            },
            message: `Login successful`,
        });
    });