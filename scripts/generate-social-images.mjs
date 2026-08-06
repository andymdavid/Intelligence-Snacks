import { mkdir, readFile, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { basename, join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const snacksDirectory = join(root, 'src/content/snacks');
const topicsDirectory = join(root, 'src/content/topics');
const episodesDirectory = join(root, 'src/content/episodes');
const outputDirectory = join(root, 'public/social/snacks');
const field = (source, name) => source.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1]?.replace(/^['\"]|['\"]$/g, '') ?? '';
const escapeXml = (value) => value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character]);
const wrap = (value, limit = 28) => {
  const words = value.split(/\s+/); const lines = []; let line = '';
  for (const word of words) { const next = line ? `${line} ${word}` : word; if (next.length > limit && line) { lines.push(line); line = word; } else line = next; }
  if (line) lines.push(line); return lines.slice(0, 4);
};

await mkdir(outputDirectory, { recursive: true });
const topicColours = new Map();
const episodeNumbers = new Map();
for (const filename of (await readdir(topicsDirectory)).filter((name) => name.endsWith('.md'))) {
  const source = await readFile(join(topicsDirectory, filename), 'utf8');
  topicColours.set(basename(filename, '.md'), field(source, 'colour'));
}
for (const filename of (await readdir(episodesDirectory)).filter((name) => name.endsWith('.md'))) {
  const source = await readFile(join(episodesDirectory, filename), 'utf8');
  episodeNumbers.set(basename(filename, '.md'), field(source, 'number'));
}

for (const filename of (await readdir(snacksDirectory)).filter((name) => name.endsWith('.md'))) {
  const source = await readFile(join(snacksDirectory, filename), 'utf8');
  if (field(source, 'status') !== 'published') continue;
  const id = basename(filename, '.md'); const title = field(source, 'title'); const colour = topicColours.get(field(source, 'primaryTopic')) ?? '#fe7141'; const episodeNumber = episodeNumbers.get(field(source, 'sourceEpisode')) ?? '';
  const titleLines = wrap(title).map((line, index) => `<text x="72" y="${230 + (index * 70)}" fill="#111" font-family="DejaVu Sans" font-size="62" font-weight="700">${escapeXml(line)}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" rx="12" fill="${colour}"/><text x="72" y="78" fill="#111" font-family="DejaVu Sans Mono" font-size="18" font-weight="700">INTELLIGENCE SNACK${episodeNumber ? ` · EPISODE ${episodeNumber}` : ''}</text>${titleLines}<g transform="translate(1016 476)"><rect width="112" height="82" rx="6" fill="#111"/><rect x="13" y="13" width="86" height="34" rx="3" fill="#f5f4ef"/><circle cx="38" cy="30" r="10" fill="#111"/><circle cx="74" cy="30" r="10" fill="#111"/><path d="M24 70h64l-10-18H34L24 70Z" fill="#f5f4ef"/></g><text x="72" y="560" fill="#111" font-family="DejaVu Sans" font-size="24" font-weight="600">intelligencesnacks.com</text></svg>`;
  const result = spawnSync('magick', ['svg:-', '-quality', '88', join(outputDirectory, `${id}.webp`)], { input: svg });
  if (result.status !== 0) throw new Error(result.stderr.toString() || `Unable to generate ${id}`);
}

console.log('Generated social artwork for published snacks.');
