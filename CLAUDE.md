# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Bluffers BDD** — backoffice for vocabulary database management. Editors manage words, languages, and word families. Data lives in Supabase (PostgreSQL); publishing snapshots to Firebase Firestore for public game consumption.

## Commands

```bash
# Tests (run once with coverage)
npm test

# Tests in watch mode
npm run test:watch

# Run a single test file
npx vitest run js/tests/state.test.js

# Deploy Supabase Edge Functions
npm run deploy:publish
npm run deploy:admin-bootstrap
npm run deploy:admin-save

# Deploy Firebase Functions (run inside functions/)
cd functions && npm run deploy
```

No linter or TypeScript configured (`lint` and `typecheck` scripts are no-ops).

## Architecture

```
index.html              → auth guard + HTML templates (cloned by JS)
login.html              → separate auth page (Supabase sign-in)
js/main.js              → entry point: data fetch, state hydration, tab wiring
js/state.js             → singleton in-memory store (Sets + plain objects, no reactivity)
js/SupabaseManager.js   → fluent query wrapper around Supabase SDK v2 (singleton — don't create new clients)
js/saveManager.js       → orchestrates save UI; delegates persistence to state.save()
js/publish.js           → confirmation flow → databaseTransfer.js
js/databaseTransfer.js  → invokes Supabase Edge Function → Firebase Firestore
js/dom.js               → DOM helpers: createDOMElement, insertElementAt, createLanguageItem
js/modal.js             → floating context menus positioned by click coordinates
js/notify.js            → non-blocking toasts (save, publish, login, errors)
js/validation.js        → DOM + Supabase sign-in flow
js/loginValidation.js   → pure field validation rules (unit-tested, no browser needed)
js/tabs/                → familyTab.js, wordTab.js, languageTab.js (tab render + CRUD)
js/components/          → accordion.js (template-cloning helper)
js/ui/                  → AccordionView.js, autocomplete.js, saveBtn.js, tabAddSystem.js, customContextMenu.js, tabSearch.js
functions/index.js      → Firebase Cloud Function (Node.js) — receives publish payload, writes Firestore
supabase/functions/     → Deno Edge Functions (admin-bootstrap, admin-save, publish-to-firebase)
supabase/migrations/    → PostgreSQL migrations
```

**Data flow:** Live edits → `state.js` (in-memory) → Save → Supabase → Publish → Firebase Firestore

## Supabase Schema

| Table | Key Columns |
|-------|-------------|
| `language` | `language_id` (PK), `name` |
| `words` | `word_id` (PK) |
| `word_translation` | `word_id`, `language_id`, `value` |
| `word_family` | `word_family_id` (PK) |
| `word_family_association` | `word_id`, `word_family_id` |

Firebase Firestore: `Words`, `WordFamilies` collections (bulk-replaced on publish).

## Conventions

**JavaScript:** Vanilla ES Modules, no bundler, no framework. `camelCase` / `PascalCase` / `SCREAMING_SNAKE_CASE`. Async/await for all Supabase operations.

**State mutations** go through functions in `state.js` (`addWord()`, `removeLanguage()`, etc.). Deletions are tracked in Sets (`wordToDelete`, `languageToDelete`, etc.) and applied on save. No reactivity — UI re-renders by re-calling render functions on tab change.

**DOM patterns:**
- Repeated elements use `<template>` cloning: `template.content.cloneNode(true).querySelector(...)`
- CSS follows BEM: `.accordion-item`, `.accordion-item__button`, `.accordion-item--hidden`
- Visibility toggled via CSS classes (`.hidden`, `.tab-panel--open`) — never inline styles
- Template IDs: `#accordion`, `#accordionAddForm`, `#languageItemTemplate`, `#traductionItemTemplate`, `#editSystemTemplate`
- Use `e.stopPropagation()` on nested click handlers to prevent accordion collapse

**Notifications:** Use `js/notify.js` toasts for user feedback (save, CRUD actions, errors). No `alert()` on critical flows. CRUD actions use `durationMs: 2500` for success, warning toast for duplicates.

**Testing:**
- Vitest + jsdom; tests live in `js/tests/`, named `*.test.js` or `ticket_NN.*.test.js`
- Mock Supabase `createClient`, `js/ui/autocomplete.js`, and browser `alert()`
- Reset state in `beforeEach()`. Test labels written in French.
- Supabase config is gitignored; tests use `js/supabase-config.stub.js`

## Critical Constraints

- **Supabase client is a singleton** in `SupabaseManager.js` — never instantiate elsewhere.
- **Edge Functions use Deno** (not Node.js) — use `Deno.env.get()` and Deno-compatible imports. Deployed with JWT verification — call via `supabase.functions.invoke` with authenticated session.
- **CORS:** Any new `https://…` origin served by Firebase Hosting must be added to `allowedOrigins` in all three Edge Functions and redeployed. See `docs/WORKFLOWS.md` §6.
- **Merge to `main` is blocked** until the GitHub required check **SonarCloud** (job in `.github/workflows/sonar.yml`) passes. Do not rename that job or remove `npm run test` from it without updating `js/tests/ticket_06.sonar.workflow.contract.test.js`.
- **CI writes `js/supabase-config.js`** from `SUPABASE_URL` / `SUPABASE_ANON_KEY` secrets before deploying Hosting — the file is gitignored. Copy `js/supabase-config.example.js` locally.
- `languageItemName.innerHTML` seeds edit inputs — use `.textContent` for display, `.innerHTML` only when rich content is needed.

## Safe Change Strategy

1. Change one vertical slice at a time: state + tab + save + tests.
2. Run `npm test` before committing.
3. Any non-trivial change must update relevant docs in `docs/`.
4. Before deep edits to `state.js` or `saveManager.js`, read `docs/KNOWN_ISSUES.md`.
5. If publish path is touched, validate Edge Function payload shape and Firebase Function expected schema (`words`, `families`, `id`).
