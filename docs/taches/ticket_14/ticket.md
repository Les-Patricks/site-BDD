# Ticket 14 - Filtre / tri des listes (Mots, Familles, Langues)

1. **Titre** : Donner un comportement produit clair aux actions de filtre et de tri (`Trier par V`, extensions futures) sur les panneaux d onglets.
2. **Probleme resolu** : Les boutons `tab-panel-order` (`Trier par V`) et la notion de filtre ne sont pas documentes ni garantis cote UI. L utilisateur ne sait pas ce qui doit se passer et le code peut rester inerte ou partiel.
3. **Impact** : 
   - utilisateur/metier : ordonner ou restreindre les listes longues sans quitter l onglet ;
   - technique : definir un contrat unique (tri client-side sur `displayName`, sens V/A, interaction avec la barre de recherche du ticket 13) et l implementer sans double source de verite avec le store.
4. **CA cibles** :
   - **CA-1401** : Un clic sur `Trier par V` dans un onglet a un effet visible et reproductible sur la liste affichee de cet onglet (ordre explicite, par exemple nom croissant/decroissant).
   - **CA-1402** : Le tri s applique au contexte de l onglet courant uniquement (pas de melange des listes Mots / Familles / Langues).
   - **CA-1403** : Apres tri, les actions CRUD existantes (renommer, supprimer, ouvrir accordion) restent coherentes (memes IDs, pas de noeuds fantomes dans le DOM).
   - **CA-1404** : L interaction avec la recherche (ticket 13) est definie et unique : la recherche filtre d abord, puis le tri s applique sur le sous-ensemble visible.
   - **CA-1405** : Pas d’appel reseau obligatoire pour trier : donnees deja en memoire (`store`).
   - **CA-1406** : Le comportement de tri est stable : affichage par defaut en A->Z, puis clic bouton = Z->A, clic suivant = A->Z (ou equivalent documente), avec libelle/etat coherent.
5. **Contraintes** :
   - Conserver les classes `tab-panel-order` (et le marquage d’en-tete) ou documenter tout renommage.
   - Performance acceptable sur de grandes listes (eviter copies profondes inutiles du store).
   - Le tri manipule uniquement la projection UI ; la structure source `store` ne doit pas etre reordonnee globalement.
6. **Hors-perimetre** :
   - Implementation complete de la barre de recherche : ticket **13**.
   - Autocompletion ajout mot famille : ticket **12**.
7. **Definition de Termine** :
   - [ ] Comportement `Trier par V` specifie (sens, cle de tri, regle de bascule du bouton).
   - [ ] Implementation sur les onglets concernes (au minimum ceux qui exposent deja le bouton dans `index.html`).
   - [ ] Tests ou checklist manuelle : liste vide, un seul element, accents/casse, basculement repete du tri.
8. **Estimation** : M.

Auto-controle :
- Ticket atomique : oui (filtre / tri UI).
- CA cibles identifies : oui (CA-1401 a CA-1406).
- Hors-perimetre explicite : oui.
