# Mini-spec Ticket 14 - Filtre / tri des listes

## 1) Rappel du besoin

Definir un comportement unique, visible et testable pour l action `Trier par V`
dans les panneaux listes (Mots, Familles, Langues), avec une interaction
claire avec la recherche du ticket 13, sans appel reseau ni duplication de
source de verite.

## 2) Exigences fonctionnelles (RM)

- **RM-1401 - Tri local par onglet**
  L action de tri s applique uniquement a la liste de l onglet courant
  (Mots/Familles/Langues), sans effet de bord sur les autres onglets.

- **RM-1402 - Regle de tri deterministe**
  Le tri est base sur `displayName` (ou equivalent affiche), avec un ordre
  deterministe entre clics successifs.

- **RM-1403 - Bascule de sens**
  Le bouton de tri alterne entre ordre croissant et decroissant a chaque clic,
  avec un etat/libelle coherent cote UI.

- **RM-1404 - Composition recherche + tri**
  L ordre de traitement est unique et documente : recherche d abord, puis tri
  applique au sous-ensemble visible.

- **RM-1405 - Integrite des actions UI**
  Apres tri, les actions existantes (ouvrir accordion, renommer, supprimer)
  continuent de cibler les bons elements et IDs.

- **RM-1406 - Sans appel reseau**
  Le tri/filtre s appuie uniquement sur les donnees deja presentes en memoire
  (`store` et projection UI).

- **RM-1407 - Respect du modele de donnees**
  Le tri ne reordonne pas globalement le `store` metier ; il agit sur le rendu
  de liste (projection UI) pour eviter les regressions transverses.

## 3) Criteres d acceptance (CA)

- **CA-1401** : Un clic sur `Trier par V` a un effet visible et reproductible
  sur la liste affichee de l onglet courant.
- **CA-1402** : Aucun impact de tri entre onglets (isolation par contexte).
- **CA-1403** : Les actions CRUD/accordion restent operationnelles apres tri.
- **CA-1404** : La recherche s applique avant le tri (comportement unique).
- **CA-1405** : Aucun appel reseau n est necessaire pour trier.
- **CA-1406** : L affichage initial est A->Z, puis le bouton alterne Z->A puis
  A->Z (ou equivalent documente), avec un etat coherent.

## 4) Matrice RM -> CA

| RM | CAs couverts | Justification |
|---|---|---|
| RM-1401 | CA-1401, CA-1402 | Effet visible + confinement au seul onglet actif |
| RM-1402 | CA-1401, CA-1406 | Tri sur cle stable et resultat reproductible |
| RM-1403 | CA-1406 | Bascule de sens formalisee et observable en UI |
| RM-1404 | CA-1404, CA-1401 | Pipeline recherche puis tri, rendu final coherent |
| RM-1405 | CA-1403 | Integrite des handlers/actions apres reordonnancement visuel |
| RM-1406 | CA-1405 | Execution 100% client-side sur donnees en memoire |
| RM-1407 | CA-1403, CA-1405 | Pas de mutation globale du store, pas d effet collatral |

## 5) Cas limites minimaux a couvrir en Red

- Liste vide.
- Liste avec un seul element.
- Valeurs avec accents/casse differente.
- Clics repetes sur le bouton de tri.
- Recherche active puis changement de sens de tri.
