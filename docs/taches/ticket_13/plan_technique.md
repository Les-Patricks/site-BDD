# Plan technique - Ticket 13

## Objectif technique
Brancher la barre de recherche des onglets **Familles** et **Mots** en filtre client-side sur le DOM deja rendu, avec un comportement coherent entre saisie / bouton loupe / Entree, une portee strictement limitee au panneau courant, et une reapplication apres reconstruction des listes.

## Decisions arretees

| Sujet | Decision |
|--------|-----------|
| Portee module | Nouveau module dedie `js/ui/tabSearch.js` pour centraliser la logique (binding events + application filtre + scroll premiere correspondance). |
| Cible de filtre | Enfants directs de `#familyTabPanelContent` et `#wordTabPanelContent` uniquement (unite de ligne). |
| Texte compare | Titre de l'accordeon racine de chaque ligne : premier `.accordion__button` trouve dans la ligne, hors contenu imbrique. |
| Regle de match | `query.trim().toLowerCase()` inclus dans `label.toLowerCase()`. |
| Effet visuel | Masquer les lignes non match via classe CSS dediee (ex. `.tab-search__item--hidden`) plutot que suppression/re-render. |
| Aucun resultat | Poser `data-search-empty="true"` sur le conteneur quand il n’y a aucun match ; **supprimer** l’attribut quand ce n’est plus le cas ; message CSS `::after` minimal sans noeud JS permanent. |
| Loupe + Entree | Meme action: reappliquer le filtre courant puis `scrollIntoView` sur la premiere ligne visible. |
| Reapplication apres update | Exposer une API `refreshTabSearch(panelId)` appelee apres `updateFamilies()` et `updateWords()` dans `main.js`. Pas de `MutationObserver` pour garder la surface simple. |
| Reseau | Aucun appel reseau ; tout se fait sur DOM local issu du store hydrate. |

## Strategie d'implementation

### 1) Module de recherche (`js/ui/tabSearch.js`)
- Exporter `initTabSearch()`:
  - detecter dans chaque panneau (`#wordFamilyTab`, `#wordTab`) le couple `.tab-panel__search-bar` + `.tab-panel__search-btn` et son conteneur de lignes.
  - attacher listeners:
    - `input` -> applique filtre;
    - `click` sur loupe -> applique filtre + scroll premiere visible;
    - `keydown` Entree sur input -> meme action que loupe.
- Stocker un petit registre interne par panneau (input, content, getter lignes) pour permettre `refreshTabSearch(panelId)`.
- Implementer `applyFilter(panelId, { withScroll })`:
  - calcul query normalisee;
  - parcourir les lignes directes du conteneur;
  - extraire le label cible;
  - toggle classe cachee sur chaque ligne;
  - mettre/retirer `data-search-empty`.

### 2) Integration cycle onglets (`js/main.js`)
- Importer `initTabSearch` et `refreshTabSearch`.
- Appeler `initTabSearch()` une seule fois apres bootstrap reussi, avant le premier `wordFamilyBtn.click()`.
- Dans les handlers onglets:
  - apres `updateFamilies()`, appeler `refreshTabSearch("wordFamilyTab")`;
  - apres `updateWords()`, appeler `refreshTabSearch("wordTab")`.
- Ne rien changer pour l'onglet langues.

### 3) Styles (`css/style.css`)
- Ajouter:
  - `.tab-search__item--hidden { display: none; }`
  - regle `#familyTabPanelContent[data-search-empty="true"]::after, #wordTabPanelContent[data-search-empty="true"]::after` avec message court ("Aucun resultat"), style discret.
- Garder les classes HTML existantes (`tab-panel__search-*`) intactes.

### 4) Tests (Red puis Green)
- Nouveau fichier recommande: `js/tests/ticket_13.tab-search.test.js` (environnement `jsdom`).
- Couvrir au minimum:
  1. `input` filtre en masquant les non-match (CA-1301);
  2. requete vide restaure tout + retire etat empty (CA-1302);
  3. click loupe et Entree declenchent la meme logique (CA-1303);
  4. isolation Familles/Mots (CA-1304);
  5. aucun mock reseau/invoke necessaire (preuve CA-1305: tests purement DOM).
- Tester un cas famille avec mots imbriques pour verifier que seul le titre racine pilote le match.

### 5) Documentation
- Mettre a jour `docs/taches/ticket_13/ticket.md` DoD/checklist si necessaire a la fin Green.
- Pas de nouveau document global requis hors ticket, sauf si comportement "Aucun resultat" doit etre reference dans `docs/TESTING.md`.

## Decoupage Green (ordre recommande)
1. **Diff 1**: module `tabSearch` + styles minimaux.
2. **Diff 2**: branchement `main.js` (init + refresh sur onglets).
3. **Diff 3**: tests ticket 13 (cas vide/sans resultat/restauration/isolation/loupe-entree).
4. **Diff 4**: ajustements doc ticket + verification `npm run test`.

## Impacts fichiers probables
- `js/ui/tabSearch.js` (nouveau)
- `js/main.js`
- `css/style.css`
- `js/tests/ticket_13.tab-search.test.js` (nouveau)
- `docs/taches/ticket_13/ticket.md` (mineur, optionnel DoD)

## Risques et mitigations
- **Selection du mauvais titre en Familles** (mots imbriques pris a tort): imposer extraction du premier accordeon racine de la ligne et tester ce cas explicitement.
- **Perte du filtre apres re-render**: appel systematique a `refreshTabSearch` juste apres `updateFamilies`/`updateWords`.
- **Cout sur grosses listes**: rester sur un parcours lineaire O(n) + toggles de classes, sans reconstruction de DOM.

## Plan de verification
- `npm run test` avec nouveau fichier ticket 13.
- Verification manuelle:
  - taper une requete sur Familles puis vider;
  - meme parcours sur Mots;
  - bouton loupe et Entree;
  - aucun effet croise entre onglets.
