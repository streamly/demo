import { z } from 'zod'

export const UserProfileDataSchema = z.object({
    givenName: z.string().trim().min(1).max(100),
    familyName: z.string().trim().min(1).max(100),
    position: z.string().trim().min(1).max(100),
    company: z.string().trim().min(1).max(100),
    industry: z.string().trim().min(1).max(100),
    phone: z.string().trim().min(1),
    website: z.url().trim().max(255).optional().or(z.literal('')),
})


export type UserProfileDataSchema = z.infer<typeof UserProfileDataSchema>