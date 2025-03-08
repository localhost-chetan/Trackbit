import { defineSchema } from "convex/server";
import { userSchema } from "@convex/models/user"


export default defineSchema({
    users: userSchema,
})