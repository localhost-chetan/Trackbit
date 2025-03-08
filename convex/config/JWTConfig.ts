export const getJWTTokenSecret = () => {
    const JWT_TOKEN_SECRET_KEY = process.env.JWT_TOKEN_SECRET_KEY

    if (!JWT_TOKEN_SECRET_KEY) {
        throw new Error(`JWT_ACCESS_TOKEN_SECRET environment variable not defined in convex dashboard. Set it using bun x convex env set JWT_ACCESS_TOKEN_SECRET <JWT Access Token Secret> command`)
    }

    return JWT_TOKEN_SECRET_KEY;
}