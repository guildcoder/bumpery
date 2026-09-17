# Adding a table to Bumpery

`extension/index.html` is the platform entry point. `extension/tables.js` is the immutable table catalog used by the lobby and game initialization. Only Starbound Parlor ships today. The lobby announces more tables without showing unbuilt or selectable placeholders.

Each registry entry owns a stable `id`, display `name`, relative `href`, original `art`, unique `storageNamespace`, and unique server `rpcPrefix`. Keep these identifiers stable across renames. Starbound retains its existing `starbound.*` storage and `starbound_*` RPCs, preserving existing records.

To add a future table:

1. Implement its own page/physics/rendering and art. Give its body the registry's `data-table` ID. Shared platform code is optional; table physics do not have to match Starbound.
2. Add one entry to `tables.js` using unique storage and RPC names. The lobby creates its card automatically. Do not point a new theme at Starbound's scoring backend.
3. Provision a separate server-owned run/best-score store and RPC family for that table. Use `backend/supabase.sql` as the template, with separate private schema and function prefix. Keep ownership, RLS, validation, and rate limits. The RPC shapes are `PREFIX_start_run()`, `PREFIX_submit_score(p_run_id,p_nickname,p_score,p_seconds)`, and `PREFIX_leaderboard()`. The client selects this family; a client-side table ID alone is never an authorization boundary.
4. Add its assets to the explicit allowlists in `tools/build-site.cjs` and `extension/sw.js`. Version hashing includes these assets. Retain old table pages so installed links keep working.
5. Test independent records, offline entry, iPhone controls, and score eligibility before deploying. Extend the catalog assertions when shipping a second table.

The first-visit welcome belongs to the platform (`bumpery.welcome.v1`). Installation uses the platform name/icon/start page. Game saves and anonymous sessions belong to each table. Browsers control Home Screen installation; dismissing the welcome never claims that installation occurred. If storage is unavailable the welcome may reappear, but gameplay still works.

Brand direction: an original pinball tavern, with warm cream, muted vermilion, charcoal, and chrome. Flippers Tavern in Lubbock was a mood reference only; no photos, logos, menu content, or machine artwork from it are shipped. The platform art and icon are original SVG/Node geometry.
