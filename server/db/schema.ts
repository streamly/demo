import { relations } from 'drizzle-orm'
import { bigint, boolean, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

const timestamps = {
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
}

export const users = pgTable('user', {
    id: varchar('id', { length: 36 }).primaryKey(),
    givenName: text('given_name'),
    familyName: text('family_name'),
    email: text('email'),
    phone: text('phone'),
    position: text('position'),
    company: text('company'),
    industry: text('industry'),
    website: text('website'),
    canUpload: boolean('can_upload').default(false),
    isChannelOwner: boolean('is_channel_owner').default(false),
    ...timestamps
})

export const videos = pgTable('videos', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 36 }).notNull(),
    title: text('title'),
    description: text('description'),
    duration: integer('duration').notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    fileSize: bigint('file_size', { mode: 'number' }).notNull(),
    visibility: varchar('visibility', { length: 16 }).notNull(),
    format: varchar('format', { length: 64 }).notNull(),
    ...timestamps
})

export const thumbnails = pgTable('thumbnails', {
    id: uuid('id').defaultRandom().primaryKey(),
    videoId: uuid('video_id')
        .references(() => videos.id, { onDelete: 'cascade' })
        .notNull()
        .unique(),
    width: integer('width'),
    height: integer('height'),
    fileSize: bigint('file_size', { mode: 'number' }),
    ...timestamps
})

export const types = pgTable('types', { name: text('name').primaryKey() })
export const topics = pgTable('topics', { name: text('name').primaryKey() })
export const tags = pgTable('tags', { name: text('name').primaryKey() })
export const companies = pgTable('companies', { name: text('name').primaryKey() })
export const people = pgTable('people', { name: text('name').primaryKey() })
export const audiences = pgTable('audiences', { name: text('name').primaryKey() })

export const videoTypes = pgTable('video_types', {
    videoId: uuid('video_id')
        .references(() => videos.id, { onDelete: 'cascade' })
        .notNull(),
    typeName: text('type_name')
        .references(() => types.name)
        .notNull()
})

export const videoTopics = pgTable('video_topics', {
    videoId: uuid('video_id')
        .references(() => videos.id, { onDelete: 'cascade' })
        .notNull(),
    topicName: text('topic_name')
        .references(() => topics.name)
        .notNull()
})

export const videoTags = pgTable('video_tags', {
    videoId: uuid('video_id')
        .references(() => videos.id, { onDelete: 'cascade' })
        .notNull(),
    tagName: text('tag_name')
        .references(() => tags.name)
        .notNull()
})

export const videoCompanies = pgTable('video_companies', {
    videoId: uuid('video_id')
        .references(() => videos.id, { onDelete: 'cascade' })
        .notNull(),
    companyName: text('company_name')
        .references(() => companies.name)
        .notNull()
})

export const videoPeople = pgTable('video_people', {
    videoId: uuid('video_id')
        .references(() => videos.id, { onDelete: 'cascade' })
        .notNull(),
    personName: text('person_name')
        .references(() => people.name)
        .notNull()
})

export const videoAudiences = pgTable('video_audiences', {
    videoId: uuid('video_id')
        .references(() => videos.id, { onDelete: 'cascade' })
        .notNull(),
    audienceName: text('audience_name')
        .references(() => audiences.name)
        .notNull()
})

// ---- Relations ----

export const userRelations = relations(users, ({ many }) => ({
    videos: many(videos)
}))

export const videoRelations = relations(videos, ({ one, many }) => ({
    user: one(users, { fields: [videos.userId], references: [users.id] }),
    types: many(videoTypes),
    topics: many(videoTopics),
    tags: many(videoTags),
    companies: many(videoCompanies),
    people: many(videoPeople),
    audiences: many(videoAudiences)
}))

export const videoTypesRelations = relations(videoTypes, ({ one }) => ({
    video: one(videos, { fields: [videoTypes.videoId], references: [videos.id] }),
    type: one(types, { fields: [videoTypes.typeName], references: [types.name] })
}))

export const videoTopicsRelations = relations(videoTopics, ({ one }) => ({
    video: one(videos, { fields: [videoTopics.videoId], references: [videos.id] }),
    topic: one(topics, { fields: [videoTopics.topicName], references: [topics.name] })
}))

export const videoTagsRelations = relations(videoTags, ({ one }) => ({
    video: one(videos, { fields: [videoTags.videoId], references: [videos.id] }),
    tag: one(tags, { fields: [videoTags.tagName], references: [tags.name] })
}))

export const videoCompaniesRelations = relations(videoCompanies, ({ one }) => ({
    video: one(videos, { fields: [videoCompanies.videoId], references: [videos.id] }),
    company: one(companies, { fields: [videoCompanies.companyName], references: [companies.name] })
}))

export const videoPeopleRelations = relations(videoPeople, ({ one }) => ({
    video: one(videos, { fields: [videoPeople.videoId], references: [videos.id] }),
    person: one(people, { fields: [videoPeople.personName], references: [people.name] })
}))

export const videoAudiencesRelations = relations(videoAudiences, ({ one }) => ({
    video: one(videos, { fields: [videoAudiences.videoId], references: [videos.id] }),
    audience: one(audiences, { fields: [videoAudiences.audienceName], references: [audiences.name] })
}))