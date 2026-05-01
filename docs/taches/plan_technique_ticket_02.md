# Plan technique local - Ticket 02

## 1. Fichiers a modifier

- `js/main.js`  
  **Rationale** : remplace les lectures initiales table par table (`fetchFromTable("language" | "words" | ...)`) par un appel unique a une API metier de bootstrap.  
  **Niveau d'impact** : eleve (point d'entree front, conditionne le chargement initial).

- `js/saveManager.js`  
  **Rationale** : remplace les ecritures/suppressions directes (`addLanguagesInTable`, `addWordsInDataBase`, `addInTable`, `deleteFromTable`) par un endpoint metier de sauvegarde.  
  **Niveau d'impact** : eleve (flux critique `save()`).

- `js/SupabaseManager.js`  
  **Rationale** : retirer l'usage CRUD direct cote UI et conserver uniquement les usages legitimes restants (ex: `functions.invoke` si necessaire) ou deplacer vers couche API metier.  
  **Niveau d'impact** : eleve (point de couplage actuel front <-> tables).

- `js/databaseTransfer.js`  
  **Rationale** : verifier que `publishDatabase()` reste fonctionnel apres migration et que le contrat de publication n'est pas altere.  
  **Niveau d'impact** : moyen (flux `publish()` deja via Edge Function, verification de non-regression).

- `js/tests/SupabaseManager.test.js`  
  **Rationale** : adapter les tests de la couche d'acces donnees pour refléter la nouvelle responsabilite (API metier/front client) et la suppression des appels table directs depuis le front.  
  **Niveau d'impact** : moyen.

- `js/tests/state.test.js`  
  **Rationale** : conserver la couverture de la logique metier locale (state) et verifier qu'elle reste compatible avec le nouveau chemin de sauvegarde.  
  **Niveau d'impact** : faible a moyen.

- `supabase/functions/admin-bootstrap/index.ts` (nouveau)  
  **Rationale** : fournir un endpoint metier unique pour les lectures initiales (langues, mots, traductions, familles, associations).  
  **Niveau d'impact** : eleve (nouvelle interface serveur pour `CA-001`).

- `supabase/functions/admin-bootstrap/supabaseClient.ts` (nouveau, ou mutualisation)  
  **Rationale** : acces service-role cote Edge Function pour lecture metier centralisee.  
  **Niveau d'impact** : moyen.

- `supabase/functions/admin-save/index.ts` (nouveau)  
  **Rationale** : endpoint metier pour traiter le payload de sauvegarde (upsert + deletions) de maniere transactionnelle ou pseudo-transactionnelle.  
  **Niveau d'impact** : eleve (nouvelle interface serveur pour `CA-002`, `CA-005`, `CA-006`).

- `supabase/functions/admin-save/supabaseClient.ts` (nouveau, ou mutualisation)  
  **Rationale** : acces service-role cote Edge Function pour ecriture metier centralisee.  
  **Niveau d'impact** : moyen.

- `supabase/functions/publish-to-firebase/index.ts`  
  **Rationale** : pas de refonte fonctionnelle, seulement verification de compatibilite du schema attendu en sortie (`words`, `families`).  
  **Niveau d'impact** : faible (validation de contrat `CA-008`).

## 2. Approche par etapes

- **Etape 1 - Introduire un client API metier front (diff atomique 1)**  
  Creer une couche `invokeBusinessApi` (ou equivalent) responsable des appels `supabase.functions.invoke`, de la normalisation d'erreurs (timeout/5xx), et des contrats d'entree/sortie front.

- **Etape 2 - Migrer le chargement initial (diff atomique 2)**  
  Remplacer dans `main.js` la sequence de `fetchFromTable(...)` par un appel unique `admin-bootstrap`, puis hydrater le state local avec les memes fonctions existantes (`addLanguage`, `addWord`, `updateTraduction`, `addFamily`, `addWordToFamily`).

- **Etape 3 - Migrer `save()` vers endpoint metier (diff atomique 3)**  
  Remplacer dans `saveManager.js` toute la logique CRUD directe par construction d'un payload metier unique et appel `admin-save`; conserver la logique UI existante (etat bouton, feedback, affichage `publish`).

- **Etape 4 - Implementer les Edge Functions metier (diff atomique 4)**  
  Ajouter `admin-bootstrap` et `admin-save` avec controles CORS, validation minimale de payload, et logique serveur equivalent fonctionnel de l'existant (sans changer le modele de donnees).

- **Etape 5 - Renforcer non-regression publish + contrats (diff atomique 5)**  
  Valider que `publish()` reste inchange cote UX et que le format `publish-to-firebase` est compatible; ajouter assertions/tests de contrat sur la structure `words/families`.

- **Etape 6 - Adapter et completer les tests (diff atomique 6)**  
  Mettre a jour les tests unitaires pour mocker les endpoints metier (au lieu des tables), couvrir erreurs reseau/api et scenarios no-op de sauvegarde.

## 3. Impact API/donnees

