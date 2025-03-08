import { type Handler } from "hono";
import { type APIResponse, type JWTVariables } from "@convex/config/types";

export const getMyProfile: Handler = (ctx) => {
    const { sub: _id, exp, ...restPayloadClaims } = ctx.get(`jwtPayload`) as JWTVariables
    console.log("🚀 ~ .get /api/v1/users/me ~ exp:", exp);

    const userData = {
        _id,
        ...restPayloadClaims
    }

    return ctx.json<APIResponse>({
        success: true,
        data: userData,
        message: `User profile retrieved successfully`
    })
}