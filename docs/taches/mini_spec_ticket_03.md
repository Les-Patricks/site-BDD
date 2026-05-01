# Mini-spec - Ticket 03

## Contexte
Le flux actuel enchaine des upserts mot puis traductions sans transaction serveur explicite. En cas d'echec en cours de route, une partie des donnees peut etre ecrite, ce qui cree un etat incoherent.

## Objectif
Garantir une ecriture atomique "mot + traductions" cote serveur: soit tout est persiste, soit rien n'est persiste.

## Probleme a resoudre
- Eviter toute ecriture partielle lors d'une sauvegarde.
- Retourner au front un resultat metier explicite (succes/echec) pour piloter l'UI.

## Portee (in-scope)
- Ajouter/adapter un endpoint metier serveur dedie a l'ecriture atomique mot+traductions.
- Executer l'ecriture dans une seule unite transactionnelle.
- Exposer un contrat de reponse clair consommable par le front.
- Adapter le front pour appeler ce chemin atomique sur ce cas metier.
- Ajouter au moins un test couvrant un rollback complet.

## Hors perimetre (out-of-scope)
- Refonte complete du schema SQL.
- Re-ecriture complete de `publish-to-firebase`.
- Optimisations batch non necessaires au besoin transactionnel.

## Contraintes
- Mot et traductions doivent etre ecrits dans la meme transaction.
- En cas d'erreur, rollback complet obligatoire.
- Le front doit recevoir un statut explicite et exploitable.

## Risques
- Couplage avec le modele d'etat mixte (`js/state.js`) et references legacy (`js/saveManager.js`).
- Regressions possibles sur les flux de sauvegarde existants si le contrat de reponse change.

## Criteres d'acceptation (version mini-spec)
- [ ] Un endpoint metier realise l'ecriture atomique mot+traductions.
- [ ] Une erreur provoque l'absence d'ecriture partielle constatee.
- [ ] Un test automatise valide un scenario de rollback.
- [ ] Le front utilise cet endpoint pour la sauvegarde cible.
- [ ] Le front affiche un resultat clair en succes et en echec.

## Validation attendue
Si cette mini-spec est validee, l'etape suivante sera le plan technique local (fichiers touches, strategie de test RED/GREEN, et sequence d'implementation).
