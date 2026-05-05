# Mini-spec - Ticket 09

## Contexte
En cas d'echec `save()` ou `publish()`, l'interface peut rester dans un etat transitoire (`Saving...` / `Publishing...`) qui empêche un retry utilisateur fluide.

## Objectif produit
Garantir qu'apres un echec `save()` ou `publish()`, les actions reviennent immediatement a un etat interactif normal afin de permettre un retry sans rechargement de page.

## Perimetre fonctionnel
- Restaurer l'etat visuel et interactif du bouton `Save` apres echec `save()`.
- Restaurer l'etat visuel et interactif du bouton `Publish` apres echec `publish()`.
- Conserver la visibilite du bouton `Publish` en cas d'echec `publish()`.
- Conserver le comportement nominal actuel en cas de succes `publish()` (masquer `Publish`).
- Ajouter/adapter des tests automatises pour couvrir les parcours d'echec avec retry.

## Regles metier cibles
- `save()` en echec:
  - le bouton `Save` quitte l'etat de chargement;
  - son libelle redevient nominal;
  - il reste cliquable pour relancer `save()`.
- `publish()` en echec:
  - le bouton `Publish` quitte l'etat de chargement;
  - son libelle redevient nominal;
  - il reste visible et cliquable pour relancer `publish()`.
- `publish()` en succes:
  - le bouton `Publish` est masque (comportement actuel conserve).

## Criteres d'acceptation (rappel + precision)
- CA-901: si `save()` echoue, le bouton `Save` revient a l'etat normal et reste utilisable pour retry.
- CA-902: si `publish()` echoue, le bouton `Publish` sort de l'etat `saving/publishing`, retrouve son libelle normal et reste cliquable.
- CA-903: en cas d'echec `publish`, le bouton `Publish` reste visible pour retenter.
- CA-904: en cas de succes `publish`, le comportement existant de masquage `Publish` est conserve.
- CA-905: des tests couvrent a minima les cas `save` echec + retry possible et `publish` echec + retry possible.

## Contraintes techniques
- Conserver les contrats metier existants de `save()` et `publish()`.
- Ne pas introduire de regression sur les etats visuels hors cas d'erreur.
- Conserver les messages d'erreur actuels (amelioration autorisee sans rupture d'usage).

## Hors-perimetre
- Refonte complete des notifications UI.
- Nouvelle architecture globale de gestion d'erreurs.
- Refonte du pipeline de publication.

## Risques identifies
- Course entre mise a jour d'etat UI et retour d'erreur async pouvant laisser un bouton bloque.
- Divergence de comportement entre flux `save` et `publish` (legacy vs logique plus recente).
- Couverture de tests insuffisante sur les scenarios retry.

## Strategie de mitigation
- Centraliser la restauration d'etat des boutons dans les chemins d'echec explicites.
- Garantir la sortie d'etat "loading" dans tous les `catch/finally` pertinents.
- Ajouter des tests de non-regression cibles sur echec + retry.

## Estimation de charge
Estimation globale: **0,25 a 0,75 jour** (complexite **S**).

Decoupage indicatif:
- Cadrage des points d'etat UI a harmoniser (`save`/`publish`): 0,05 a 0,15 j
- Correctif minimal sur la logique de restauration de boutons: 0,1 a 0,25 j
- Tests de non-regression (save/publish echec + retry): 0,1 a 0,25 j
- Ajustement doc si impact comportemental notable: 0,0 a 0,1 j
