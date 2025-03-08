import { jwt } from "hono/jwt"
import { getJWTTokenSecret } from "@config/JWTConfig"

export const JWTMiddleware = () => {
    return jwt({
        secret: getJWTTokenSecret()
    })
}
