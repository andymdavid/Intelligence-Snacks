import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const CHANNEL_ID = 'UCGVpiP_odkzPHkX0x1GMX1w';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const EPISODES_DIRECTORY = new URL('../src/content/episodes/', import.meta.url);

const decodeEntities = (value) => value
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const tagValue = (source, tag) => {
  const match = source.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return match ? decodeEntities(match[1].trim()) : '';
};

const episodeNumber = (title) => {
  const match = title.match(/(?:Good Stuff|Intelligence Snacks)\s+(\d+)/i);
  return match ? Number(match[1]) : undefined;
};

const updateFrontmatter = (source, video) => {
  const youtubeLine = `youtubeUrl: https://www.youtube.com/watch?v=${video.id}`;
  const publishedLine = video.published ? `originalPublishedAt: ${video.published}` : undefined;
  let next = source;
  if (/^youtubeUrl:/m.test(next)) next = next.replace(/^youtubeUrl:.*$/m, youtubeLine);
  else next = next.replace(/^(legacyTitle:.*|title:.*)$/m, `$1\n${youtubeLine}`);
  if (publishedLine) {
    if (/^originalPublishedAt:/m.test(next)) next = next.replace(/^originalPublishedAt:.*$/m, publishedLine);
    else next = next.replace(/^youtubeUrl:.*$/m, `$&\n${publishedLine}`);
  }
  return next;
};

const response = await fetch(FEED_URL);
if (!response.ok) throw new Error(`YouTube feed request failed (${response.status})`);
const xml = await response.text();
const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, entry]) => ({
  id: tagValue(entry, 'yt:videoId'), title: tagValue(entry, 'title'), published: tagValue(entry, 'published'),
})).filter((video) => video.id && episodeNumber(video.title));
const videosByEpisode = new Map(videos.map((video) => [episodeNumber(video.title), video]));

const filenames = (await readdir(EPISODES_DIRECTORY)).filter((filename) => /\.mdx?$/.test(filename));
const changed = [];
for (const filename of filenames) {
  const path = join(EPISODES_DIRECTORY.pathname, filename);
  const source = await readFile(path, 'utf8');
  const number = Number(source.match(/^number:\s*(\d+)/m)?.[1]);
  const video = videosByEpisode.get(number);
  if (!video) continue;
  const next = updateFrontmatter(source, video);
  if (next !== source) {
    await writeFile(path, next);
    changed.push(filename);
  }
}

console.log(changed.length ? `Updated ${changed.join(', ')}` : 'Episode YouTube metadata is already current.');
