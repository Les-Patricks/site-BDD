# AI Working Context

This file is intended for AI assistants and automation agents working in this repository.

## Mission

Maintain and evolve the Bluffers backoffice safely:
- keep Supabase editing flows stable
- keep Firebase publish flow functional
- avoid regressions in auth and data shaping

## Repository map

- Front app entry: `index.html` and `js/main.js`
- Auth page: `login.html` and `js/validation.js`
- Data access: `js/SupabaseManager.js` (config: `js/supabase-config.js`, gitignored — copy from `js/supabase-config.example.js` or see `docs/SETUP.md`)
- Local state: `js/state.js`
- Save flow: `js/saveManager.js`
- Publish trigger: `js/publish.js`, `js/databaseTransfer.js`
- Supabase Edge Functions: `supabase/functions/admin-bootstrap/`, `admin-save/`, `publish-to-firebase/`
- Firebase Function: `functions/index.js`

## Critical constraints

1. `js/state.js` currently contains mixed paradigms (legacy + newer store model).
2. `js/saveManager.js` still references legacy symbols.
3. Tests partially target legacy API.
4. Edge Functions above are deployed **with JWT verification** (no `--no-verify-jwt` in `deploy:*` scripts). Use `supabase.functions.invoke` only with an authenticated user session, or pass a valid user `Authorization` bearer for non-browser callers. See `docs/SETUP.md`.

Before deep edits:
- read `docs/KNOWN_ISSUES.md`
- align on one data model first

## Safe change strategy

1. Change one vertical slice at a time (state + tab + save + tests).
2. Run `npm run test`.
3. If publish path touched, validate:
   - Edge function payload shape
   - Firebase function expected schema (`words`, `families`, `id`)

## Documentation policy for agents

Any non-trivial change must update relevant docs in `docs/`.
