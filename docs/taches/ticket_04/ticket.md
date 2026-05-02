# Ticket 04 - Reactiver la verification JWT stricte

1. **Titre** : Imposer la verification JWT sur les fonctions Supabase deployees.
2. **Probleme resolu** : Le script de deploiement utilise encore `--no-verify-jwt`, en contradiction avec l'exigence de securite de l'API metier. Ce mode diminue la protection des endpoints cote serveur.
3. **Impact** : utilisateur/metier : reduction du risque d'acces non autorise. technique : alignement de la config de deploiement et du runtime avec un controle JWT strict.
4. **CA cibles** : voir `docs/taches/mini_spec_ticket_04.md` (table CA-04-1 à CA-04-3).
5. **Contraintes** :
   - Supprimer le mode `--no-verify-jwt` des scripts deploiement.
   - Verifier qu'un appel sans JWT valide est refuse.
   - Documenter le pre-requis d'authentification pour les appels.
6. **Hors-perimetre** :
   - Refonte complete de l'authentification produit.
   - Gestion IAM avancee multi-fournisseurs.
   - Changement de plateforme backend.
7. **Definition de Termine** :
   - [x] Le script `deploy:publish` n'utilise plus `--no-verify-jwt` (idem `deploy:admin-save`, `deploy:admin-bootstrap`).
   - [x] Les fonctions critiques rejettent les appels non authentifies : impose par la plateforme Supabase une fois redeployees sans `--no-verify-jwt` ; verifier avec `RUN_JWT_GATE_TEST=1` (voir `docs/TESTING.md`).
   - [x] Un test ou une preuve de recette couvre le cas JWT absent/invalide : `js/tests/ticket_04.jwt.contract.test.js` (+ test distant optionnel).
   - [x] La documentation setup/workflow est mise a jour : `docs/SETUP.md`, `README.md`, `docs/TESTING.md`.

**Post-merge** : executer `npm run deploy:publish`, `deploy:admin-save`, `deploy:admin-bootstrap` contre le projet Supabase pour activer la verification JWT en runtime.

8. **Estimation** : S.

Auto-controle :
- Ticket atomique : oui (1 jour, config + verification).
- CA cibles identifies : oui (`mini_spec_ticket_04.md`).
- Hors-perimetre explicite : oui.
