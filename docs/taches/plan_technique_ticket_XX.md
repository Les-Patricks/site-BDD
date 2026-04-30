# Plan technique - Ticket 01

## 1. Objectif et alignement cible

Finaliser la migration vers un store unique en supprimant la cohabitation legacy/nouveau modele, avec:

- une seule source de verite `store = { languages, words, families }`;
- une seule API publique de lecture/ecriture/persistance;
- un flux `save` (Supabase) et `publish` (Firebase) non regresse.

Architecture cible de reference:

- `store.languages[languageId] = { displayName }`
- `store.words[wordId] = { displayName, translations: { [languageId]: value } }`
- `store.families[familyId] = { displayName, wordsKeys: [wordId] }`

## 2. Analyse de l'existant

Constats principaux:

1. `js/state.js` expose deja `store` + getters + une partie CRUD cible, **mais** conserve des fonctions legacy actives (`replaceWord`, `replaceLanguage`, `removeLanguage`, `updateTraduction`, etc.) qui referencent des symboles non definis (`wordKeys`, `languageKeys`, `traductions`, ...).
2. `js/saveManager.js` est principalement branche sur les structures legacy et exploite mal `storeChanges` (boucle de suppression invalide sur `storeChanges.deleted`).
3. `js/main.js` charge les donnees Supabase avec des signatures legacy (`addLanguage(language, cb)`, `addWord(word, cb)`, `updateTraduction(...)`, ...).
4. `js/tabs/`* consomment presque uniquement le contrat legacy (`wordKeys`, `languageKeys`, `families`, `replace*`, `removeTraduction`, etc.).
5. `js/tests/state.test.js` est entierement oriente legacy (imports et assertions sur `wordKeys/languageKeys/traductions/...`).

Conclusion: la migration doit etre faite en **vertical slice** (state -> tabs/main -> save -> tests), avec maintien du contrat aval de publication.

## 3. Fichiers a modifier

### Coeur migration (obligatoires)

- `js/state.js`
- `js/main.js`
- `js/tabs/wordTab.js`
- `js/tabs/languageTab.js`
- `js/tabs/familyTab.js`
- `js/saveManager.js`
- `js/tests/state.test.js`

### Documentation (obligatoires selon Definition of Done)

- `docs/KNOWN_ISSUES.md`

### Verification publication (selon impact detecte)

- `js/publish.js`
- `js/databaseTransfer.js`
- `supabase/functions/publish-to-firebase/index.ts`
- `functions/index.js`

## 4. Approche d'integration par etapes

## Etape 0 - Garde-fous avant refacto

- Geler la forme de donnees cible dans `state.js` (JSDoc/types implicites et invariants).
- Definir un mapping clair UI <-> store:
  - l'UI manipule des `id` d'entites;
  - `displayName` est la valeur editable.
- Verrouiller les invariants:
  - pas de doublon dans `family.wordsKeys`;
  - suppression d'un mot => nettoyage des families;
  - suppression d'une langue => suppression des traductions associees.

Livrable: conventions de store ecrites en tete de `state.js` + TODO legacy identifies.

## Etape 1 - Stabiliser `state.js` et API unique

Actions:

- Aligner les signatures sur le contrat ticket:
  - `addWord(displayName)`, `changeWord(wordId, newDisplayName)`, `deleteWord(wordId)`
  - `addLanguage`, `modifyLanguage`, `deleteLanguage`
  - `addTranslation(wordId, languageId, translation)`, `removeTranslation(wordId, languageId)`
  - `addFamily(displayName)`, `modifyFamily`, `removeFamily`, `addWordToFamily`, `removeWordFromFamily`
  - `save()`, `publish()`
  - getters (`getAll`*, `get*`, `getTranslationsForWord`, `getWordsInFamily`)
  - helper utilitaire (non metier): `getIdsByDisplayName(scope, displayName)`
- Supprimer les fonctions et symboles legacy restants (ou les deprecier temporairement avec wrappers internes si necessaire sur 1 iteration max).
- Corriger les anomalies detectees:
  - iteration `for (const wordId in Object.keys(store.words))` -> iteration sur ids reellement exploitables;
  - coherences de nommage (`wordKeys` vs `wordsKeys`, `name` vs `displayName`).
- Rendre `storeChanges` coherent avec le nouveau modele (created/modified/deleted par entite + translations si utile).

Livrable: module `state.js` auto-coherent, sans reference legacy active.

## Etape 2 - Migrer chargement initial (`main.js`)

Actions:

- Adapter `fetchData()` pour hydrater `store` via la nouvelle API:
  - languages -> `addLanguage(displayName)` puis resolution d'ID;
  - words -> `addWord(displayName)` puis resolution d'ID;
  - translations -> `addTranslation(wordId, languageId, value)`;
  - families -> `addFamily(displayName)` puis resolution d'ID;
  - associations -> `addWordToFamily(wordId, familyId)`.
- Eviter les effets de bord UI pendant hydratation (pas de trigger save pendant bootstrap).
- Si necessaire, introduire des helpers d'hydratation dedies pour conserver les IDs issus de la base sans polluer l'API publique CRUD.

Livrable: bootstrap complet sans fonctions legacy.

## Etape 3 - Migrer consommateurs UI (`tabs/*`)

Actions:

