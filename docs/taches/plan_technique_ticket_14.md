# Plan technique Ticket 14 - Tri/filtre listes onglets

## 1) Portee implementation

Implementer un comportement de tri UI deterministe sur les listes des onglets
qui exposent `tab-panel-order`, avec une regle unique de composition avec la
recherche (ticket 13), sans mutation globale du `store`.

## 2) Strategie technique retenue

- Conserver le `store` comme source metier canonique.
- Calculer le rendu via une projection locale :
  - source = donnees de l onglet actif ;
  - filtre = recherche active (si presente) ;
  - tri = ordre courant de l onglet (asc/desc).
- Re-render de la liste via les points d entree UI existants, sans changer les
  contrats CRUD.
- Stocker l etat de tri par onglet dans un etat UI dedie (pas dans le store
  metier), afin d eviter les effets de bord.

## 3) Impacts code prevus

- `js/ui/tabSearch.js`
  - Exposer/normaliser l acces au terme de recherche actif par onglet, pour
    permettre la composition filtre + tri dans le meme pipeline d affichage.

- `js/tabs/familyTab.js`
  - Ajouter le wiring du bouton `tab-panel-order` pour Familles.
  - Appliquer tri sur la collection a afficher apres filtre.

- `js/tabs/wordTab.js`
  - Ajouter le wiring du bouton `tab-panel-order` pour Mots.
  - Garantir la compatibilite avec la recherche existante (ticket 13).

- `js/tabs/languageTab.js` (si bouton present dans le DOM de l onglet)
  - Ajouter le meme comportement de tri et etat local.

- `js/state.js`
  - Pas de reordonnancement global des structures metier.
  - Eventuel helper de lecture uniquement si necessaire (sans side effect).

- `js/tests/`
  - Ajouter tests cibles du comportement tri/recherche par onglet.

## 4) Design de l etat UI (tri)

- Structure proposee (niveau UI) :
  - `tabSortState.words = "asc" | "desc"`
  - `tabSortState.families = "asc" | "desc"`
  - `tabSortState.languages = "asc" | "desc"`
- Initialisation : affichage force en `asc` (A->Z) au premier rendu de chaque
  onglet.
- Interaction bouton :
  - clic 1 => `desc` (Z->A), clic suivant => `asc` (A->Z) ;
  - relance du pipeline render (filtre puis tri).

## 5) Algorithme de rendu (ordre impose)

1. Recuperer la source de donnees de l onglet actif.
2. Appliquer le filtre recherche (si terme non vide).
3. Appliquer le tri `displayName` selon etat `asc/desc`.
4. Repeupler la liste DOM de l onglet.
5. Reattacher les handlers existants via les fonctions de creation/render deja
   en place.

## 6) Plan de tests (cible etape Red puis Green)

- Un test par onglet cible :
  - ordre initial verifie en A->Z ;
  - clic tri modifie l ordre visible (Z->A) ;
  - second clic inverse l ordre (retour A->Z).
- Test composition :
  - avec recherche active, le tri agit uniquement sur le sous-ensemble filtre.
- Test robustesse UI :
  - apres tri, rename/delete/open accordion ciblent toujours le bon item.
- Cas limites :
  - liste vide, 1 item, accents/casse, clics repetes.

## 7) Risques et mitigations

- **Risque** : perte de handlers apres re-render.
  - **Mitigation** : reutiliser les fonctions de construction d item existantes
    au lieu de manipulations DOM partielles manuelles.

- **Risque** : divergence entre onglets.
  - **Mitigation** : extraire une logique de tri commune minimale
    (comparator + toggle) si duplication commence a apparaitre.

- **Risque** : regression recherche ticket 13.
  - **Mitigation** : test explicite "recherche puis tri" et validation manuelle
    sur les deux onglets deja couverts par la recherche.

## 8) Sequencement implementation (top-down)

1. Ajouter le point d entree visible : wiring bouton `tab-panel-order` sur un
   onglet cible (Mots), avec effet UI observable.
2. Etendre a Familles, puis Langues si applicable.
3. Factoriser si necessaire (comparator/toggle) sans changer le contrat public.
4. Ajouter/adapter tests.
5. Verification finale (`npm run test`).

## 10) Decisions finales implementees

- Le tri est actif par defaut en A->Z sur Mots, Familles et Langues apres
  chaque render/update de liste.
- Le bouton `Trier par V` bascule ensuite Z->A puis A->Z.
- La logique de tri est maintenue localement dans chaque tab (pas de helper
  partage) pour privilegier la rapidite de livraison et la lisibilite
  immediate dans le contexte actuel.

## 9) Hors-perimetre confirme

- Refonte du modele `store` legacy/new.
- Changement de schema backend/API.
- Evolution produit de filtres avances (multi-criteres).
