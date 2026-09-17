# Bumpery

A free, portrait-first pinball platform for iPhone, desktop browsers, and a local Chrome extension. Original artwork, no runtime libraries, no Unity download, and no paid game assets.

Bumpery opens to a minimal table lobby. **Starbound Parlor** is the first table; more tables are coming. The platform has its own branding, app icon, and first-visit welcome. No additional tables are built yet. See [TABLES.md](TABLES.md) for the table registry and isolated save/leaderboard contract.

## iPhone

Open the GitHub Pages site in **Safari**, tap **Share → Add to Home Screen**, and tap **Add**. The original pinball icon launches the app without browser chrome. Load it online once to prepare offline play.

Use both thumbs on the left and right flipper buttons. Hold **Launch**, then release to fire the ball; tap **Nudge** to bump the table. Pause and sound controls remain within the screen's safe area. Sound starts off. The global leaderboard needs internet; gameplay and personal best work offline.

## Game

Three balls per voyage. Light all three navigation beacons, then hit the observatory to collect a jackpot and raise the score multiplier. Fresh balls have a ten-second ball save. Three rapid nudges tilt the table. Keyboard: arrows/A/D for flippers, Space to launch, N to nudge, P/Escape to pause, M for sound.

- **Hyperspeed:** clear all six meteor targets for extreme speed with every drain shielded. Lasts 15 seconds at level 1, 20 at level 2, and 25 from level 3 onward. Clearing the bank during Hyperspeed cannot extend its timer.
- **Meteor Shower:** the first observatory jackpot reaches level 2 and starts falling meteors. A replacement arrives every 2.25 seconds while at least one ball survives, with at most five on the table. Losing all balls ends the shower and costs one life.
- **Cabinet rewards:** chain distinct shots within four seconds for combos, build a six-shot super combo, or hit a beacon within five seconds of a strongly charged launch for a skill shot. Short original animations and sound cues celebrate rewards outside the playfield.

Both modes can run together. Pause freezes their timers; tilt cancels protection and meteor replenishment.

The visuals use original procedural Canvas artwork with metallic shading; this is an arcade simulation rather than a full 3D pinball engine. It does not use movie assets, characters, dialogue, or music.

## GitHub Pages

The included Actions workflow tests the game and builds the static site into `dist/`. Under **Settings → Pages**, set **Source** to **GitHub Actions**. Push to `main` or `master`, or run **Deploy Starbound Parlor** manually.

All site URLs are relative, so it works at `https://guildcoder.github.io/bumpery/` as well as a custom domain. The deployment includes a Web App Manifest, 180px Apple touch icon, 192/512px app icons, a maskable icon, and a versioned offline service worker. Game updates activate after the previous app closes, avoiding mid-game changes.

## Global leaderboard

GitHub Pages hosts static files and cannot store scores. The configured Supabase project supplies a shared database; its SQL functions and anonymous sign-in are deployed. Only its browser-safe publishable key is included in the game. Follow [backend/SETUP.md](backend/SETUP.md) to connect your own project. If configuration is removed, the app clearly distinguishes local records from global scores.

Players receive anonymous sessions automatically; no email/password entry is required. A completed voyage can be posted using a public nickname. The board shows each player's best voyage. Clearing browser data creates a new player identity; nicknames are not reserved or verified. Scores have server-side ownership, duration, range, rate, and duplicate-submission checks, but remain client-reported: this is a casual leaderboard, not tamper-proof competition. Offline-started voyages remain local.

The database has no direct public table access. Only bounded RPC functions are exposed. **Never add a service-role key, secret API key, database password, or GitHub token to this repository.** Only a Supabase project URL and public publishable key belong in the website.

## Chrome extension

Open `chrome://extensions`, enable **Developer mode**, select **Load unpacked**, and choose the `extension` folder. Click its toolbar action to open the game. No website permissions are requested. The Home Screen service worker is only registered on HTTP(S), not extension pages. The hosted website and extension share the same game code and public leaderboard configuration.

## Development

Node is only needed for development and deployment, not for playing. No npm install is required.

```sh
node tools/generate-icons.cjs
node --test --test-isolation=none tests/*.test.cjs
node tools/build-site.cjs
node tools/preview.cjs dist 8766
```

Open `http://127.0.0.1:8766/`. To test the repository-path deployment locally, run `node tools/preview.cjs dist 8766 /bumpery/` instead and open `http://127.0.0.1:8766/bumpery/`.

- `extension/`: shared game/PWA sources and extension manifest.
- `backend/`: Supabase schema and setup guide.
- `tools/`: dependency-free build, icon generator, preview server.
- `tests/`: physics, leaderboard-client, packaging, and offline-worker tests.
- `.github/workflows/pages.yml`: test/build/deploy pipeline.

## Privacy

Personal best, sound preference, nickname, pending completed score, and anonymous leaderboard credentials are saved locally on the device. Posting a score sends the nickname, score, run identifier, and game duration to the configured Supabase project. Only nickname, rank, and best score are publicly returned. GitHub Pages and Supabase process ordinary hosting/network request data. No ads or analytics SDKs are included. Delete browser/app storage to clear local data; the project owner can remove posted records in Supabase.
