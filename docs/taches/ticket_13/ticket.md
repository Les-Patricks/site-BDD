# Ticket 13 - Faire fonctionner la barre de recherche

1. **Titre** : Brancher la barre de recherche des onglets pour filtrer ou localiser le contenu affiche (Mots / Familles).
2. **Probleme resolu** : Les champs « Rechercher » et le bouton associe dans l'en-tete des panneaux d'onglets n'ont pas de comportement fonctionnel ; l'utilisateur ne peut pas reduire la liste visible ni sauter vers une entree.
3. **Impact** : utilisateur/metier : navigation rapide dans de grandes listes de mots ou de familles. technique : definir un contrat clair (filtre client-side vs focus, portee par onglet) et l'implementer sans regression sur le rendu des accordéons.
4. **CA cibles** :
   - **CA-1301** : Saisir du texte dans la barre de recherche du panneau actif a un effet visible (ex. masquage des elements non correspondants ou surlignage / scroll vers la premiere correspondance) — comportement a preciser dans une mini-spec ou plan technique.
   - **CA-1302** : Vider la recherche restaure l'affichage complet du panneau.
   - **CA-1303** : Le bouton « loupe » declenche une action coherente avec le champ (ex. reafficher le filtre, focus, ou recherche identique a la validation clavier).
   - **CA-1304** : La recherche est limitee au contexte de l'onglet courant (pas de melange mots/familles involontaire) sauf decision explicite documentee.
   - **CA-1305** : Pas de requete reseau obligatoire pour le filtre : fonctionnement sur les donnees deja en memoire (store), sauf evolution produit decidee.
5. **Contraintes** :
   - Conserver le marquage HTML/CSS existant (`tab-panel__search-bar`, `tab-panel__search-btn`, `tab-panel__search-header` dans `index.html`) ou documenter tout renommage.
   - Performance acceptable sur des centaines d'accordéons (eviter re-render complet inutile si possible).
6. **Hors-perimetre** :
   - Moteur de recherche full-text serveur ou indexation Elasticsearch.
   - Ticket 12 (autocompletion ajout mot dans famille) : traite separement.
7. **Definition de Termine** :
   - [x] Comportement defini et documente (critere de match : nom affiche, insensible a la casse, etc.).
   - [x] Implementation sur au minimum l'onglet **Mots** et l'onglet **Familles** (les deux blocs avec barre dans `index.html`).
   - [x] Tests ou checklist manuelle pour les cas vide, sans resultat, et restauration apres effacement.
8. **Estimation** : M.

Auto-controle :
- Ticket atomique : oui (recherche UI onglets).
- CA cibles identifies : oui (CA-1301 a CA-1305).
- Hors-perimetre explicite : oui.
