import { v } from "convex/values";
import { internalMutation } from "@convex/_generated/server";
import { sanitizeUser } from "@convex/helpers/sanitizeUser";

export const createUser = internalMutation({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const role = args.email === `chetanseervi513@gmail.com` ? `ADMIN` : `USER`

        const _id = await ctx.db.insert(`users`, { ...args, role, tokenVersion: 0 })

        const existingUser = await ctx.db.get(_id)

        if (!existingUser) {
            return null
        }
        return sanitizeUser(existingUser)
    }
})


export const deleteUser = internalMutation({
    args: { _id: v.id(`users`) },
    handler: async (ctx, args) => {
        return await ctx.db.delete(args._id)
    }
})

export const updateUser = internalMutation({
    args: {
        _id: v.id(`users`),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { _id, ...updateFields } = args

        // Update the user in the database
        await ctx.db.patch(_id, updateFields);

        const updatedUser = await ctx.db.get(_id)

        if (!updatedUser) {
            return null
        }

        return sanitizeUser(updatedUser)
    }
})

export const deleteAllUsers = internalMutation({
    handler: async (ctx) => {
        const allUsers = await ctx.db.query(`users`).collect();

        allUsers.forEach(async (user) => await ctx.db.delete(user._id))
    }
})

export const revokeTokens = internalMutation({
    args: { _id: v.id(`users`) },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args._id)

        if (user) {
            await ctx.db.patch(args._id, { tokenVersion: user.tokenVersion + 1 })
        }
    }
})