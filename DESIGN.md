# Bumpery — current design

## Product
A free, offline, single-player pinball game opened in a dedicated Chrome extension tab. The implementation uses browser-native JavaScript, Canvas 2D, and Web Audio. The original Unity approach was replaced because installing an Editor is not possible on this computer.

The same code also builds a GitHub Pages website with iPhone Home Screen support. The web manifest, opaque Apple touch icon, safe-area layout, larger simultaneous touch controls, and scoped offline service worker are implemented. The connected Supabase backend provides anonymous player sessions, public callsigns, and a shared personal-best leaderboard. Public configuration is included; SQL deployment and live API checks have passed.

## Theme
An original astronomical amusement machine: aged brass, ink-blue enamel, engraved star charts, warm bulbs, and mechanical planets. The player lights Sol, Luna, and Nova navigation beacons, then reaches an observatory to find the way home. The mood draws on vintage space-adventure fiction without reproducing Zathura assets, characters, dialogue, music, logos, or its board design.

## Delivered first playable
- One illustrated table, metallic shading, original procedural celestial artwork, impact rings, score pops, and a silver ball.
- Portrait-first layout with complete table visibility and preserved proportions; landscape score and control side panels.
- Two physically moving flippers, chargeable spring launcher, three planet bumpers, six meteor targets, two slingshots, and outlanes.
- Three navigation beacons unlock an observatory jackpot. Jackpot increases score multiplier up to 5×.
- Three balls, one 10-second save opportunity per fresh ball, tilt after rapid nudges, local high score, restart, and explicit pause/resume.
- Arrow keys/A/D, Space, N, P/Escape, M, simultaneous pointer controls, optional fullscreen, and in-page guide.
- Original synthesized sound, off by default. Gameplay works offline; the leaderboard uses Supabase.

## Engineering
The simulation advances at 240 Hz independently from rendering. Circle/capsule contact resolves against static rails and rotating flippers, including surface velocity. High-speed motion uses additional collision substeps with at most six units of travel; ball-to-ball contacts support up to five simultaneous balls. Rendering uses a cached illustrated playfield and dynamic balls, flippers, lights, and effects. Resolution is capped at 2× device pixel ratio. A maximum frame delta avoids a simulation jump after stalls.

Focus loss pauses play and clears held controls. Local storage failures do not stop the game. The extension uses Manifest V3 with local scripts only and no requested host permissions. The toolbar action opens a new dedicated tab; it does not override Chrome's new-tab page.

## Validation and limits
Nine automated checks pass, including twelve longer simulated games. These caught and fixed an outlane pinch point and an overly energetic sling loop. Chrome browser preview verified launch/scoring, pause/focus behavior, score persistence, local-only requests, and portrait/landscape/narrow layouts under the extension's script policy without console errors. Unpacked-extension installation must still be confirmed in the user's Chrome profile.

The iPhone/PWA extension adds nine more checks (18 total). These cover anonymous leaderboard sessions, refresh and submission requests, error handling, public nickname validation, PNG icon dimensions, repository-relative URLs, and scope-limited cache handling. A Chromium mobile viewport at 390×844 showed no scrolling, 58px flipper buttons, 44px toolbar controls, and an active service worker with no console errors. Actual Safari/Home Screen installation still requires device verification; live Supabase API and published browser leaderboard checks have since passed. Browser automation stalled during the subsequent offline-navigation check, so that browser test is not recorded as passed.

Version 0.3 adds 15/20/25-second shielded Hyperspeed after clearing six meteor targets, and replenishing Meteor Shower multiball from the first observatory jackpot (level 2). Drains resolve before spawning; losing all meteors costs one life. Both modes can overlap. Tilt cancels both; pause freezes the gameplay clock. Distinct-shot combos, super combos, and launch skill shots award points and original three-second cabinet animations outside the table. Reduced-motion settings suppress visual streaks and animation movement.

Eleven additional mode tests bring the suite to 29 checks, covering protected outlanes, duration, expiry, ball cap, replenishment, simultaneous drains, tilt, reset, and combo timing. This remains an arcade simulation; further tuning should follow actual play on the user's vertical monitor and iPhone. Possible later additions include ramps, more mission sequences, and richer original artwork.


Version 0.4 introduces Bumpery as the one-word platform brand. Starbound Parlor keeps its identity and records. The original geometric icon and illustrated table poster use a warm pinball-tavern palette; the lobby has one title and no subsection headings. First-time iPhone visitors see Safari Home Screen instructions; all first visits learn more tables are coming. Registry entries own page, art, save namespace, and RPC prefix; TABLES.md documents future implementation boundaries. No future tables or paid assets ship.