- `wordTab.js`: remplacer `wordKeys/traductions/languageKeys/wordModifTime` par getters store (`getAllWords`, `getAllLanguages`, `getWord`...).
- `languageTab.js`: remplacer `languageKeys/languageModifTime/replaceLanguage/removeLanguage` par API cible (`getAllLanguages`, `modifyLanguage`, `deleteLanguage`).
- `familyTab.js`: remplacer `familyKeys/families/replaceFamily` par `getAllFamilies`, `modifyFamily`, `addWordToFamily/removeWordFromFamily`.
- Uniformiser les callbacks de suppression/rename pour manipuler les IDs (pas les labels).

Livrable: tabs consomment uniquement l'API store cible.

## Etape 4 - Rebrancher la persistance (`saveManager.js`)

Actions:

- Introduire un `save()` base sur `store` + `storeChanges` (ou snapshot complet si premier jalon plus fiable).
- Supprimer imports legacy (`wordModifTime`, `traductions`, `languageKeys`, etc.).
- Mettre en correspondance store -> tables Supabase:
  - `languages` -> `language`
  - `words` -> `words`
  - `words[*].translations` -> `word_translation`
  - `families` + `wordsKeys` -> `word_family` + `word_family_association`
- Definir la strategie de suppression (ordre: associations/translations -> entites parentes).
- Sur succes de `save()`: reset `storeChanges`, afficher bouton publish.

Livrable: sauvegarde fonctionnelle sans voie legacy.

## Etape 5 - Mettre a jour les tests

Actions:

- Reecrire `js/tests/state.test.js` autour de l'API cible.
- Supprimer les assertions sur structures legacy.
- Ajouter le test de non-regression minimum exige:
  - CRUD word;
  - mise a jour/suppression traduction;
  - rattachement/retrait famille;
  - verification getters.
- Ajouter un test d'integrite transversale:
  - suppression langue nettoie traductions;
  - suppression mot nettoie families.

Livrable: tests `state` verts et alignes architecture cible.

## Etape 6 - Documentation et cloture

Actions:

- Mettre a jour `docs/KNOWN_ISSUES.md`:
  - clore ou reduire explicitement le point "cohabitation state legacy/store".
- Ajouter note de migration (breaking changes API) si necessaire.

Livrable: documentation coherente avec l'etat reel du code.

## 5. Impact API / donnees

## API front (breaking changes internes)

- Suppression des exports legacy de `state.js`:
  - `wordKeys`, `languageKeys`, `familyKeys`, `traductions`, `replace*`, `removeTraduction`, etc.
- Uniformisation sur API cible orientee IDs + getters.
- `saveManager` passe d'un mode "sets + modifTimes legacy" a un mode "store/storeChanges".

## Donnees locales

- Source unique: `store`.
- `storeChanges` devient l'unique mecanisme de delta pour la persistance.

## Donnees Supabase/Firebase

- Pas de changement de schema metier attendu.
- Vigilance sur shape publication:
  - conserver `words`, `families`, `id` attendus en aval.
- Eventuelle adaptation de mapping uniquement, pas de refonte structurelle.

## 6. Risques et mitigations

1. **Risque: regression save/publish**
  - Mitigation: tests integration save + verification payload publish en fixture.
2. **Risque: rupture UI tab suite a suppression API legacy**
  - Mitigation: migration tab par tab, merge uniquement quand tab compile + scenario smoke passe.
3. **Risque: incoherence IDs vs displayName**
  - Mitigation: regle stricte: les relations utilisent IDs, l'UI affiche `displayName`.
4. **Risque: suppressions partielles (translations/associations orphelines)**
  - Mitigation: ordre de suppression explicite + tests d'integrite.
5. **Risque: dette temporaire de compatibilite**
  - Mitigation: si wrappers legacy temporaires, les marquer deprecie et les supprimer dans le meme ticket avant cloture.

## 7. Strategie de tests a prevoir

## Unitaires (`js/tests/state.test.js`)

- CRUD language/word/family.
- Traductions: ajout/modification/suppression explicite.
- Integrite referentielle:
  - deleteLanguage nettoie `word.translations[languageId]`;
  - deleteWord nettoie `family.wordsKeys`.
- Getters sur store vide et non vide.

## Integration front

- Bootstrap `main.js` depuis donnees Supabase mockees.
- Rendu tabs apres hydratation.
- Scenario utilisateur minimum:
  - ajouter mot + traduction + famille;
  - save;
  - relire et verifier coherence.

## Non-regression save/publish

- Test save: verifie operations attendues sur tables `language`, `words`, `word_translation`, `word_family`, `word_family_association`.
- Test publish (ou smoke): verifie la shape transmise aux couches aval (`words`, `families`, `id`).

## 8. Ordre de livraison recommande

1. `state.js` (API cible stable)
2. `main.js` (hydratation cible)
3. `tabs/`* (consommateurs)
4. `saveManager.js` (`save()` cible)
5. `state.test.js` + tests integration
6. `docs/KNOWN_ISSUES.md`

Critere go/no-go a chaque etape:

- build/tests locaux passent;
- aucun import legacy reintroduit;
- scenario CRUD + save smoke valide.

## 9. Definition of Done (operationnelle)

- Plus aucune reference active legacy dans `state.js`, `tabs/*`, `main.js`, `saveManager.js`, `state.test.js`.
- `npm run test` vert sur les tests mises a jour.
- Save fonctionne sur le modele unifie.
- Publish reste compatible avec la shape aval.
- `docs/KNOWN_ISSUES.md` mis a jour avec statut explicite du sujet de migration.

