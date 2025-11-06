import { and, eq } from 'drizzle-orm'
import { db } from './connection'
import * as schema from './schema'
import { DraftVideo, VideoInput, VideoWithRelations, VideoMetadata, TypesenseVideo } from '@/shared/types/video'


export async function verifyVideoOwnership(userId: string, videoId: string): Promise<boolean> {
    const result = await db
        .select({ id: schema.videos.id })
        .from(schema.videos)
        .where(and(eq(schema.videos.id, videoId), eq(schema.videos.userId, userId)))
        .limit(1)

    return result.length > 0
}

export async function createDraftVideo(userId: string): Promise<DraftVideo> {
    const [draft] = await db
        .insert(schema.videos)
        .values({
            userId,
            duration: 0,
            width: 0,
            height: 0,
            fileSize: 0,
            visibility: 'draft',
            format: 'video/mp4'
        })
        .returning()

    return {
        id: draft.id,
        userId: draft.userId,
        duration: draft.duration,
        width: draft.width,
        height: draft.height,
        fileSize: draft.fileSize,
        visibility: draft.visibility,
        format: draft.format,
        createdAt: draft.createdAt!,
        updatedAt: draft.updatedAt!
    }
}

interface UpdateVideoInput extends VideoInput {
    id: string
    userId: string
}

export async function updateVideo(input: UpdateVideoInput) {
    return db.transaction(async (tx) => {
        const updates: Partial<typeof schema.videos.$inferInsert> = {
            updatedAt: new Date(),
        }

        if (input.title) updates.title = input.title
        if (input.description) updates.description = input.description
        if (input.visibility) updates.visibility = input.visibility
        if (input.format) updates.format = input.format

        const [video] = await tx
            .update(schema.videos)
            .set(updates)
            .where(eq(schema.videos.id, input.id))
            .returning()

        if (!video) return null

        const relations = [
            { values: input.types, table: schema.videoTypes, field: 'type' },
            { values: input.topics, table: schema.videoTopics, field: 'topic' },
            { values: input.tags, table: schema.videoTags, field: 'tag' },
            { values: input.companies, table: schema.videoCompanies, field: 'company' },
            { values: input.people, table: schema.videoPeople, field: 'person' },
            { values: input.audiences, table: schema.videoAudiences, field: 'audience' },
        ]

        for (const { values, table, field } of relations) {
            if (!values?.length) continue
            await tx.insert(table).values(values.map((v) => ({ videoId: video.id, [field]: v }))).onConflictDoNothing()
        }

        return video
    })
}

export async function getVideoById(videoId: string): Promise<VideoWithRelations | null> {
    const video = await db.query.videos.findFirst({
        where: eq(schema.videos.id, videoId),
        with: {
            user: true,
            types: { columns: { typeName: true } },
            topics: { columns: { topicName: true } },
            tags: { columns: { tagName: true } },
            companies: { columns: { companyName: true } },
            people: { columns: { personName: true } },
            audiences: { columns: { audienceName: true } },
        },
    })

    if (!video) {
        return null
    }

    return {
        id: video.id,
        userId: video.userId,
        title: video.title || undefined,
        description: video.description || undefined,
        duration: video.duration,
        width: video.width,
        height: video.height,
        fileSize: video.fileSize,
        visibility: video.visibility,
        format: video.format,
        createdAt: video.createdAt || undefined,
        updatedAt: video.updatedAt || undefined,
        user: video.user ? {
            id: video.user.id,
            givenName: video.user.givenName || undefined,
            familyName: video.user.familyName || undefined,
            email: video.user.email || undefined,
            company: video.user.company || undefined
        } : undefined,
        types: video.types.map((t) => t.typeName).filter((name): name is string => Boolean(name)),
        topics: video.topics.map((t) => t.topicName).filter((name): name is string => Boolean(name)),
        tags: video.tags.map((t) => t.tagName).filter((name): name is string => Boolean(name)),
        companies: video.companies.map((c) => c.companyName).filter((name): name is string => Boolean(name)),
        people: video.people.map((p) => p.personName).filter((name): name is string => Boolean(name)),
        audiences: video.audiences.map((a) => a.audienceName).filter((name): name is string => Boolean(name)),
    }
}

