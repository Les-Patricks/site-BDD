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
- plugin `resolveId` : en tests, les imports de `js/supabase-config.js` sont rediriges vers `js/tests/supabase-config.stub.js` (le vrai fichier est gitignore et optionnel en local)
- environnement `node`
- couverture V8, sortie texte + lcov

## Suites actuelles

- `js/tests/state.test.js`
- `js/tests/state.unified.contract.test.js`
- `js/tests/state.persistence.test.js`
- `js/tests/SupabaseManager.test.js`
- `js/tests/ticket_04.jwt.contract.test.js` — scripts `deploy:*` sans `--no-verify-jwt`, chemins `functions.invoke` ; test distant optionnel `RUN_JWT_GATE_TEST=1` (attend **401** sans `Authorization` sur `publish-to-firebase`, `admin-save`, `admin-bootstrap` une fois JWT actif en runtime).
- `js/tests/ticket_06.sonar.workflow.contract.test.js` — contrat `.github/workflows/sonar.yml` (job **SonarCloud**, declencheurs, ordre `npm run test` puis scan).

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
- Job GitHub Actions: `sonarcloud` (nom du check sur la PR: **SonarCloud**)
- Etapes dans ce job: install dependances, `npm run test` (couverture), scan SonarCloud (quality gate et regles selon le projet SonarCloud)

### Merge et branch protection (Ticket 06)

**Reference YAML** (`.github/workflows/sonar.yml`) : workflow `name` **SonarCloud Analysis** ; job id `sonarcloud` ; job `name` **SonarCloud**. Sur la PR, le statut a exiger correspond en general au **nom du job** : **SonarCloud** (si la liste GitHub propose plusieurs libelles, choisir celui qui correspond a ce job apres une PR qui a declenche le workflow).

- Le **check requis pour merger** sur la branche protegee (ex. `main`) doit etre ce **job complet** (pas un workflow separe limite aux tests seuls).
- Tout echec dans ce job bloque le merge : **tests** (`npm run test`), etape **SonarCloud Scan**, ou **quality gate** / regles dans SonarCloud.

**Reglage GitHub (admin)** : Settings → Branches → regle pour `main` (ou branche cible) → cocher *Require status checks to pass before merging* → dans *Required status checks*, ajouter **SonarCloud** (ou le libelle affiche sur une PR apres un run). Option recommandee : *Require branches to be up to date before merging* si deja utilise sur le depot.

**Verification reproductible (preuve merge bloque)** :

PR de test **a ne jamais merger** : titre/description explicites (ex. `[DO NOT MERGE]`), verification uniquement pour constater le blocage ; apres constat, fermer la PR et supprimer la branche (ou revert), sans integrer le commit qui casse les tests.

1. Creer une branche depuis `main`, ajouter un commit qui fait echouer volontairement un test (ex. `expect(true).toBe(false)` dans un fichier de test), pousser et ouvrir une PR vers `main`.
2. Attendre le workflow **SonarCloud Analysis** ; le check **SonarCloud** doit etre **rouge** (echec a l’etape tests, le scan Sonar ne s’execute en general pas ou le job reste en echec).
3. Verifier que la PR **ne peut pas etre mergee** tant que le check requis est rouge (bouton merge desactive ou politique bloquante).
4. Revenir en arriere : retirer le commit de casse ou fermer la PR sans merger.

Meme logique si le quality gate Sonar echoue : le job **SonarCloud** est rouge et le merge reste bloque tant que le check est requis.

**Preuve** : capture des regles de branche (checks requis) et/ou de la PR avec check rouge ; si pas d’acces Settings, le mainteneur valide et la procedure ci-dessus sert de reference.
