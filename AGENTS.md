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
- Toasts / notifications UI: `js/notify.js`, `css/notify.css`, reference `docs/NOTIFICATIONS.md`
- Tab search (Familles / Mots): `js/ui/tabSearch.js` (init in `js/main.js`; `refreshTabSearch` from `js/tabs/familyTab.js` and `js/tabs/wordTab.js` after list changes). Manual checklist: `docs/TESTING.md` (ticket 13).
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
3. **Merge sur branche protegee** (ex. `main`) : le check GitHub requis est en general le job **SonarCloud** du workflow `.github/workflows/sonar.yml` (tests Vitest + analyse Sonar / quality gate). Ne pas renommer ce job ni retirer `npm run test` sans mettre a jour la doc et le test de contrat `js/tests/ticket_06.sonar.workflow.contract.test.js`. Voir `docs/TESTING.md` (*Merge et branch protection*).
4. **Firebase Hosting** : push `main` → canal `live`, push `dev` → canal `dev` (`.github/workflows/firebase-hosting-merge.yml`). Toute **nouvelle** origine `https://…` servie par Hosting pour le backoffice doit etre refletee dans **`allowedOrigins`** des Edge Functions (`admin-bootstrap`, `admin-save`, `publish-to-firebase`) puis redeployees. Voir `docs/WORKFLOWS.md` §6.
5. If publish path touched, validate:
   - Edge function payload shape
   - Firebase function expected schema (`words`, `families`, `id`).

## Documentation policy for agents

Any non-trivial change must update relevant docs in `docs/`.
