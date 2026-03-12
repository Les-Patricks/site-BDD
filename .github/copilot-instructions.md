# Site-BDD Project Guidelines

## Project Overview

"Bluffers BDD" — a vocabulary database editor. Editors manage words, languages, and word families via a tab-based UI. Data lives in Supabase (PostgreSQL), and publishing snapshots it to Firebase Firestore for public consumption.

## Architecture

```
index.html          → auth guard + HTML templates (cloned by JS)
js/main.js          → entry point: data fetch, state population, tab wiring
js/state.js         → singleton in-memory store (Sets + plain objects, no reactivity)
js/SupabaseManager.js → fluent query wrapper around Supabase SDK v2
js/saveManager.js   → batch upsert/delete to Supabase on save
js/publish.js       → confirmation flow → databaseTransfer.js
js/databaseTransfer.js → invokes Supabase Edge Function → Firebase Firestore
js/dom.js           → DOM helpers: createDOMElement, insertElementAt, createLanguageItem, etc.
js/modal.js         → floating context menus (rename/delete) positioned by click coordinates
js/tabs/            → familyTab.js, wordTab.js, languageTab.js (tab-specific render + CRUD)
js/components/      → accordion.js (template-cloning helper)
js/ui/              → AccordionView.js, autocomplete.js, saveBtn.js, tabAddSystem.js
functions/          → Firebase Cloud Function (Node.js) — receives publish payload
supabase/functions/ → Deno Edge Function publish-to-firebase
```

**Data flow:** Live edits → in-memory state → Save button → Supabase → Publish button → Firebase

## Build, Test, and Deploy Commands

```bash
# Run unit tests (once)
npm test

# Run tests in watch mode
npm run test:watch

# Start Firebase Functions emulator (run inside functions/)
cd functions && npm run serve

# Deploy Firebase Functions (run inside functions/)
cd functions && npm run deploy

# Deploy Supabase Edge Function
npm run deploy:publish
```

## Supabase Schema (5 tables)

| Table | Key Columns |
|-------|-------------|
| `language` | `language_id` (PK), `name` |
| `words` | `word_id` (PK) |
| `word_translation` | `word_id`, `language_id`, `value` |
| `word_family` | `word_family_id` (PK) |
| `word_family_association` | `word_id`, `word_family_id` |

Firebase Firestore collections: `Words`, `WordFamilies` (write-only, bulk-replaced on publish).

## Conventions

**JavaScript:**
- Vanilla ES Modules — no bundler, no framework
- `camelCase` for variables/functions, `PascalCase` for class/constructor names, `SCREAMING_SNAKE_CASE` for top-level constants
- Async/await for all Supabase operations; catch errors with `try/catch` and `alert()` for user-visible failures
- `e.stopPropagation()` on nested click handlers to prevent accordion collapse

**State management:**
- Mutations go through state functions in `state.js` (e.g., `addWord()`, `removeLanguage()`)
- Deletion is tracked via `wordToDelete`, `languageToDelete`, etc. Sets — applied on save
- No reactivity; UI re-renders by re-calling render functions when tabs change

**DOM patterns:**
- Repeated elements use `<template>` cloning: `template.content.cloneNode(true).querySelector(...)`
- Use `dom.js` helpers (`createDOMElement`, `insertElementAt`) for one-off elements
- CSS follows BEM: `.accordion-item`, `.accordion-item__button`, `.accordion-item--hidden`
- Visibility toggled via CSS classes (`.hidden`, `.tab-panel--open`) — never inline styles
- Template IDs: `#accordion`, `#accordionAddForm`, `#languageItemTemplate`, `#traductionItemTemplate`, `#editSystemTemplate`

**Testing:**
- Framework: Vitest; tests live next to source (`*.test.js`)
- Mock external dependencies: Supabase `createClient`, `ui/autocomplete.js`, browser `alert()`
- Reset state in `beforeEach()`; unit tests only (no integration tests)
- Test labels are in French (e.g., `"ajoute un mot valide"`)

## Key Pitfalls

- `languageItemName.innerHTML` is used for edit-input seeding — prefer `.textContent` for display, `.innerHTML` only when rich content is involved
- The Supabase client is a singleton exported from `SupabaseManager.js`; do not create new clients elsewhere
- `index.html` is the app shell; `login.html` is a separate page — auth redirect is handled by the inline script at the top of `index.html`
- Supabase Edge Function uses Deno (not Node.js) — use `Deno.env.get()` and Deno-compatible imports
