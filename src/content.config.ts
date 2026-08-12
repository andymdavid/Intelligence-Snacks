import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const status = z.enum(['draft', 'review', 'published']);
const seo = z.object({
  title: z.string().max(70).optional(),
  description: z.string().max(170).optional(),
  image: z.string().optional(),
  canonicalUrl: z.url().optional(),
}).optional();

const people = defineCollection({
  loader: glob({ base: './src/content/people', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    shortBio: z.string(),
    image: z.string().optional(),
    externalUrl: z.url().optional(),
    socialLinks: z.object({
      x: z.url().optional(),
      linkedin: z.url().optional(),
      nostr: z.url().optional(),
    }).optional(),
    seo,
  }),
});

const topics = defineCollection({
  loader: glob({ base: './src/content/topics', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    colour: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    featured: z.boolean().default(false),
    seo,
  }),
});

const episodes = defineCollection({
  loader: glob({ base: './src/content/episodes', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    number: z.number().int().positive(),
    title: z.string(),
    summary: z.string(),
    thumbnail: z.string().optional(),
    status,
    legacyTitle: z.string().optional(),
    originalPublishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    participants: z.array(reference('people')).min(1),
    themes: z.array(reference('topics')).min(1),
    youtubeUrl: z.url().optional(),
    audioUrl: z.url().optional(),
    transcript: z.string().optional(),
    featured: z.boolean().default(false),
    fixture: z.boolean().default(false),
    seo,
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
    thumbnail: z.string().optional(),
    standfirst: z.string(),
    status,
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    sourceEpisode: reference('episodes'),
    theme: reference('topics'),
    attribution: z.string(),
    transcriptStart: z.string().optional(),
    relationships: z.array(z.object({
      target: reference('snacks'),
      type: relationshipType,
      note: z.string().optional(),
    })).default([]),
    featured: z.boolean().default(false),
    fixture: z.boolean().default(false),
    seo,
  }),
});

export const collections = { people, topics, episodes, snacks };
