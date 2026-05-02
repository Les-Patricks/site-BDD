# Plan technique - Ticket 08

## Objectif technique
Implementer une logique fiable de visibilite du bouton `Publish` basee sur un etat persistant `publish_pending` cote Supabase, sans lecture Firestore au bootstrap.

## Strategie d'implementation

### 1) Introduire un etat persistant de publication en attente
- Ajouter un champ persistant `publish_pending` dans Supabase via une table singleton `public.admin_state`.
- Schema cible:
  - `id text primary key` (ligne unique: `global`)
  - `publish_pending boolean not null default false`
  - `updated_at timestamptz not null default now()`
- Valeur attendue:
  - `true` apres un `save()` reussi;
  - `false` apres un `publish()` reussi.

### 2) Mettre a jour les flux existants sans casser les contrats
- Flux `save()`:
  - conserver le contrat actuel (succes/erreur).
  - ajouter la mise a jour de `publish_pending=true` uniquement apres succes confirme.
- Flux `publish()`:
  - conserver le contrat actuel (succes/erreur).
  - ajouter la mise a jour de `publish_pending=false` uniquement apres succes confirme.

### 3) Piloter l'UI au bootstrap
- Au chargement de l'app, lire `publish_pending` depuis `public.admin_state` (`id='global'`).
- Mapper l'etat vers l'UI:
  - `true` => afficher `Publish`;
  - `false` (ou absent selon regle de fallback) => masquer `Publish`.
- Assurer un comportement non bloquant si la lecture echoue (fallback safe + log minimal).

### 4) Couverture de tests
- Ajouter/adapter des tests pour:
  - bootstrap avec `publish_pending=true` => `Publish` visible;
  - bootstrap avec `publish_pending=false` => `Publish` masque;
  - non-regression des parcours `save` et `publish`.

### 5) Documentation
- Mettre a jour la documentation workflow concernee une fois l'implementation validee.

## Decoupage en sous-etapes Green (diff par diff)
1. Brancher la lecture bootstrap de `publish_pending` et mapping UI minimal.
2. Brancher `save()` -> `publish_pending=true` apres succes.
3. Brancher `publish()` -> `publish_pending=false` apres succes.
4. Ajouter/adapter les tests cibles.
5. Mettre a jour la doc workflow.

## Impacts fichiers probables
- `js/main.js` (ou point bootstrap equivalent)
- `js/saveManager.js` et/ou `js/state.js`
- `js/publish.js` et/ou `js/databaseTransfer.js`
- `js/SupabaseManager.js` (si helper requis)
- `js/tests/*` (tests ticket et non-regression)
- `docs/WORKFLOWS.md` (si necessaire)

## Risques et mitigations
- **Risque**: flag desynchronise si maj partielle.
  - **Mitigation**: ecrire le flag uniquement en succes confirme.
- **Risque**: ambiguite sur la valeur par defaut en l'absence de flag.
  - **Mitigation**: fixer une regle explicite (default `false` ou migration douce).
- **Risque**: regression UX au chargement.
  - **Mitigation**: bootstrap non bloquant + tests d'etat UI.

## Plan de verification
- Tests unitaires/integration cibles sur les cas pending true/false.
- Verification manuelle:
  1) faire une modification -> `save` -> reload => `Publish` visible;
  2) lancer `publish` reussi -> reload => `Publish` masque;
  3) simuler erreur reseau bootstrap => UI reste utilisable.
