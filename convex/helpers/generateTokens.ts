import { sign } from "hono/jwt";
import { type Id } from "@convex/_generated/dataModel";
import { type JWTVariables, type UserRole } from "@convex/config/types";

export const generateTokens = async (
    _id: Id<`users`>,
    name: string,
    email: string,
    role: UserRole = `USER`,
    tokenVersion: number = 0,
    secret: string = `default-secret`,
) => {
    const CURRENT_TIME_IN_SECONDS = Math.floor(Date.now() / 1000)
    const ACCESS_TOKEN_EXPIRY = CURRENT_TIME_IN_SECONDS + (60 * 60) * 1   // 1 hour
    const REFRESH_TOKEN_EXPIRY = CURRENT_TIME_IN_SECONDS + (60 * 60) * 24 * 7   // 1 week

    // Access token payload
    const accessTtokenPayload: JWTVariables = {
        sub: _id,
        name,
        email,
        role,
        tokenVersion,
        exp: ACCESS_TOKEN_EXPIRY,     // Token will expire in 2 hours
        /* Date.now() returns the current time in milliseconds since the Unix epoch.
           Math.floor(Date.now() / 1000) converts it to seconds (JWT expects seconds, not milliseconds).
           + 60 * 60 adds 3,600 seconds (1 hour) to the current time, setting the token to expire in 1 hour.

           When JWTMiddleware (using hono/jwt) verifies the token, it:
           Decodes the JWT and extracts the exp claim.
           Compares it to the current time in seconds.
           If current time < exp, the token is valid. If current time >= exp, it’s expired.
        */
    };

    const refreshTokenPayload = {
        sub: _id,
        type: "refresh",
        ver: tokenVersion,
        exp: REFRESH_TOKEN_EXPIRY,     // Token will expire in 1 week
    }

    const accessToken = await sign(accessTtokenPayload, secret);
    const refreshToken = await sign(refreshTokenPayload, secret);

    return { accessToken, refreshToken };
}