# Ticket 03 - Rendre atomique l'ecriture mot et traductions

1. **Titre** : Implementer une transaction atomique mot+traductions cote serveur.
2. **Probleme resolu** : Le flux d'ecriture actuel fonctionne encore en series d'upserts, sans transaction serveur explicite. En cas d'erreur intermediaire, la donnee peut rester partiellement enregistree.
3. **Impact** : utilisateur/metier : integrite des mots et traductions garantie lors des sauvegardes. technique : encapsulation de l'ecriture dans une operation transactionnelle unique.
4. **CA cibles** : A REDIGER en etape 2.
5. **Contraintes** :
   - L'ecriture doit couvrir mot et traductions dans la meme unite transactionnelle.
   - Un echec doit provoquer rollback complet.
   - Le front doit recevoir un statut clair succes/echec.
6. **Hors-perimetre** :
   - Refonte de tout le schema SQL.
   - Re-ecriture complete de `publish-to-firebase`.
   - Optimisations batch non necessaires au besoin transactionnel.
7. **Definition de Termine** :
   - [ ] Un endpoint metier gere l'ecriture atomique mot+traductions.
   - [ ] Aucune ecriture partielle n'est observee en cas d'erreur.
   - [ ] Un test couvre explicitement un scenario de rollback.
   - [ ] Le front utilise cet endpoint pour ce cas metier.
8. **Estimation** : M.

Auto-controle :
- Ticket atomique : oui (1 a 2 jours, cas metier unique).
- CA cibles identifies : partiels (`A REDIGER en etape 2`).
- Hors-perimetre explicite : oui.
