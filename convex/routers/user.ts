import { Hono } from "hono";
import { hash } from "bcryptjs";
import { isAdmin } from "@helpers/isAdmin";
import { internal } from "@convex/_generated/api";
import { HTTPException } from "hono/http-exception";
import { sanitizeUser } from "@helpers/sanitizeUser";
import { vValidator } from "@hono/valibot-validator";
import { type Id } from "@convex/_generated/dataModel";
import { JWTMiddleware } from "@helpers/JWTMiddleware";
import { getMyProfile } from "@controllers/user/getMyProfile";
import { adminUpdateUserSchema, signUpSchema, userUpdateSchema } from "@models/user";
import { type JWTVariables, type APIResponse, type HonoConvexApp, type UpdateUser } from "@config/types";

export const user: HonoConvexApp = new Hono()

// Public route (no middleware)
user.post(`/`, vValidator(`json`, signUpSchema), async (ctx) => {
    // parse the incoming request body
    const { name, email, password } = ctx.req.valid(`json`)

    // if validation succeeds, proceed with user creation logic (store in convex database)
    // check if the user already exists
    const targetUser = await ctx.env.runQuery(internal.collections.user.queries.findUserByEmailId, { email })

    if (targetUser) {
        throw new HTTPException(409, { message: `A user with this email (${email}) already exists` })   //conflict
    }

    // hash password with bcryptjs
    const hashedPassword = await hash(password, 10)

    // create new user
    const result = await ctx.env.runMutation(internal.collections.user.mutations.createUser, { name, email, password: hashedPassword })

    if (!result) {
        throw new HTTPException(500, { message: `Failed to create new user due to an internal error` }) //Will be caught by onError
    }

    const { _id, email: userEmail, role } = result

    return ctx.json<APIResponse>({
        success: true,
        data: {
            user: {
                _id, name, email: userEmail, role
            },
        },
        message: `User account created successfully`,
    })
})

