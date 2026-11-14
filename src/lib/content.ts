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

export function episodesNewestFirst<T extends { data: { number: number } }>(episodes: T[]) {
  return [...episodes].sort((left, right) => right.data.number - left.data.number);
}

export function snacksInEpisodeOrder(snacks: SnackEntry[]): SnackEntry[] {
  return [...snacks].sort((left, right) =>
    (left.data.episodePosition ?? Number.MAX_SAFE_INTEGER) - (right.data.episodePosition ?? Number.MAX_SAFE_INTEGER)
    || left.id.localeCompare(right.id)
  );
}

export function snacksNewestEpisodeFirst<T extends { id: string; data: { sourceEpisode: { id: string }; episodePosition?: number | undefined } }>(snacks: T[], episodes: Array<{ id: string; data: { number: number } }>) {
  const numbers = new Map(episodes.map(({ id, data }) => [id, data.number]));
  return [...snacks].sort((a, b) =>
    (numbers.get(b.data.sourceEpisode.id) ?? -1) - (numbers.get(a.data.sourceEpisode.id) ?? -1)
    || (a.data.episodePosition ?? Number.MAX_SAFE_INTEGER) - (b.data.episodePosition ?? Number.MAX_SAFE_INTEGER)
    || a.id.localeCompare(b.id));
}
