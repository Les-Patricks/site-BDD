# Ticket 04 - Reactiver la verification JWT stricte

1. **Titre** : Imposer la verification JWT sur les fonctions Supabase deployees.
2. **Probleme resolu** : Le script de deploiement utilise encore `--no-verify-jwt`, en contradiction avec l'exigence de securite de l'API metier. Ce mode diminue la protection des endpoints cote serveur.
3. **Impact** : utilisateur/metier : reduction du risque d'acces non autorise. technique : alignement de la config de deploiement et du runtime avec un controle JWT strict.
4. **CA cibles** : A REDIGER en etape 2.
5. **Contraintes** :
   - Supprimer le mode `--no-verify-jwt` des scripts deploiement.
   - Verifier qu'un appel sans JWT valide est refuse.
   - Documenter le pre-requis d'authentification pour les appels.
6. **Hors-perimetre** :
   - Refonte complete de l'authentification produit.
   - Gestion IAM avancee multi-fournisseurs.
   - Changement de plateforme backend.
7. **Definition de Termine** :
   - [ ] Le script `deploy:publish` n'utilise plus `--no-verify-jwt`.
   - [ ] Les fonctions critiques rejettent les appels non authentifies.
   - [ ] Un test ou une preuve de recette couvre le cas JWT absent/invalide.
   - [ ] La documentation setup/workflow est mise a jour.
8. **Estimation** : S.

Auto-controle :
- Ticket atomique : oui (1 jour, config + verification).
- CA cibles identifies : partiels (`A REDIGER en etape 2`).
- Hors-perimetre explicite : oui.
