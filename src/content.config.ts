import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const status = z.enum(['draft', 'review', 'published']);

const people = defineCollection({
  loader: glob({ base: './src/content/people', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    shortBio: z.string(),
    image: z.string().optional(),
    externalUrl: z.url().optional(),
  }),
});

const topics = defineCollection({
  loader: glob({ base: './src/content/topics', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    colour: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    featured: z.boolean().default(false),
  }),
});

const episodes = defineCollection({
  loader: glob({ base: './src/content/episodes', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    number: z.number().int().positive(),
    title: z.string(),
    summary: z.string(),
    status,
    legacyTitle: z.string().optional(),
    originalPublishedAt: z.coerce.date().optional(),
    participants: z.array(reference('people')).min(1),
    primaryTopic: reference('topics'),
    relatedTopics: z.array(reference('topics')).default([]),
    youtubeUrl: z.url().optional(),
    audioUrl: z.url().optional(),
    transcript: z.string().optional(),
    featured: z.boolean().default(false),
    fixture: z.boolean().default(false),
  }),
});

const relationshipType = z.enum([
  'overlaps',
  'develops',
  'contradicts',
  'revises',
  'exemplifies',
  'enables',
  'caused-by',
]);

const snacks = defineCollection({
  loader: glob({ base: './src/content/snacks', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    editorialTitle: z.string().optional(),
    standfirst: z.string(),
    status,
    publishedAt: z.coerce.date().optional(),
    sourceEpisode: reference('episodes'),
    primaryTopic: reference('topics'),
    relatedTopics: z.array(reference('topics')).default([]),
    attribution: z.string(),
    transcriptStart: z.string().optional(),
    relationships: z.array(z.object({
      target: reference('snacks'),
      type: relationshipType,
      note: z.string().optional(),
    })).default([]),
    featured: z.boolean().default(false),
    fixture: z.boolean().default(false),
  }),
});

const newsletters = defineCollection({
  loader: glob({ base: './src/content/newsletters', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    editionNumber: z.number().int().positive(),
    status,
    publishedAt: z.coerce.date().optional(),
    sourceEpisode: reference('episodes'),
    snacks: z.array(reference('snacks')).min(1),
    fixture: z.boolean().default(false),
  }),
});

export const collections = { people, topics, episodes, snacks, newsletters };
