import type { CollectionEntry } from 'astro:content';

export function isVisible(status: 'draft' | 'review' | 'published') {
  return status === 'published' || import.meta.env.DEV || import.meta.env.PUBLIC_INCLUDE_REVIEW === 'true';
}

export function hrefFor(collection: string, id: string) {
  const section = collection === 'newsletters' ? 'newsletters' : collection;
  return `/${section}/${id}/`;
}

export function formatDate(date?: Date) {
  if (!date) return null;
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export type SnackEntry = CollectionEntry<'snacks'>;
