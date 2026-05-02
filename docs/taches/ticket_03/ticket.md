# Ticket 03 - Rendre atomique l'ecriture globale de sauvegarde

1. **Titre** : Implementer une transaction atomique globale de sauvegarde cote serveur.
2. **Probleme resolu** : Le flux d'ecriture actuel fonctionne encore en series d'upserts/deletes, sans transaction serveur explicite de bout en bout. En cas d'erreur intermediaire, la donnee peut rester partiellement enregistree.
3. **Impact** : utilisateur/metier : integrite globale des donnees de sauvegarde garantie. technique : encapsulation de l'ensemble de l'ecriture dans une operation transactionnelle unique.
4. **CA cibles** :
   - **CA-301** : Le save global passe par un endpoint metier unique cote serveur.
   - **CA-302** : En cas d'erreur intermediaire forcee, aucune ecriture partielle n'est conservee (rollback global observe).
   - **CA-303** : Le front recoit un retour explicite et exploitable (`ok`, `code`, `message`) en succes comme en echec.
   - **CA-304** : Les donnees persistentes restent compatibles avec la publication Firebase (shape aval inchangee).
   - **CA-305** : Un test automatisé couvre explicitement un scenario de rollback global.
5. **Contraintes** :
   - L'ecriture doit couvrir dans la meme unite transactionnelle: languages, words, traductions, families et associations/suppressions.
   - Un echec doit provoquer rollback complet.
   - Le front doit recevoir un statut clair succes/echec.
6. **Hors-perimetre** :
   - Refonte de tout le schema SQL.
   - Re-ecriture complete de `publish-to-firebase`.
   - Optimisations batch non necessaires au besoin transactionnel.
7. **Definition de Termine** :
   - [ ] Un endpoint metier gere l'ecriture atomique globale du save.
   - [ ] Aucune ecriture partielle n'est observee en cas d'erreur.
   - [ ] Un test couvre explicitement un scenario de rollback global.
   - [ ] Le front utilise cet endpoint pour ce cas metier.
8. **Estimation** : M.

Auto-controle :
- Ticket atomique : oui (1 a 2 jours, cas metier unique).
- CA cibles identifies : oui (CA-301 a CA-305).
- Hors-perimetre explicite : oui.
