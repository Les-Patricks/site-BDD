# Ticket 02 - Migrer le front vers une couche API metier

1. **Titre** : Migrer les acces donnees du front vers des Edge Functions metier.
2. **Probleme resolu** : Le front lit et ecrit encore directement dans Supabase, ce qui contourne la couche metier decrite dans le dossier professionnel. Cela limite le controle des regles serveur et augmente le risque de derive fonctionnelle.
3. **Impact** : utilisateur/metier : operations d'administration plus fiables et gouvernees par des regles serveur. technique : suppression du couplage direct front->tables Supabase et centralisation des acces.
4. **CA cibles** : A REDIGER en etape 2.
5. **Contraintes** :
   - Conserver le comportement utilisateur actuel (tabs, save, publish).
   - Supprimer les appels CRUD directs aux tables depuis `js/main.js` et `js/state.js`.
   - Maintenir la compatibilite du schema de donnees attendu par la publication Firebase.
6. **Hors-perimetre** :
   - Refonte UX/UI du backoffice.
   - Changement du modele metier (entites/champs).
   - Optimisation performance globale de toutes les requetes.
7. **Definition de Termine** :
   - [ ] Les lectures initiales passent par des endpoints metier.
   - [ ] Le `save()` n'ecrit plus directement dans les tables depuis le front.
   - [ ] Le flux `publish()` continue de fonctionner sans regression.
   - [ ] Les tests concernes passent sur le nouveau chemin.
8. **Estimation** : M.

Auto-controle :
- Ticket atomique : oui (1 a 2 jours, scope migration cible).
- CA cibles identifies : partiels (`A REDIGER en etape 2`).
- Hors-perimetre explicite : oui.