- **Endpoints ajoutes**  
  - `admin-bootstrap` (Edge Function, lecture)  
    - Entree: aucune (ou filtre optionnel).  
    - Sortie:  
      - `languages[]` (`language_id`, `name`, `modification_date`)  
      - `words[]` (`word_id`, `modification_date`)  
      - `translations[]` (`word_id`, `language_id`, `value`)  
      - `families[]` (`word_family_id`, `modification_date`)  
      - `familyAssociations[]` (`word_id`, `word_family_id`)
  - `admin-save` (Edge Function, ecriture)  
    - Entree: payload unique reprenant les donnees d'etat front + listes de suppression.  
    - Sortie: statut d'execution (`ok`, erreurs metier/techniques detaillees).

- **Schemas / tables**  
  Aucune migration schema requise dans ce ticket (contraintes ticket: pas de changement de modele metier).

- **Breaking changes**  
  - Cote front: **oui (interne)**, remplacement des appels table directs par endpoints metier.  
  - Cote contrat fonctionnel utilisateur: **non** (tabs/save/publish inchanges visuellement).  
  - Cote publication Firebase: **non** attendu, contrat maintenu.

## 4. Tracabilite RM/CA -> code

- `RM-001` / `CA-001` / `CA-006`  
  - `js/main.js` (fonction de chargement initial)  
  - `supabase/functions/admin-bootstrap/index.ts`  
  - client API metier front (nouveau module)

- `RM-002` / `CA-002` / `CA-005` / `CA-006`  
  - `js/saveManager.js` (handler `saveBtn`)  
  - `supabase/functions/admin-save/index.ts`  
  - client API metier front (nouveau module)

- `RM-003` / `CA-003` / `CA-004`  
  - `js/main.js` (tabs + initialisation UI)  
  - `js/publish.js` (flux publish existant)  
  - `js/saveManager.js` (transition save -> publish button)

- `RM-004` / `CA-003` / `CA-008`  
  - `js/databaseTransfer.js` (`publishDatabase`)  
  - `supabase/functions/publish-to-firebase/index.ts` (format `words/families`)

- `RM-005` / `CA-007`  
  - `js/main.js` (suppression `fetchFromTable` direct)  
  - `js/saveManager.js` (suppression `addInTable`/`deleteFromTable` directs)  
  - `js/SupabaseManager.js` (recentrage responsabilites)

## 5. Risques locaux

- `RISK-LOC-001` : divergence de payload entre front et `admin-save`.  
  **Mitigation** : definir un schema JSON explicite (types/champs obligatoires) + validation serveur en entree + tests de contrat.

- `RISK-LOC-002` : regression UX (latence/etat boutons) lors du passage a un appel unique API.  
  **Mitigation** : conserver strictement les transitions UI existantes (`Saving...`, classes CSS, `displayPublishBtn`) et ajouter tests UI ciblant ces etats.

- `RISK-LOC-003` : perte partielle de donnees en cas d'erreur en milieu de sauvegarde.  
  **Mitigation** : traitement serveur ordonne, strategie pseudo-transactionnelle (controle d'erreur central) et retour d'erreur exploitable cote front.

- `RISK-LOC-004` : reintroduction accidentelle d'appels CRUD directs dans `main.js`/`state.js`.  
  **Mitigation** : assertion de code review + test statique simple (recherche patterns `from("...")`/helpers CRUD dans fichiers interdits).

- `RISK-LOC-005` : incompatibilite du flux `publish-to-firebase` avec donnees post-save.  
  **Mitigation** : test d'integration end-to-end `save -> publish` sur jeu de donnees de reference et verification du shape JSON sortant.

## 6. Tests prevus

- **Sous-etape 1 (client API metier)**  
  Type: unitaires (mock `functions.invoke`).  
  Couvre: `CA-006`.

- **Sous-etape 2 (chargement initial via `admin-bootstrap`)**  
  Type: integration front (mock endpoint) + smoke manuel UI.  
  Couvre: `CA-001`, `CA-004`.

- **Sous-etape 3 (save via `admin-save`)**  
  Type: integration front + unitaires payload builder.  
  Couvre: `CA-002`, `CA-005`, `CA-006`.

- **Sous-etape 4 (Edge Functions metier)**  
  Type: tests d'integration serveur (payload valide/invalide, erreurs DB).  
  Couvre: `CA-001`, `CA-002`, `CA-005`, `CA-006`, `CA-007`.

- **Sous-etape 5 (publish + contrats)**  
  Type: test d'integration E2E `save -> publish` + test contrat JSON.  
  Couvre: `CA-003`, `CA-008`.

- **Sous-etape 6 (non-regression globale)**  
  Type: regression suite existante (`state.test.js` + suites adaptees).  
  Couvre: `CA-004` et verification transversale `CA-001..CA-008`.

## Auto-controle

- (a) Chaque CA a un emplacement code identifie : **OK** (`CA-001..CA-008` traces dans section 4 + 6).  
- (b) Aucune sous-etape n'est trop large : **OK** (6 diffs atomiques, chacun testable independamment).  
- (c) Les risques sont mitiges : **OK** (`RISK-LOC-001` a `RISK-LOC-005` avec mitigation explicite).
