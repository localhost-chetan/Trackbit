/**
 * This module sets up the HTTP server using the Hono framework and defines the routes for the application.
 * It includes middleware for logging and connects the routes to Convex HTTP actions.
 * 
 * @module http
 * 
 * @requires hono
 * @requires hono/logger
 * @requires @routers/user
 * @requires @routers/login
 * @requires @config/type
 * @requires convex-helpers/server/hono
 * 
 * @typedef {HonoConvexApp} HonoConvexApp - The type representing the Hono application with Convex integration.
 * 
 * @constant {HonoConvexApp} app - The Hono application instance.
 * 
 * @function app.use - Middleware to log HTTP requests.
 * 
 * @function app.route - Defines the routes for login and user management.
 * 
 * @exports HttpRouterWithHono - The router that connects Hono routes to Convex HTTP actions.
 */

import { Hono } from "hono"
import * as v from "valibot"
import { logger } from "hono/logger"
import { user } from "@routers/user"
import { auth } from "@routers/auth"
import { HTTPException } from "hono/http-exception"
import { HttpRouterWithHono } from "convex-helpers/server/hono"
import { type APIResponse, type HonoConvexApp } from "@convex/config/types"

const app: HonoConvexApp = new Hono()

app.use(logger())

// Define routes
app.route(`/api/v1/auth`, auth)
app.route(`/api/v1/users`, user)


// Centralized error handler with HTTPException support
app.onError((error, ctx) => {
    if (error instanceof HTTPException) {
        // Handle HTTP-specific errors
        return ctx.json<APIResponse>({
            success: false,
            message: error.message || `An unexpected error occurred`,
        }, error.status);
    } else if (v.isValiError(error)) {
        // Handle Valibot validation errors
        return ctx.json<APIResponse>({
            success: false,
            message: `Request validation failed`,
            errors: v.flatten(error.issues),
        }, 400);
    } else if (error instanceof Error) {
        // Handle generic errors
        return ctx.json<APIResponse>({
            success: false,
            message: error.message || `An internal server error occured`,
        }, 500);
    }

    // Handle unexpected errors
    return ctx.json<APIResponse>({
        success: false,
        message: `An unexpected server error occured`,
    }, 500);
});

// eslint-disable-next-line import/no-anonymous-default-export
export default new HttpRouterWithHono(app)  // HTTPRouterWithHono connects Hono routes to Convex HTTP actions.
