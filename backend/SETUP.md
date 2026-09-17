# Free leaderboard setup

1. Create a **Free** project at https://supabase.com/dashboard. Keep the database password private; it never goes in the game.
2. In **SQL Editor**, run the complete contents of `backend/supabase.sql`.
3. In **Authentication → Sign In / Providers**, enable **Anonymous Sign-Ins**. Supabase applies its signup rate limits. For a large public launch, add CAPTCHA verification to anonymous sign-in and enable it in Supabase together; enabling CAPTCHA alone will reject this client's signup requests.
4. Copy the project URL and **public publishable key** from project settings. A legacy **anon** key also works. Do not use a secret or service-role key.
5. In the GitHub repository, open **Settings → Secrets and variables → Actions → Variables**. Add:
   - `SUPABASE_URL`: the HTTPS project URL, with no trailing slash.
   - `SUPABASE_PUBLISHABLE_KEY`: the public publishable (or legacy anon) key.
6. Rerun the **Deploy Starbound Parlor** workflow. The build embeds these public settings in `config.js`. Close old game tabs/Home Screen windows and reopen to activate the updated offline cache.
7. On two different devices, play completed online-started games, choose **Scores**, enter a nickname, and post. Verify that both entries appear on both devices.

No paid backend plan is required for initial use within Supabase's Free limits. Limits and inactivity behavior depend on the provider's current plan; see https://supabase.com/pricing. Do not enable billing/paid upgrades to complete this setup.

## Access model

- Anonymous Auth creates a device identity with an access token and refresh token.
- `starbound_start_run` issues a server-recorded run UUID. At most 30 starts per hour per identity, with a three-second gap. An advisory lock makes the per-player rate check atomic.
- `starbound_submit_score` requires that same identity, accepts one result per run, checks elapsed time, score bounds and increments, and atomically updates a personal best only when it improves. Retrying a completed request is idempotent.
- `starbound_leaderboard` returns only the top 50 ranks, nicknames, and scores. No user IDs, credentials, or run details are returned publicly.
- Tables are kept in a private schema with RLS enabled and direct privileges revoked. Functions have fixed empty search paths and explicit role grants.

These checks mitigate accidental duplicates and basic invalid submissions. They do not prove the client actually played: determined users can modify browser code or create new anonymous identities. Use server replay verification and stronger signup controls before offering prizes or competitive rankings. Nicknames are not unique or authenticated names.

Runs expire after 24 hours. The start function cleans up that player's old runs. For sustained public traffic, periodically delete old runs and unused anonymous Auth users through administrative maintenance. The Free database is finite; per-player limits do not cap total signup volume.

## Troubleshooting

- **Not connected**: both repository variables must be configured, then redeploy.
- **Anonymous sign-ins disabled**: turn them on in Supabase Auth.
- **No score form**: a completed, positive-score voyage must have successfully registered online when it began.
- **Network failure posting**: the latest completed result is retained locally for retry within 24 hours. Reopen Scores while online.
- **Old configuration after redeploy**: close all game tabs and the Home Screen app, then reopen. The waiting service worker activates between app sessions.
- **Expired/revoked player session**: clear this site's stored data to start a new identity (this also clears the local best and any pending submission).

## Moderation and maintenance

The owner can inspect or delete entries from `starbound_private.best_scores` in the SQL editor. Callsigns should be moderated if the game is shared publicly. No admin credential or moderation endpoint is exposed to players.
