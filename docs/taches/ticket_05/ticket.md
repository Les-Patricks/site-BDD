# Ticket 05 - Sortir la configuration sensible du code client

1. **Titre** : Externaliser les cles et URL de configuration vers des variables d'environnement.
2. **Probleme resolu** : Les informations Supabase client sont encore en dur dans `js/SupabaseManager.js`, ce qui reste non aligne avec la politique de configuration securisee annoncee dans le dossier professionnel.
3. **Impact** : utilisateur/metier : meilleure maitrise des environnements et reduction du risque d'erreur de configuration. technique : suppression des valeurs hardcodees et normalisation de la configuration.
4. **CA cibles** : Voir `docs/taches/mini_spec_ticket_05.md` (section *Critères d’acceptation*). Résumé : pas d’URL/clé en dur dans `SupabaseManager.js` ; échec explicite si config absente ; `SETUP.md` à jour ; flux local sans secrets dans le dépôt ; CI sans exposition de secrets en clair.
5. **Contraintes** :
   - Retirer les valeurs sensibles hardcodees du code versionne.
   - Fournir un mecanisme de chargement compatible avec app statique.
   - Mettre a jour `docs/SETUP.md` avec les variables requises.
6. **Hors-perimetre** :
   - Refonte complete IAM/roles cloud.
   - Chiffrement custom des secrets applicatifs.
   - Migration vers une autre base de donnees.
7. **Definition de Termine** :
   - [x] `js/SupabaseManager.js` ne contient plus URL/cle en dur.
   - [x] Les variables necessaires sont documentees et verifiables au demarrage.
   - [x] L'application fonctionne avec configuration locale explicite.
   - [x] La CI n'expose aucun secret en clair.
8. **Estimation** : S.

Auto-controle :
- Ticket atomique : oui (1 jour, config + doc).
- CA cibles identifies : oui (`mini_spec_ticket_05.md`).
- Hors-perimetre explicite : oui.
