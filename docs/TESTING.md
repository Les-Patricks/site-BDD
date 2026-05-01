# Tests et qualite

## Tests unitaires

Framework: Vitest.

Commandes:

```bash
npm run test
npm run test:watch
```

Config: `vitest.config.js`
- alias CDN Supabase -> package npm pour les mocks
- environnement `node`
- couverture V8, sortie texte + lcov

## Suites actuelles

- `js/tests/state.test.js`
- `js/tests/state.unified.contract.test.js`
- `js/tests/state.persistence.test.js`
- `js/tests/SupabaseManager.test.js`

## Attention importante

Les suites `state` sont maintenant alignees sur l'API unifiee de `js/state.js`.

Repartition:
- `state.test.js`: comportements coeur et invariants du store unifie.
- `state.unified.contract.test.js`: contrat API cible + cas limites metier.
- `state.persistence.test.js`: integration de `save()`/`publish()` via mocks des dependances externes.

## Matrice CA -> T (Ticket 01)

- `CA-01` -> `T-01`: `state.unified.contract.test.js` / "exposes expected ticket API", "matches expected function arity from contract".
- `CA-02` -> `T-02`: `state.test.js` / "creates entities and links word to family", "keeps changeWord constrained by uniqueness", `state.unified.contract.test.js` / "keeps empty-string translation until explicit removeTranslation".
- `CA-03` -> `T-03`: `state.unified.contract.test.js` / "does not duplicate word ids in a family", `state.test.js` / "removes a word from a family without touching others".
- `CA-04` -> `T-04`: `state.test.js` / "cleans family links when deleting a word", "removes translation explicitly and cascades language deletion", `state.unified.contract.test.js` / "deleting a language removes only that language translations".
- `CA-04bis` -> `T-04bis`: `state.unified.contract.test.js` / "keeps empty-string translation until explicit removeTranslation".
- `CA-05` -> `T-05`: `state.persistence.test.js` / "persists current store shape across all Supabase tables", "applies deletions for removed language/word/family entities", "clears change tracking after successful save".
- `CA-06` -> `T-06`: `state.persistence.test.js` / "delegates publish() to databaseTransfer", "propagates publish errors from databaseTransfer".
- `CA-07` -> `T-07`: execution cible `npm run test` + couverture et suites `state.*` alignees modele unifie.

## Exclusions justifiees

- UI rendering detail (`tabs/*`, classes CSS, labels) n'est pas teste ici: hors contrat metier de Ticket 01, couvert par verification manuelle et tests d'integration UI ulterieurs.
- Reseau réel Supabase/Firebase non teste en CI unitaire: volontairement mocke pour determinisme, cout et fiabilite.
- Performance/load tests exclus: hors perimetre fonctionnel de la migration store unifie.

## Qualite continue

- SonarCloud lance sur push `main` et sur PR
- Workflow: `.github/workflows/sonar.yml`
- Etapes: install, test couverture, analyse sonar
