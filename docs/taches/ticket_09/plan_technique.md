# Plan technique - Ticket 09

## Objectif technique
Retablir de facon fiable l'etat interactif des boutons `Save` et `Publish` apres echec, afin d'autoriser un retry immediat sans rechargement et sans regression du comportement nominal.

## Strategie d'implementation

### 1) Cartographier les etats UI actuels
- Identifier les points d'entree qui pilotent:
  - le libelle des boutons (`Save` / `Publish` vs `Saving...` / `Publishing...`);
  - l'etat `disabled`/cliquable;
  - la visibilite du bouton `Publish`.
- Verifier les chemins succes/erreur sur:
  - `save()` (pilotage principal dans `js/saveManager.js`);
  - `publish()` (pilotage principal dans `js/publish.js` et eventuels appels `js/databaseTransfer.js`).

### 2) Harmoniser la restauration d'etat apres echec `save()`
- Garantir qu'un echec `save()`:
  - remet le bouton `Save` en libelle nominal;
  - sort de tout etat loading;
  - laisse le bouton cliquable pour retry.
- Faire la restauration dans un point unique (`catch`/`finally`) pour eviter les oublis.

### 3) Harmoniser la restauration d'etat apres echec `publish()`
- Garantir qu'un echec `publish()`:
  - remet le bouton `Publish` en libelle nominal;
  - sort de tout etat loading;
  - conserve la visibilite de `Publish`;
  - laisse le bouton cliquable pour retry.
- Conserver strictement le comportement nominal en succes:
  - `Publish` masque apres succes confirme.

### 4) Stabiliser les helpers UI si necessaire
- Si des helpers existent deja (ex. `js/ui/saveBtn.js`), les reutiliser pour:
  - centraliser `setLoading`/`reset`;
  - eviter la duplication entre `save` et `publish`.
- Sinon, introduire un helper minimal sans refonte large.

### 5) Couverture de tests (Red -> Green)
- Ajouter/adapter des tests cibles:
  - echec `save` => bouton `Save` reutilisable;
  - echec `publish` => bouton `Publish` visible + reutilisable;
  - succes `publish` => `Publish` toujours masque (non-regression).
- Prioriser un test integration ticket dedie + eventuels tests unitaires existants.

## Decoupage en sous-etapes Green (diff par diff)
1. Ecrire/adapter tests Red pour CA-901/902/903/904/905.
2. Corriger la restauration d'etat `save()` pour CA-901.
3. Corriger la restauration d'etat `publish()` pour CA-902/903.
4. Verifier non-regression succes `publish()` pour CA-904.
5. Nettoyer et factoriser minimalement les points UI communs si necessaire.

## Impacts fichiers probables
- `js/saveManager.js`
- `js/publish.js`
- `js/databaseTransfer.js` (si etat secondaire impacte)
- `js/main.js` (si logique de visibilite/lifecycle des boutons)
- `js/ui/saveBtn.js` (si helper reutilisable)
- `js/tests/ticket_02.integration.test.js` et/ou nouveau test `ticket_09`
- Documentation ticket (`docs/taches/ticket_09/*`)

## Risques et mitigations
- **Risque**: etat loading persistant sur un chemin d'erreur non couvert.
  - **Mitigation**: restaurer explicitement en `finally` + tests echec.
- **Risque**: confusion entre regle "masquer Publish en succes" et "garder visible en echec".
  - **Mitigation**: tests distincts succes/erreur + assertions explicites de visibilite.
- **Risque**: dette legacy dans `state.js`/`saveManager.js` perturbant le correctif.
  - **Mitigation**: diff minimal localise, sans refonte structurelle.

## Plan de verification
- Lancer les tests cibles ticket.
- Lancer la suite `npm run test` apres Green complet.
- Verification manuelle:
  1) forcer echec `save` -> bouton `Save` revient et retry possible;
  2) forcer echec `publish` -> bouton `Publish` revient visible et retry possible;
  3) `publish` succes -> bouton `Publish` masque (comportement conserve).
