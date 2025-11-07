export interface UserProfileInput {
    givenName?: string | null
    familyName?: string | null
    email?: string | null
    phone?: string | null
    position?: string | null
    company?: string | null
    industry?: string | null
    website?: string | null
}

export interface UserProfile extends UserProfileInput {
    id: string
}