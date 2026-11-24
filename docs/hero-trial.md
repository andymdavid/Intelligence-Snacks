# Hero background trial

Branch: `design/hero-background-trial`, based on `13ffcad` from `origin/main`.
This is an unmerged design experiment; production remains on its existing version.

Changes: use the supplied `Intelligence-Snacks-Hero-upscaled.png` unchanged as a
full-width homepage hero background, remove the `AI · Software · Business · Work`
eyebrow, and use light hero text and email-field styling for the dark background.
The right-hand hero snack cards are removed. The headline, copy and testimonial remain. The hero has a minimum height of `calc(100vh - 58px)` on desktop and mobile,
so the hero and 58px header together fit one viewport. The image is displayed at 80% of the full hero width, aligned bottom centre,
to reduce the apparent size of the people and table while preserving the full image.

## Run locally

```sh
bun install --frozen-lockfile
bun run dev --port 4322
```

Open `http://localhost:4322`. For a built preview:

```sh
bun run build
PORT=4322 bun run start
```

The separately registered Wingman app is **Intelligence Snacks Hero Trial**,
at https://fast-log-cube.lara.runwingman.com.
Wingman's Astro runner serves this worktree on port 43000 with live reload.
No production subscription credentials have been copied into this preview.

Compare against https://intelligencesnacks.com. To inspect the code changes:

```sh
git diff 13ffcad...design/hero-background-trial -- src/pages/index.astro public/images/hero-conversation.png
```

Source image SHA-256: `733406fc270c979c100fa019de8858410efa6710c2534f124b094bf26aebd10a`.

The hero H1 uses self-hosted Geist Serif Regular (400), from the official
vercel/geist-font repository, with its SIL Open Font License included beside the font.
Its existing size remains `clamp(3.125rem, 7.8vw, 7rem)` (50–112px at a 16px root).
