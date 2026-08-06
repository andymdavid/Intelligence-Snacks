import { readFile } from 'node:fs/promises';

const site = 'https://intelligencesnacks.com';
const key = '8a91a7afe4d2d6777443d534179ace8e';
const keyLocation = site + '/' + key + '.txt';
const supplied = process.argv.slice(2);

const sitemapUrls = async () => {
  const response = await fetch(site + '/sitemap.xml');
  if (!response.ok) throw new Error('Unable to fetch sitemap (' + response.status + ')');
  const source = await response.text();
  return [...source.matchAll(/<loc>(https:\/\/intelligencesnacks\.com\/[^<]*)<\/loc>/g)].map(([, url]) => url);
};

await readFile(new URL('../public/8a91a7afe4d2d6777443d534179ace8e.txt', import.meta.url), 'utf8');
const urlList = [...new Set((supplied.length ? supplied : await sitemapUrls()).map((value) => new URL(value, site).href))];
if (urlList.some((url) => new URL(url).origin !== site)) throw new Error('IndexNow only accepts Intelligence Snacks URLs.');

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: 'intelligencesnacks.com', key, keyLocation, urlList }),
});
if (!response.ok && response.status !== 202) throw new Error('IndexNow submission failed (' + response.status + '): ' + await response.text());
console.log('Submitted ' + urlList.length + ' URL' + (urlList.length === 1 ? '' : 's') + ' to IndexNow.');
