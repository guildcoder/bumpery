# Validation status

## Published release
- GitHub Actions deployment succeeded on main (run 35281973705).
- Public HTTPS homepage, game, table registry, web manifest, Apple icon, configuration, and versioned service worker all returned HTTP 200.
- Live browser: first welcome, lobby-to-table navigation, ball launch, and Supabase leaderboard display verified. The existing TEST FLIGHT score appears; no console errors.
- Backend CORS preflight from the GitHub Pages origin returned HTTP 200 with required headers allowed.

## Passed locally
- Version 0.4 Bumpery lobby at 390×844: first-visit welcome, original artwork/icon, more-tables notice, navigation to Starbound Parlor, and game start verified with no console errors. Four added tests cover installation state, registry assets, offline lobby assets, and independent table sessions/RPCs.
- 33 Node tests: `node --test --test-isolation=none tests/modes.test.cjs tests/physics.test.cjs tests/leaderboard.test.cjs tests/pwa.test.cjs tests/platform.test.cjs`.
- New mode coverage: Hyperspeed duration/protected drains/expiry, up to five balls, replenishment while a survivor remains, simultaneous last-ball drains, tilt/reset, and combo windows.
- Version 0.3 browser preview at 390×844: game starts, cabinet display and full table are visible, no console errors. Actual iPhone touch/performance testing remains pending.
- Supabase SQL deployment succeeded; anonymous player sessions and public configuration connected. Live API checks passed for public read, two independent player sessions, run creation, cross-player ownership rejection, accepted score submission, duplicate idempotency, and visibility to the second player. One `TEST FLIGHT` record (25 points) remains on the board.
- Static site build: `node tools/build-site.cjs`.
- JavaScript syntax checks and `git diff --check`.
- Public-source scan: no personal filesystem paths, private emails, or secret credentials in the staged publication scope. Matches for secret-key prefixes are defensive validation code only.
- Four generated, opaque PNG Home Screen icons; dimensions checked and main icon visually inspected.
- GitHub project-path preview under `/starbound-parlor/`.
- Mobile Chromium viewport 390×844: no horizontal/vertical document overflow, touch media query active, 58px flipper buttons, toolbar controls at least 44px tall, service-worker controller present, and no console errors.

## Pending

- Real two-device leaderboard validation (live API verification used two independent sessions on this computer).

- Real iPhone Safari and Add to Home Screen testing.
- End-to-end offline browser navigation: automation stalled, although the offline worker's cache routing and isolation tests pass. Do not count the stalled browser operation as a pass.

Published at https://guildcoder.github.io/bumpery/ from the public https://github.com/guildcoder/bumpery repository. The release uses main to satisfy the existing GitHub Pages environment branch rule.
