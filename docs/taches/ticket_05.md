# Ticket 05 - Sortir la configuration sensible du code client

1. **Titre** : Externaliser les cles et URL de configuration vers des variables d'environnement.
2. **Probleme resolu** : Les informations Supabase client sont encore en dur dans `js/SupabaseManager.js`, ce qui reste non aligne avec la politique de configuration securisee annoncee dans le dossier professionnel.
3. **Impact** : utilisateur/metier : meilleure maitrise des environnements et reduction du risque d'erreur de configuration. technique : suppression des valeurs hardcodees et normalisation de la configuration.
4. **CA cibles** : A REDIGER en etape 2.
5. **Contraintes** :
   - Retirer les valeurs sensibles hardcodees du code versionne.
   - Fournir un mecanisme de chargement compatible avec app statique.
   - Mettre a jour `docs/SETUP.md` avec les variables requises.
6. **Hors-perimetre** :
   - Refonte complete IAM/roles cloud.
   - Chiffrement custom des secrets applicatifs.
   - Migration vers une autre base de donnees.
7. **Definition de Termine** :
   - [ ] `js/SupabaseManager.js` ne contient plus URL/cle en dur.
   - [ ] Les variables necessaires sont documentees et verifiables au demarrage.
   - [ ] L'application fonctionne avec configuration locale explicite.
   - [ ] La CI n'expose aucun secret en clair.
8. **Estimation** : S.

Auto-controle :
- Ticket atomique : oui (1 jour, config + doc).
- CA cibles identifies : partiels (`A REDIGER en etape 2`).
- Hors-perimetre explicite : oui.
