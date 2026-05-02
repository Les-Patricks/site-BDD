# Ticket 08 - Afficher Publish quand Supabase diverge de Firestore

1. **Titre** : Detecter un delta Supabase vs Firestore au chargement et afficher le bouton Publish.
2. **Probleme resolu** : Apres un `save()` puis un reload de page, le bouton Publish disparait alors que des donnees peuvent encore etre non publiees dans Firestore.
3. **Impact** : utilisateur/metier : evite les oublis de publication et limite les ecarts entre source edition (Supabase) et runtime (Firestore). technique : ajout d'une verification de coherence inter-sources au bootstrap.
4. **CA cibles** :
   - **CA-801** : Au chargement de l'app, un controle compare l'etat publie (Firestore) et l'etat edition (Supabase) selon une regle metier definie.
   - **CA-802** : Si un ecart est detecte, le bouton Publish est visible automatiquement sans action utilisateur.
   - **CA-803** : Si aucun ecart n'est detecte, le bouton Publish reste masque.
   - **CA-804** : Le controle ne degrade pas le parcours de chargement principal (pas de blocage UI durable).
   - **CA-805** : Un test couvre le cas "delta detecte => Publish visible" et le cas "pas de delta => Publish masque".
5. **Contraintes** :
   - Conserver le comportement actuel de `save()` et `publish()`.
   - Eviter de telecharger des volumes inutiles au demarrage.
   - Garder la compatibilite du schema de publication actuel (`words`, `families`, `id`).
6. **Hors-perimetre** :
   - Refonte complete du pipeline de publication.
   - Migration de Firestore vers une autre source runtime.
   - Mise en place d'un systeme de versionning complexe cross-database.
7. **Definition de Termine** :
   - [ ] Le bootstrap detecte de facon fiable un delta Supabase/Firestore.
   - [ ] Le bouton Publish apparait automatiquement en presence de delta.
   - [ ] Le bouton Publish reste masque en absence de delta.
   - [ ] Les tests associes passent.
   - [ ] La documentation workflow est mise a jour.
8. **Estimation** : M.

Auto-controle :
- Ticket atomique : oui (cas metier unique: visibilite publish sur divergence).
- CA cibles identifies : oui (CA-801 a CA-805).
- Hors-perimetre explicite : oui.
