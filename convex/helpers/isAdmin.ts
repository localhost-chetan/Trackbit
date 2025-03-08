import { JWTVariables } from "@convex/config/types";
import { HTTPException } from "hono/http-exception";

/**
 * Checks if the user has admin privileges based on the JWT payload.
 *
 * @param {JWTVariables} jwtPayload - The JWT payload containing user information.
 * @throws {HTTPException} Throws a 403 HTTPException if the user does not have admin privileges.
 * @returns {boolean} Returns true if the user has admin privileges.
 */
export const isAdmin = (jwtPayload: JWTVariables) => {
    if (jwtPayload.role !== `ADMIN`) {
        throw new HTTPException(403, { message: `Access denied: Admin privileges required` })   //Forbidden
    }

    return true
}