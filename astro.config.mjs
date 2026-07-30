import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://intelligencesnacks.com',
  output: 'static',
  server: {
    host: true,
    port: Number(process.env.PORT ?? 4321),
  },
  vite: {
    server: {
      allowedHosts: ['slim-tea-rose.lara1.runwingman.com'],
    },
  },
  integrations: [sitemap()],
  build: {
    format: 'directory',
  },
});
