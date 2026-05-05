# Ticket 09 - Reafficher les actions apres echec save/publish

1. **Titre** : Fiabiliser la re-apparition des boutons `Save`/`Publish` apres echec pour permettre un retry utilisateur.
2. **Probleme resolu** : En cas d'echec `publish`, l'UI peut rester en etat `Publishing...` et ne pas proposer un retry propre. En cas d'echec `save`, le flux de reprise n'est pas explicitement garanti par un contrat teste.
3. **Impact** : utilisateur/metier : evite les blocages UI et permet de relancer rapidement l'action apres erreur. technique : harmonise la gestion d'etat de boutons sur succes/erreur.
4. **CA cibles** :
   - **CA-901** : Si `save()` echoue, le bouton `Save` revient a son etat normal et reste utilisable pour retry.
   - **CA-902** : Si `publish()` echoue, le bouton `Publish` sort de l'etat `saving/publishing`, retrouve son libelle normal et reste cliquable.
   - **CA-903** : En cas d'echec `publish`, le bouton `Publish` reste visible pour retenter.
   - **CA-904** : En cas de succes `publish`, le comportement existant (masquer `Publish`) est conserve.
   - **CA-905** : Des tests couvrent au minimum les cas `save` echec + retry possible et `publish` echec + retry possible.
5. **Contraintes** :
   - Conserver les contrats metier existants de `save()` et `publish()`.
   - Ne pas introduire de regression sur les etats visuels actuels hors cas d'erreur.
   - Garder les messages d'erreur actuels (ou les ameliorer sans casser les usages).
6. **Hors-perimetre** :
   - Refonte complete des notifications UI.
   - Nouvelle architecture de gestion globale d'erreurs.
   - Refonte du pipeline de publication.
7. **Definition de Termine** :
   - [ ] Les etats de boutons sont restaures proprement apres echec `save`.
   - [ ] Les etats de boutons sont restaures proprement apres echec `publish`.
   - [ ] Un retry manuel est possible sans recharger la page.
   - [ ] Les tests associes passent.
8. **Estimation** : S.

Auto-controle :
- Ticket atomique : oui (gestion de retry UI apres erreurs save/publish).
- CA cibles identifies : oui (CA-901 a CA-905).
- Hors-perimetre explicite : oui.
