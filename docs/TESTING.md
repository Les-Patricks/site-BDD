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
- environnement `node` par défaut ; un fichier peut forcer **jsdom** avec `/** @vitest-environment jsdom */` en tête (ex. `tab-search.test.js`, `modal.test.js`, `dom.helpers.test.js`, `validation.dom.test.js`)
- couverture V8, sortie texte + lcov

## Suites actuelles

- `js/tests/state.test.js`
- `js/tests/state.unified.contract.test.js`
- `js/tests/state.persistence.test.js`
- `js/tests/SupabaseManager.test.js`
- `js/tests/jwt.contract.test.js` — scripts `deploy:*` sans `--no-verify-jwt`, chemins `functions.invoke` ; test distant optionnel `RUN_JWT_GATE_TEST=1` (attend **401** sans `Authorization` sur `publish-to-firebase`, `admin-save`, `admin-bootstrap` une fois JWT actif en runtime).
- `js/tests/sonar.workflow.contract.test.js` — contrat `.github/workflows/sonar.yml` (job **SonarCloud**, declencheurs, ordre `npm run test` puis scan).
- `js/tests/firebase.merge.workflow.contract.test.js` — contrat `.github/workflows/firebase-hosting-merge.yml` (push `main` / `dev`, canaux `live` et `dev`).
- `js/tests/notify.test.js` — module `js/notify.js` (durees, error persistant + bouton Fermer, pas d’`alert`). Reference comportementale : `docs/NOTIFICATIONS.md`.
- `js/tests/saveManager.notify.test.js` — branchement `saveManager` → `notify` (succes 2,5 s, erreur).
- `js/tests/main.bootstrap.test.js` — echec `admin-bootstrap` : `notify.error`, banniere, boutons desactives, pas d’hydratation ni premier clic onglet.
- `js/tests/bootstrap.loading.test.js` — indicateur de chargement bootstrap : retrait du loader en succes/erreur, non-regression sur l'etat `Publish`, robustesse si `#bootstrapLoadingRoot` est absent.
- `js/tests/tabAdd.notify.contract.test.js` — appels `notify` dans les onglets (ajout, renommage, suppression) + contrat `durationMs: 2500` sur les succès courts (lecture source).
- `js/tests/tab-search.test.js` — filtre client-side des barres de recherche Mots / Familles (`computeFilterState`, libellé racine accordéon via `getRowSearchLabel`). Fichier en environnement **jsdom** (directive `@vitest-environment jsdom`).
- `js/tests/tabAddSystem.test.js`, `saveBtn.test.js`, `customContextMenu.test.js`, `modal.test.js`, `dom.helpers.test.js`, `accordion.component.test.js` — **jsdom** : formulaires d’ajout d’onglet, bouton Save, menu contextuel, modales mot/famille, helpers `dom.js`, creation d’accordéon (chemins delete / onAdd). `loginValidation.test.js` / `validation.dom.test.js` : validation login.

## Verification manuelle (recherche onglets)

Onglets **Famille de mots** et **Mots** uniquement (pas de barre sur Langues).

1. Saisir une sous-chaîne du nom affiché d’une ligne : les lignes non correspondantes disparaissent.
2. Effacer le champ : toutes les lignes réapparaissent ; plus de message « Aucun resultat ».
3. Saisir une requête sans aucun match : message « Aucun resultat » sous la liste.
4. Bouton loupe et touche Entrée : même filtre ; la vue se repositionne sur la première ligne encore visible.
5. Basculer entre Familles et Mots : la recherche d’un onglet ne filtre pas l’autre.
6. Avec une recherche active, ajouter une famille ou un mot : la nouvelle ligne doit respecter le filtre (masquée si elle ne matche pas) sans avoir besoin de retaper la requête.

## Verification manuelle (accordion Chrome)

Navigateur cible: Chrome (version stable recente), zoom 100%.

1. Onglet **Famille de mots**: avec tous les accordions fermes, verifier qu'aucun premier mot enfant n'est visible au-dessus de la ligne parent.
2. Ouvrir un accordion: la transition doit etre fluide (pas d'ouverture instantanee).
3. Fermer le meme accordion: le contenu enfant doit disparaitre completement (aucune fuite visuelle du premier mot).
4. Reouvrir/fermer rapidement 3-4 fois de suite: pas de blocage en etat intermediaire, pas de depassement.
5. Refaire les etapes 1-4 dans l'onglet **Mots**.

## Attention importante

Les suites `state` sont maintenant alignees sur l'API unifiee de `js/state.js`.

Repartition:
- `state.test.js`: comportements coeur et invariants du store unifie.
- `state.unified.contract.test.js`: contrat API cible + cas limites metier.
- `state.persistence.test.js`: integration de `save()`/`publish()` via mocks des dependances externes.

## Exclusions justifiees

- UI rendering detail (`tabs/*`, classes CSS, labels) n'est pas teste ici: couvert par verification manuelle et tests d'integration UI (exception ciblee : recherche onglets via `tab-search.test.js`).
- Reseau réel Supabase/Firebase non teste en CI unitaire: volontairement mocke pour determinisme, cout et fiabilite.
- Performance/load tests exclus: hors perimetre fonctionnel du store unifie.

## Qualite continue

- **Deploiement Hosting** (independant de Sonar) : voir `docs/WORKFLOWS.md` §6 — push `main` → canal `live`, push `dev` → canal `dev` ; les previews PR utilisent un autre workflow.
- SonarCloud lance sur push `main` et sur PR
- Workflow: `.github/workflows/sonar.yml`
- Job GitHub Actions: `sonarcloud` (nom du check sur la PR: **SonarCloud**)
- Etapes dans ce job: install dependances, `npm run test` (couverture), scan SonarCloud (quality gate et regles selon le projet SonarCloud)
- Exclusions de couverture cote Sonar (`sonar.coverage.exclusions` dans `sonar-project.properties`) : gabarit `supabase-config.example.js` et stub Vitest `supabase-config.stub.js` ne comptent pas dans la couverture « new code ». Le rapport `npm run test` local peut encore les afficher a 0 %.

### Merge et branch protection

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
