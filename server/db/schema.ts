import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"


const timestamps = {
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}


export const user = pgTable("user", {
    id: varchar("id", { length: 36 }).primaryKey(),   // match Authgear user_id if needed
    givenName: text("given_name"),
    familyName: text("family_name"),
    email: text("email"),
    phone: text("phone"),
    position: text("position"),
    company: text("company"),
    industry: text("industry"),
    url: text("url"),
    ...timestamp
})

