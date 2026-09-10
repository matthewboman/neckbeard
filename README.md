# Podcast Pages

A mobile-first static podcast player designed for GitHub Pages. Podcast RSS feeds are refreshed once a day by GitHub Actions and written to `data/podcasts.json`, so visitors never need to fetch RSS feeds directly from their browsers.

## Features

- Mobile-first Tailwind CSS interface
- Vanilla JavaScript; no frontend framework
- Latest episode from every podcast on the home screen
- Client-side search across podcast names, descriptions, and loaded episodes
- Podcast view showing the 10 latest episodes
- Persistent player while navigating inside the single-page app
- Play/pause, seek, rewind 15 seconds, forward 30 seconds, and playback speed
- Daily RSS refresh through GitHub Actions
- Manual RSS refresh from the GitHub Actions UI

## Add or remove podcasts

Edit `data/feeds.json`:

```json
[
  {
    "name": "99% Invisible",
    "url": "https://feeds.simplecast.com/BqbsxVfO"
  }
]
```

`name` is only used as a fallback if the RSS feed cannot supply a title. You may optionally add an `id` if you want to control the URL-safe podcast identifier.

## Local setup

```bash
npm install
npm run update
python3 -m http.server 8000
```

Open `http://localhost:8000`.

Tailwind is loaded with the Tailwind v4 browser package, so the static UI does not require a CSS build step.

## Tests

```bash
npm test
```

## GitHub Pages

1. Create a GitHub repository and push this project to the default branch.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select your default branch and `/ (root)`.
5. Save.

## Daily RSS update

`.github/workflows/update-podcasts.yml` runs every day at 10:15 UTC. It can also be run manually from **Actions → Update podcast feeds → Run workflow**.

The job:

1. Checks out the repository.
2. Installs Node dependencies.
3. Fetches every feed in `data/feeds.json`.
4. Keeps the latest 10 episodes from each feed.
5. Rewrites `data/podcasts.json`.
6. Commits and pushes the JSON only when it changed.

Scheduled GitHub Actions use UTC and can start somewhat later than the exact cron time.