// Private routes (With JWT Middleware)
user
    .use(`/*`, JWTMiddleware())

    .get(`/profile`, getMyProfile)

    // ADMIN only API endpoint
    .get(`/:id?`, async (ctx) => {
        const jwtPayload = ctx.get(`jwtPayload`) as JWTVariables
        isAdmin(jwtPayload)

        const id = ctx.req.param(`id`) as Id<`users`> || undefined
        if (id) {
            const targetUser = await ctx.env.runQuery(internal.collections.user.queries.findUserByID, { _id: id })

            if (!targetUser) {
                throw new HTTPException(404, { message: `user with ID ${id} not found` })  // Not found
            }

            return ctx.json<APIResponse>({
                success: true,
                data: targetUser,
                message: `User with ID ${id} retrieved successfully`
            })
        }

        const { limit, cursor } = ctx.req.query() // Get query params for the request

        // Default page size is 10 if limit is not provided
        const pageSize = limit ? parseInt(limit) : 10
        if (pageSize > 100 || pageSize < 1) {
            throw new HTTPException(400, { message: `Limit should be between 1 and 100` })  // Bad request
        }

        // If :id parameter is not provided
        const users = await ctx.env.runQuery(internal.collections.user.queries.getAllUsers, {
            paginationOptions: {
                cursor: cursor || null,
                numItems: pageSize,
            }
        })

        if (!users || users.page.length == 0) {
            throw new HTTPException(404, { message: `No users found in the database` })  // Not found
        }

        const returnData = {
            continueCursor: users.continueCursor,
            isDone: users.isDone,
            users: users.page.map(sanitizeUser),
            pageStatus: users.pageStatus,
            splitCursor: users.splitCursor
        }

        return ctx.json({ success: true, data: returnData, message: `Users data retrieved successfully` })
    })

    // ADMIN only API endpoint
    .put(`/:id`, vValidator(`json`, adminUpdateUserSchema), async (ctx) => {
        const id = ctx.req.param(`id`) as Id<`users`>

        // Validate and get the update data from request body
        const updateFields = ctx.req.valid(`json`);

        if (Object.keys(updateFields).length === 0) {
            throw new HTTPException(400, { message: `No valid update data provided` })  // Bad request
        }

        // Prepare the update object with only the fields that were provided
        const jwtPayload = ctx.get(`jwtPayload`) as JWTVariables
        const updateData: UpdateUser = { _id: jwtPayload.sub };

        if (id && isAdmin(jwtPayload)) {
            if (updateFields.name) updateData.name = updateFields.name;
            if (updateFields.email) updateData.email = updateFields.email;

            const targetUser = await ctx.env.runQuery(internal.collections.user.queries.findUserByID, { _id: id })

            if (!targetUser) {
                throw new HTTPException(404, { message: `User with id ${id} not found` })
            }

            if (updateFields.role) updateData.role = updateFields.role;

            // Perform the update
            const updatedUser = await ctx.env.runMutation(internal.collections.user.mutations.updateUser, { ...updateData, _id: id })

            return ctx.json<APIResponse>({
                success: true,
                data: {
                    user: {
                        ...updatedUser
                    }
                },
                message: `User with ID ${id} updated successfully`,
            })
        }

        throw new HTTPException(400, { message: `User ID is required` })  // Bad request
    })

    .put(`/profile`, vValidator(`json`, userUpdateSchema), async (ctx) => {
        // Validate and get the update data from request body
        const updateFields = ctx.req.valid(`json`);

        if (Object.keys(updateFields).length === 0) {
            throw new HTTPException(400, { message: `No valid update data provided` })  // Bad request
        }

        const jwtPayload = ctx.get(`jwtPayload`) as JWTVariables

        const updateData: UpdateUser = { _id: jwtPayload.sub };

        if (updateFields.name) updateData.name = updateFields.name;
        if (updateFields.email) updateData.email = updateFields.email;

        const targetUser = await ctx.env.runQuery(internal.collections.user.queries.findUserByID, { _id: jwtPayload.sub })

        if (!targetUser) {
            throw new HTTPException(404, { message: `User with id ${jwtPayload.sub} not found` })
        }

        // Perform the update
        const updatedUser = await ctx.env.runMutation(internal.collections.user.mutations.updateUser, { ...updateData, _id: jwtPayload.sub })

        return ctx.json<APIResponse>({
            success: true,
            data: {
                user: {
                    ...updatedUser
                }
            },
            message: `User with ID ${jwtPayload.sub} updated successfully`,
        })
    })

    // ADMIN only API endpoint
    .delete(`/:id?`, async (ctx) => {
        const jwtPayload = ctx.get(`jwtPayload`) as JWTVariables
        isAdmin(jwtPayload)

        const id = ctx.req.param(`id`) as Id<`users`> || undefined

        if (id) {
            // check if the user with passed id exists or not
            const data = await ctx.env.runQuery(internal.collections.user.queries.findUserByID, { _id: id })

            if (!data) {
                throw new HTTPException(404, { message: `User with ID ${id} not found` })
            }

            await ctx.env.runMutation(internal.collections.user.mutations.deleteUser, { _id: id })

            return ctx.json<APIResponse>({
                success: true,
                message: `User with ID ${id} deleted successfully`
            })
        }

        // Delete all the users
        await ctx.env.runMutation(internal.collections.user.mutations.deleteAllUsers)

        return ctx.json<APIResponse>({
            success: true,
            message: `Successfully deleted all users from the database.`
        })
    })

    .delete(`/profile`, async (ctx) => {
        const jwtPayload = ctx.get(`jwtPayload`) as JWTVariables

        await ctx.env.runMutation(internal.collections.user.mutations.deleteUser, { _id: jwtPayload.sub })

        return ctx.json<APIResponse>({
            success: true,
            message: `Your account has been deleted successfully`
        })
    })