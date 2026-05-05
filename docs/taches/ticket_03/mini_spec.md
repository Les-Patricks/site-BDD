# Mini-spec - Ticket 03

## Contexte
Le flux de sauvegarde actuel ecrit encore les entites via des operations sequentielles. En cas d'erreur au milieu du traitement, une persistance partielle peut rester en base.

## Probleme a resoudre
Garantir une ecriture atomique globale de la sauvegarde cote serveur pour supprimer tout risque d'etat partiel.

## Objectif fonctionnel
Pour le cas metier cible, une sauvegarde doit:
- soit reussir completement (languages, words, traductions, families et associations/suppressions coherents),
- soit echouer completement (aucune ecriture conservee).

## Scope
- Inclut:
  - endpoint/metier serveur transactionnel pour la sauvegarde globale;
  - integration du front sur ce nouveau chemin;
  - contrat de retour explicite succes/erreur.
- Exclut:
  - refonte complete du schema SQL;
  - re-ecriture globale du flux de publication Firebase;
  - optimisations batch hors besoin transactionnel.

## Acteurs et impact
- Utilisateur backoffice: sauvegardes plus fiables, moins d'incoherences.
- Equipe technique: point d'entree metier clair et testable pour la persistance atomique globale.

## Criteres d'acceptation cibles
1. Une sauvegarde complete utilise un endpoint transactionnel unique.
2. En cas d'erreur forcee pendant la transaction, aucun changement n'est persiste.
3. Le front recoit un statut clair (`ok` / `erreur`) avec message exploitable.
4. Un test couvre explicitement le scenario de rollback global.

## Definition of Done
- Endpoint atomique disponible et branche sur le flux cible.
- Aucune ecriture partielle observee en cas d'echec.
- Tests rollback et succes au vert.
- Documentation technique du flux de sauvegarde mise a jour.

