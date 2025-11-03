import { z } from "zod"

export const UserMetadataSchema = z.object({
    firstname: z.string().trim().min(1).max(100),
    lastname: z.string().trim().min(1).max(100),
    position: z.string().trim().min(1).max(100),
    company: z.string().trim().min(1).max(100),
    industry: z.string().trim().min(1).max(100),
    phone: z.string().trim().min(1), // Using basic string validation for now
    url: z.string().url().trim().max(255).optional().or(z.literal('')),
})


export type UserMetadataSchema = z.infer<typeof UserMetadataSchema>