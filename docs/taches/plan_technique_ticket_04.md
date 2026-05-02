# Plan technique — Ticket 04 — JWT strict sur Edge Functions

## Fichiers impactés (prévision)

| Fichier | Action |
|---------|--------|
| `package.json` | Retirer `--no-verify-jwt` des trois scripts `deploy:*`. |
| `docs/SETUP.md` | Prérequis auth pour publish / admin-save / admin-bootstrap. |
| `README.md` | Court rappel si la section déploiement y renvoie. |
| Tests Vitest (nouveau ou existant) | Couverture CA-04-2 : assertion sur le contrat d’appel ou garde documentée. |

## Étapes d’implémentation (ordre proposé)

1. **Diff package.json** : suppression du flag sur `deploy:publish`, `deploy:admin-save`, `deploy:admin-bootstrap` (alignement avec la contrainte « scripts de déploiement » et la définition de terminé centrée sur `deploy:publish`).

2. **Documentation** : ajouter une sous-section « Authentification des Edge Functions » — tout appel doit porter le JWT session ; en front, utiliser le client Supabase après `signIn` ; les appels curl/scripts doivent inclure `Authorization: Bearer <access_token>`.

3. **Preuve / test CA-04-2** — option A (préférée si faisable sans secrets) : test unitaire qui vérifie que le code client utilise `supabase.functions.invoke` (session implicite) et documente que l’absence de JWT côté HTTP brute est gérée par la plateforme après retrait du flag. Option B : test avec `fetch` mocké vers l’URL de fonction attend une 401 sans header — nécessite stabilité d’URL ou variables d’env de test. Option C : section « Recette manuelle » dans la doc avec commande `curl` sans/s avec token.

4. **Validation** : `npm run test` ; revue grep `no-verify-jwt` = 0 résultat hors historique/docs tickets si applicable.

## Risques et mitigation

| Risque | Mitigation |
|--------|------------|
| Scripts CI ou outils externes appelant les fonctions sans JWT | Doc + recherche `functions/v1` dans le repo ; corriger les appels pour ajouter le Bearer. |
| Déploiement : oubli de redéployer après changement de script | Checklist doc : redéployer chaque fonction après merge. |

## Déploiement post-merge

Exécuter localement (avec CLI connectée au projet) les trois commandes `npm run deploy:…` pour matérialiser le changement côté Supabase (comportement JWT appliqué au prochain deploy).
