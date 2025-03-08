import { type Id } from "@convex/_generated/dataModel";

//  Type-safe version if you know the user shape
type UserDoc = {
    _id: Id<`users`>;
    _creationTime: number;
    name: string;
    email: string;
    password: string;
    role: `ADMIN` | `USER`;
    tokenVersion: number;
    // Add more fields as needed
};

export function sanitizeUser(user: UserDoc): Omit<UserDoc, `password`> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser;
}