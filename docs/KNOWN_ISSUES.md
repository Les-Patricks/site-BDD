# Limites et sujets de refacto

## Incoherences `state.js`

Statut: **resolu pour le Ticket 01**.

Le module est maintenant aligne sur un store unifie (`store` / `storeChanges`) avec une API unique (`add*`, `modify*`, `delete*`, `save`, `publish`, getters).

Les alias legacy de `state.js` (`wordKeys`, `languageKeys`, `traductions`, `updateTraduction`, etc.) ne sont plus la reference active pour les flux cibles.

## Incoherences `saveManager.js`

Statut: **resolu pour le Ticket 01**.

`saveManager.js` orchestre l'UI et delegue la persistance a `save()` du module `state`, qui persiste le store unifie.

## Tests potentiellement desynchronises

Statut: **resolu pour le Ticket 01**.

Les tests `state` sont alignes sur le contrat unifie (`js/tests/state.test.js`, `js/tests/state.unified.contract.test.js`, `js/tests/state.persistence.test.js`).

## Priorite technique recommandee

1. Choisir un seul modele d'etat (nouveau ou legacy)
2. Aligner `state.js`, `tabs/*`, `saveManager.js`
3. Mettre a jour les tests pour qu'ils decrivent ce modele unique
4. Ajouter des tests d'integration pour le flux save/publish

## Feedback utilisateur (notifications)

Statut: **partiellement resolu**.

- **Ticket 10** (historise) : flux critiques (save global, publish, login, echec bootstrap) passent par le module **`notify`** (`js/notify.js`) ; plus d’`alert` sur ce perimetre. Voir `docs/NOTIFICATIONS.md` et `docs/taches/ticket_10/strategie_notifications.md`.

## Feedback UX sur les actions CRUD des onglets

Statut: **partiellement resolu** (ticket **10.1** : `docs/taches/ticket_10_1/ticket.md`).

Les **ajouts**, **renommages** (succes / conflit de nom) et **suppressions** via les formulaires et accordéons des onglets Mots / Familles / Langues (y compris lignes de traduction dans l’accordéon mot) declenchent des toasts `notify` (succes court `durationMs: 2500`, warning si doublon / impossible). Voir `docs/NOTIFICATIONS.md` § ticket 10.1.
