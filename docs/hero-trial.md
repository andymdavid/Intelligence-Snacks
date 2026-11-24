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
Its size is `clamp(2.65625rem, 6.63vw, 5.95rem)` (42.5–95.2px at a 16px root),
15% smaller than the original. Hero description is 16px. Hero signup controls are
38px high and limited to 30rem wide, with a 12px Geist Mono input and 13px Geist Mono button; other signup instances keep their styling.

The H1, description and email signup are centred horizontally across the hero,
with centred heading/description text and the existing 38rem signup width limit.

The content group sits in the upper hero area above the people/table artwork.
Description: For people building modern businesses, Intelligence Snacks helps you digest the big ideas from the world of AI, delivered to your inbox weekly.

Header/navigation trial: cassette plus uppercase Switzer Regular wordmark, transparent 58px
header, and a bordered Menu button alongside a search icon. Inspired by https://www.openresidency.com/ and
https://preymaker.com plus the supplied menu screenshot. Menu opens a light modal
panel with large page links, Explore and Listen & watch groups, Search and signup.
Menu and Close share the same top-right position; their SVG icons align with the labels.
The reference CSS declares Suisse BP Intl, while its wordmark is an outlined SVG.
Switzer Regular (400) is the selected wordmark font, served from the official
Fontshare CDN under the ITF Free Font License. Font files are not redistributed in
the repository. Header and menu wordmarks share the same font.
Native dialog provides keyboard focus containment and Escape dismissal; closing
restores focus to Menu. Homepage header uses light text; internal pages dark text.
