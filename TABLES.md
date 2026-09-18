# Adding a table to Bumpery

`extension/index.html` is the platform entry point. `extension/tables.js` is the immutable table catalog used by the lobby and game initialization. Starbound Parlor, Getaway, Elsewhere, Deadwood, and The Old Course ship today. The lobby announces more tables without showing unbuilt or selectable placeholders.

Each registry entry owns a stable `id`, display `name`, relative `href`, original `art`, unique `storageNamespace`, and unique server `rpcPrefix`. Keep these identifiers stable across renames. Starbound retains its existing `starbound.*` storage and `starbound_*` RPCs, preserving existing records.

To add a future table:

1. Implement its own page/physics/rendering and art. Give its body the registry's `data-table` ID. Shared platform code is optional; table physics do not have to match Starbound.
2. Add one entry to `tables.js` using unique storage and RPC names. The lobby creates its card automatically. Do not point a new theme at Starbound's scoring backend.
3. Provision a separate server-owned run/best-score store and RPC family for that table. Use `backend/supabase.sql` as the template, with separate private schema and function prefix. Keep ownership, RLS, validation, and rate limits. The RPC shapes are `PREFIX_start_run()`, `PREFIX_submit_score(p_run_id,p_nickname,p_score,p_seconds)`, and `PREFIX_leaderboard()`. The client selects this family; a client-side table ID alone is never an authorization boundary.
4. Add its assets to the explicit allowlists in `tools/build-site.cjs` and `extension/sw.js`. Version hashing includes these assets. Retain old table pages so installed links keep working.
5. Test independent records, offline entry, iPhone controls, and score eligibility before deploying. Extend the catalog assertions when shipping a second table.

The first-visit welcome belongs to the platform (`bumpery.welcome.v1`). Installation uses the platform name/icon/start page. Game saves and anonymous sessions belong to each table. Browsers control Home Screen installation; dismissing the welcome never claims that installation occurred. If storage is unavailable the welcome may reappear, but gameplay still works.

Brand direction: an original pinball tavern, with warm cream, muted vermilion, charcoal, and chrome. Flippers Tavern in Lubbock was a mood reference only; no photos, logos, menu content, or machine artwork from it are shipped. The platform art and icon are original SVG/Node geometry.

## Getaway

Getaway shares low-level collision and input conventions with Starbound, but owns its geometry, renderer, progression, chase state, storage namespace, and RPC family. `backend/getaway.sql` provisions its independent records. The hideout starts lit; three signals or a six-target bank relight it. Target banks advance gears (maximum 6) and scoring (maximum 5×).

A capture freezes table simulation time, balls, flippers, and table timers. The chase has a 1.8-second introduction, continuous flipper steering, three damage points, one-second collision immunity, escalating traffic and pursuers, and a 90-second maximum before being boxed in. Survival pays 250 points per second, rounded to tenths, times the table multiplier. The 2.2-second result screen precedes ejection; a three-second ball save protects the return. Pause and backgrounding stop both simulations. Ranking duration includes chase time.

## Elsewhere

Original eerie table and 12-second horizontal story panorama. An optional original eight-note motif uses the gameplay synthesizer, starts after a user gesture, and follows the simulation clock. Launch skips the story; pause/backgrounding stops it. Reduced-motion mode replaces horizontal animation with discrete chapters and table spin with immediate inversion.

Clock contacts become eligible after 45 seconds of table time. Each eligible contact has a 28% deterministic chance of warping, with a fourth-contact guarantee; each return starts a 65-second cooldown. A warp lasts 24 seconds (two-second turn, twenty seconds inverted, two-second return). Canonical physics is transformed together with the board, so ball, rails, upward screen gravity, and overhead flippers agree. Inputs swap internally to preserve screen-left and screen-right controls. Sideways gravity drifts, and six seconds run at half physics speed. Warped drains are rescued. A normal return grants 3,000 × multiplier and three seconds of ball save; tilt cancels without a reward.

Uses independent elsewhere.* storage, elsewhere_* RPCs and elsewhere_private schema. `backend/elsewhere.sql` is the reproducible migration. No show footage, soundtrack, logo, or copied playfield art is included.

## Deadwood

Shares proven base collisions with Getaway, but owns Western art and a deterministic reaction duel. Shoot the lit saloon pocket. After a three-second countdown and unpredictable 0.35–1.25-second pause, FIRE starts a 900ms reaction window. Each win multiplies the next window by 0.84 down to 180ms. A fresh flipper press is required; early presses lose and holding cannot auto-win. Wins pay 1,500 plus a speed bonus in multiples of 25. The table freezes until failure, banked wins pay once, and the ball returns with a save. Independent deadwood records and RPCs.

## The Old Course

Nine original Scottish-inspired links holes, not a recreation of a real course. Uses independent top-down golf simulation with no downward pinball gravity. Left/right aims a hickory flipper at the current lie; Club cycles Brassie, Iron, Putter; hold/release Strike controls power. Friction differs on fairway, green, rough and sand. Wind affects longer shots. Water and out-of-bounds add one penalty and return to the previous lie. Gentle contact sinks a putt; fast passes do not. Ten strokes automatically picks up a hole. Next/Finish advances the scorecard; only completed rounds update personal records or become postable.

Ranking encodes completed nine-hole strokes as `(162 - strokes) * 25` so the existing descending-score API puts the lowest stroke count first. The UI decodes it and displays only strokes; SQL accepts only 1,800–3,825 in multiples of 25 (90–9 strokes). Own oldcourse namespace, private records and RPCs. No golf score is mixed with pinball points.
