import jwt, { type JwtPayload } from "jsonwebtoken"
import jwksClient from "jwks-rsa"
import axios from "axios"
import { createSign } from "crypto"

const AUTHGEAR_ENDPOINT = process.env.NEXT_PUBLIC_AUTHGEAR_ENDPOINT as string
const AUTHGEAR_ADMIN_KEY_ID = process.env.AUTHGEAR_ADMIN_KEY_ID as string
const AUTHGEAR_ADMIN_PRIVATE_KEY_PEM = process.env.AUTHGEAR_ADMIN_PRIVATE_KEY_PEM
const AUTHGEAR_PROJECT_ID = process.env.AUTHGEAR_PROJECT_ID as string
const AUTHGEAR_ADMIN_GRAPHQL_ENDPOINT = process.env.AUTHGEAR_ADMIN_GRAPHQL_ENDPOINT as string

let cachedIssuer: string | null = null
let cachedClient: ReturnType<typeof jwksClient> | null = null

async function getDiscovery() {
    const res = await fetch(`${AUTHGEAR_ENDPOINT}/.well-known/openid-configuration`)
    if (!res.ok) throw new Error("Failed to fetch OIDC discovery")
    return res.json() as Promise<{ issuer: string; jwks_uri: string }>
}

async function getJwksClient() {
    if (cachedClient && cachedIssuer) return { client: cachedClient, issuer: cachedIssuer }
    const { issuer, jwks_uri } = await getDiscovery()
    cachedIssuer = issuer
    cachedClient = jwksClient({ jwksUri: jwks_uri })
    return { client: cachedClient, issuer: cachedIssuer }
}

function getKeyFromJwks(client: ReturnType<typeof jwksClient>) {
    return (header: any, callback: (err: Error | null, key?: string) => void) => {
        client.getSigningKey(header.kid, (err, key) => {
            if (err) return callback(err)
            callback(null, key?.getPublicKey())
        })
    }
}

export class AuthgearError extends Error {
    code: string
    constructor(code: string, message?: string) {
        super(message || code)
        this.name = "AuthgearError"
        this.code = code
    }
}

export async function verifyAuthgearUser(authHeader?: string): Promise<JwtPayload> {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AuthgearError("NO_TOKEN", "Missing or invalid Authorization header")
    }
    const token = authHeader.slice("Bearer ".length).trim()

    const { client, issuer } = await getJwksClient()
    const getKey = getKeyFromJwks(client)

    try {
        const payload = await new Promise<JwtPayload>((resolve, reject) => {
            jwt.verify(
                token,
                getKey,
                { algorithms: ["RS256"], issuer },
                (err, decoded) => {
                    if (err) {
                        if (err.name === "TokenExpiredError") reject(new AuthgearError("EXPIRED_TOKEN", "Authgear token expired"))
                        else reject(new AuthgearError("INVALID_TOKEN", "Authgear token invalid"))
                        return
                    }
                    resolve(decoded as JwtPayload)
                }
            )
        })
        return payload
    } catch (e) {
        if (e instanceof AuthgearError) throw e
        throw new AuthgearError("INVALID_TOKEN", "Authgear verification failed")
    }
}

// Helper function to get user info from Authgear
export async function getUserInfoFromAuthgear(token: string) {
    try {
        const response = await fetch(`${AUTHGEAR_ENDPOINT}/oauth2/userinfo`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        if (!response.ok) {
            throw new AuthgearError("USERINFO_FAILED", "Failed to fetch user info from Authgear")
        }

        return await response.json()
    } catch (error) {
        console.error('Failed to fetch user info from Authgear:', error)
        throw new AuthgearError("USERINFO_FAILED", "Failed to fetch user info from Authgear")
    }
}

// ==================== ADMIN API FUNCTIONS ====================

interface AuthgearUser {
    id: string
    standardAttributes: {
        email: string
        given_name: string
        family_name: string
        website: string
    }
    customAttributes: {
        industry: string
        position: string
        company: string
        phone: string
    }
}

interface UserAttributes {
    standardAttributes: Record<string, any>
    customAttributes: Record<string, any>
}

let cachedAdminToken: { token: string; expiresAt: number } | null = null

function toBase64Url(input: Buffer | string): string {
    const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input)
    return buffer
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
}

function loadAdminPrivateKey(): string {
    if (!AUTHGEAR_ADMIN_PRIVATE_KEY_PEM)
        throw new Error("AUTHGEAR_ADMIN_PRIVATE_KEY_PEM is not configured")

    return AUTHGEAR_ADMIN_PRIVATE_KEY_PEM.replace(/\\n/g, "\n").trim()
}

