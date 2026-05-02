# Ticket 11 - Indicateur de chargement au demarrage

1. **Titre** : Afficher un etat de chargement utilisateur pendant la recuperation initiale des donnees (`admin-bootstrap`).
2. **Probleme resolu** : Au lancement du site, l'utilisateur n'a pas de feedback visuel clair pendant la recuperation des mots/langues/familles, ce qui peut donner une impression de blocage.
3. **Impact** : utilisateur/metier : meilleure perception de performance et reduction de confusion au demarrage. technique : formalisation d'un etat UI `loading` de bootstrap.
4. **CA cibles** :
   - **CA-1101** : Un indicateur visible apparait tant que le bootstrap des donnees est en cours.
   - **CA-1102** : L'indicateur disparait quand les donnees sont chargees et l'UI devient interactive.
   - **CA-1103** : En cas d'erreur de bootstrap, un message explicite est affiche et l'etat loading est retire.
   - **CA-1104** : Le chargement ne provoque pas de regression sur l'etat du bouton `Publish`.
   - **CA-1105** : Des tests couvrent au minimum les cas succes et erreur du bootstrap.
5. **Contraintes** :
   - Conserver le contrat actuel de `admin-bootstrap`.
   - Ne pas bloquer durablement l'interface en cas d'erreur.
   - Respecter les styles/structures UI existants (pas de refonte graphique globale).
6. **Hors-perimetre** :
   - Skeletons detailles pour chaque tab.
   - Refonte complete du systeme de notifications.
   - Optimisation backend des temps de reponse.
7. **Definition de Termine** :
   - [ ] Etat loading visible au demarrage.
   - [ ] Retrait du loading en succes et en erreur.
   - [ ] Message d'erreur lisible si bootstrap KO.
   - [ ] Couverture de tests mise a jour.
8. **Estimation** : S.

Auto-controle :
- Ticket atomique : oui (UX de chargement bootstrap).
- CA cibles identifies : oui (CA-1101 a CA-1105).
- Hors-perimetre explicite : oui.
