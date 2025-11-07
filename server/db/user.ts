import { UserProfile } from '@/shared/types/user'
import { db } from './connection'
import * as schema from './schema'


export async function upsertUser(user: UserProfile) {
    return db
        .insert(schema.users)
        .values(user)
        .onConflictDoUpdate({
            target: schema.users.id,
            set: {
                givenName: user.givenName,
                familyName: user.familyName,
                email: user.email,
                phone: user.phone,
                position: user.position,
                company: user.company,
                industry: user.industry,
                website: user.website,
            },
        })
        .returning()
}