function generateAdminJwt(): string {
    if (!AUTHGEAR_PROJECT_ID || !AUTHGEAR_ADMIN_KEY_ID)
        throw new Error("Authgear Admin key or project ID missing")

    const privateKey = loadAdminPrivateKey()
    const now = Math.floor(Date.now() / 1000)
    const exp = now + 5 * 60 // valid for 5 min

    const header = { alg: "RS256", typ: "JWT", kid: AUTHGEAR_ADMIN_KEY_ID }
    const payload = { aud: [AUTHGEAR_PROJECT_ID], iat: now, exp }

    const signingInput = `${toBase64Url(JSON.stringify(header))}.${toBase64Url(JSON.stringify(payload))}`
    const signature = createSign("RSA-SHA256").update(signingInput).sign(privateKey)
    const token = `${signingInput}.${toBase64Url(signature)}`

    cachedAdminToken = { token, expiresAt: exp }
    return token
}

function getAdminJwt(): string {
    const now = Math.floor(Date.now() / 1000)
    if (cachedAdminToken && cachedAdminToken.expiresAt - 30 > now) {
        return cachedAdminToken.token
    }
    return generateAdminJwt()
}

export async function authgearAdminRequest<T>(
    query: string,
    variables?: Record<string, any>
): Promise<T> {
    try {
        const res = await axios.post(
            AUTHGEAR_ADMIN_GRAPHQL_ENDPOINT,
            { query, variables },
            {
                headers: {
                    Authorization: `Bearer ${getAdminJwt()}`,
                    "Content-Type": "application/json",
                },
            }
        )

        if (res.data.errors?.length) {
            throw new Error(`GraphQL Error: ${JSON.stringify(res.data.errors)}`)
        }

        return res.data.data as T
    } catch (err: any) {
        const msg = err.response?.data || err.message
        throw new Error(`Authgear Admin request failed: ${JSON.stringify(msg)}`)
    }
}

export async function fetchUserById(userId: string): Promise<AuthgearUser | null> {
    const nodeId = Buffer.from(`User:${userId}`).toString('base64url')

    const query = `
    query ($id: ID!) {
      node(id: $id) {
        id
        ... on User {
          standardAttributes
          customAttributes
        }
      }
    }
    `

    const data = await authgearAdminRequest<{ node?: AuthgearUser }>(query, { id: nodeId })

    return data.node ?? null
}

export async function pushUserAttributes(userId: string, attributes: UserAttributes) {
    const mutation = `
    mutation UpdateUser(
      $userID: ID!
      $standardAttributes: UserStandardAttributes
      $customAttributes: UserCustomAttributes
    ) {
      updateUser(
        input: {
          userID: $userID
          standardAttributes: $standardAttributes
          customAttributes: $customAttributes
        }
      ) {
        user { id }
      }
    }
  `

    const data = await authgearAdminRequest<{ updateUser: { user: any } }>(mutation, {
        userID: userId,
        standardAttributes: attributes.standardAttributes,
        customAttributes: attributes.customAttributes,
    })

    return data.updateUser?.user || null
}

interface UserMetadataUpdates {
    firstname?: string
    lastname?: string
    position?: string
    company?: string
    industry?: string
    phone?: string
    url?: string
}

export async function updateUserMetadata(userId: string, updates: UserMetadataUpdates) {
    const user = await fetchUserById(userId)

    if (!user) {
        throw new Error('User not found')
    }

    console.log('User for update', user, updates)
    try {
        const standardAttributes = {
            ...user.standardAttributes,
            given_name: updates.firstname ?? user.standardAttributes?.given_name ?? "",
            family_name: updates.lastname ?? user.standardAttributes?.family_name ?? "",
        }

        // Only include website if it's a valid URL
        if (updates.url && updates.url.trim() !== '') {
            standardAttributes.website = updates.url
        } else if (user.standardAttributes?.website) {
            // Keep existing website if no new one provided
            standardAttributes.website = user.standardAttributes.website
        }

        const customAttributes = {
            ...user.customAttributes,
            industry: updates.industry ?? user.customAttributes?.industry ?? "",
            position: updates.position ?? user.customAttributes?.position ?? "",
            company: updates.company ?? user.customAttributes?.company ?? "",
            phone: updates.phone ?? user.customAttributes?.phone ?? ""
        }

        const attributes = { standardAttributes, customAttributes }

        return await pushUserAttributes(user.id, attributes)
    } catch (err: any) {
        const msg = err.response?.data || err.message
        throw new Error(`Authgear metadata update failed: ${JSON.stringify(msg)}`)
    }
}