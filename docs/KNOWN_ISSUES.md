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

## Feedback UX a traiter plus tard

Statut: **a planifier**.

Quand une action est refusee par les regles metier (ex: ajout de mot duplique, renommage vers un nom deja utilise), l'UI ne donne pas encore de feedback utilisateur explicite.

Amelioration attendue:
- afficher un message clair a l'utilisateur (inline, toast, ou modal) quand une action est rejetee;
- harmoniser le comportement sur les tabs languages/words/families;
- couvrir ces retours UX avec des tests UI/integration.
