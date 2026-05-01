# Plan technique local - Ticket 03

## Objectif technique
Mettre en place un chemin d'ecriture atomique globale de sauvegarde cote serveur (languages, words, traductions, families, associations et suppressions), consomme par le front, avec rollback complet garanti en cas d'erreur.

## Strategie retenue
- Introduire une operation transactionnelle unique cote base via une fonction SQL (RPC Supabase) ou equivalent serveur transactionnel.
- Faire appeler cette operation metier par le front au lieu des upserts/deletes series pour tout le flux save.
- Uniformiser la reponse en contrat explicite: succes/erreur + message exploitable.

## Fichiers cibles (previsionnels)
- `supabase/migrations/*`  
  Creation d'une fonction SQL transactionnelle globale (insert/update/delete languages, words, traductions, families et associations) dans une seule transaction.
- `js/SupabaseManager.js`  
  Ajout d'une methode cliente dediee appelant la RPC atomique.
- `js/saveManager.js`  
  Branchement du flux de sauvegarde cible vers la nouvelle methode atomique.
- `js/state.js` (si necessaire, minimal)  
  Adaptation legere uniquement si le contrat de retour impose un mapping.
- `tests/**/*`  
  Ajout/maj tests unitaires/integration couvrant succes et rollback.
- `docs/`  
  Mise a jour de documentation du flux de sauvegarde (non-trivial change).

## Conception transactionnelle (niveau local)
1. Entrants:
   - Payload global de sauvegarde (`languages`, `words` + `traductions`, `families`, `toDelete`).
   - Champs metier requis pour chaque entite du payload.
2. Transaction:
   - Traitement des upserts languages, words, traductions, families et associations dans la meme transaction.
   - Traitement des suppressions (`toDelete`) dans la meme transaction.
   - Respect des contraintes relationnelles via un ordre d'execution deterministic.
3. Echec:
   - Toute exception provoque `ROLLBACK`.
4. Sortie:
   - Structure uniforme: `{ ok: boolean, code?: string, message?: string, data?: ... }`.

## Strategie de tests (RED -> GREEN)
### RED (d'abord)
- Ecrire un test qui simule une erreur intermediaire pendant la sauvegarde globale.
- Attendu RED: aucune persistance partielle apres echec.
- Ecrire un test du contrat front (statut explicite en erreur).

### GREEN (ensuite)
- Implementer la fonction transactionnelle.
- Connecter `SupabaseManager` puis `saveManager`.
- Faire passer le test rollback et le test succes.

### Non-regression minimale
- Verifier qu'un cas nominal de sauvegarde continue de fonctionner.
- Verifier que le message d'erreur remonte sans casser l'UI.
- Verifier la compatibilite des donnees pour le flux `publish-to-firebase`.

## Ordre d'implementation
1. Ajouter migration SQL (fonction transactionnelle + droits d'execution).
2. Ajouter methode cliente dans `js/SupabaseManager.js`.
3. Brancher le flux dans `js/saveManager.js`.
4. Ajuster mapping de retour cote etat si necessaire.
5. Ecrire/adapter tests rollback + succes.
6. Mettre a jour doc technique dans `docs/`.

## Risques et parades
- Risque: divergence schema reel vs payload front.
  - Parade: valider strictement les champs en entree SQL et retourner `code` explicite.
- Risque: coexistence legacy/nouveau flux de save.
  - Parade: limiter le scope a l'atomicite du save global, sans refactor hors perimetre.
- Risque: effets de bord sur publication Firebase.
  - Parade: ne pas toucher `publish-to-firebase`; verifier shape de donnees conservee.

## Verification prevue
- `npm run test`
- Scenario manuel: provoquer une erreur transactionnelle et constater absence d'ecriture partielle.
- Scenario manuel: sauvegarde globale nominale avec retour succes.

## Definition de fait (execution)
- Endpoint metier atomique global en place et appele par le front pour ce cas.
- Test rollback passant.
- Aucun etat partiel observe apres echec.
- Documentation mise a jour.
