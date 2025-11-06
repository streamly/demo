export interface UserProfile {
    givenName?: string
    familyName?: string
    email?: string
    phone?: string
    position?: string
    company?: string
    industry?: string
    website?: string
}

export interface UserData extends Required<Omit<UserProfile, 'website'>> {
    id: string
    website?: string
}