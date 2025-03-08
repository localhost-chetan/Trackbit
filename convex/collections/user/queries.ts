import { v } from "convex/values"
import { paginationOptsValidator } from "convex/server"
import { internalQuery } from "@convex/_generated/server"
import { sanitizeUser } from "@convex/helpers/sanitizeUser"

export const getAllUsers = internalQuery({
    args: { paginationOptions: paginationOptsValidator },

    handler: async (ctx, args) => {
        const results = await ctx.db
            .query(`users`)
            .paginate(args.paginationOptions)

        return results
    }
})

export const findUserByEmailId = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query(`users`)
            .withIndex(`email`, (query) => query.eq(`email`, args.email))
            .first()

        if (!user) return null

        return sanitizeUser(user);
    }
})

export const findUserByID = internalQuery({
    args: { _id: v.id(`users`) },

    handler: async (ctx, args) => {
        const user = await ctx.db.get(args._id)

        if (!user) return null

        return sanitizeUser(user)
    }
})

export const getUserPassword = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        // const user =await ctx.runQuery(internal.controllers.user.queries.findUserByEmailId, { email: args.email })
        const user = await ctx.db
            .query(`users`)
            .withIndex(`email`, (query) => query.eq(`email`, args.email))
            .first()

        if (!user) return null

        return user
    }
})