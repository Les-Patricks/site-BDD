# Mini-spec — Ticket 04 — Vérification JWT stricte (Edge Functions)

## Contexte

Le déploiement CLI utilise `supabase functions deploy … --no-verify-jwt`, ce qui désactive la vérification JWT côté plateforme Supabase pour les fonctions concernées. La configuration locale (`supabase/config.toml`) expose déjà `verify_jwt = true` pour le dev local ; l’alignement production passe par le retrait du flag au déploiement.

## Comportement attendu

1. **Après déploiement** : les fonctions `publish-to-firebase`, `admin-save` et `admin-bootstrap` exigent un JWT Supabase valide (session utilisateur authentifié) dans l’en-tête `Authorization`, conformément au comportement par défaut de Supabase Edge Functions.

2. **Appels légitimes (backoffice)** : le client `@supabase/supabase-js` utilisé après connexion envoie automatiquement le JWT de session sur `supabase.functions.invoke(...)`. Les flux bootstrap (post-login), sauvegarde et publication restent fonctionnels pour un utilisateur connecté.

3. **Appels non authentifiés** : une requête vers l’URL de la fonction sans `Authorization: Bearer <access_token>` valide est rejetée par la plateforme (réponse d’erreur HTTP appropriée, typiquement 401), avant exécution du handler Deno.

## Critères d’acceptation (CA)

| ID | Critère | Vérification |
|----|---------|--------------|
| CA-04-1 | Les scripts npm `deploy:publish`, `deploy:admin-save`, `deploy:admin-bootstrap` n’invoquent plus `--no-verify-jwt`. | Revue `package.json` + grep repo. |
| CA-04-2 | Un appel HTTP direct à la fonction **sans** JWT valide est refusé (statut d’erreur d’auth). | Test automatisé documenté (mock fetch / assertion sur contrat) **ou** procédure de recette manuelle reproductible + résultat attendu. |
| CA-04-3 | La documentation indique que les invocations Edge nécessitent une session Supabase (JWT utilisateur) et rappelle l’usage de `functions.invoke` depuis le client authentifié. | `docs/SETUP.md` et/ou `README.md` mis à jour. |

## Hors périmètre

Conforme au ticket parent : pas de refonte auth produit, IAM multi-fournisseur, ni changement de backend.
