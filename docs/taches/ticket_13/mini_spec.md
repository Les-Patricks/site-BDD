# Mini-spec — Ticket 13 (recherche onglets Mots / Familles)

## Contexte

Les panneaux **Famille de mots** (`#wordFamilyTab`) et **Mots** (`#wordTab`) exposent deja dans `index.html` un bloc `.tab-panel__search-header` avec un champ `.tab-panel__search-bar` et un bouton `.tab-panel__search-btn`. Aucun comportement n’est branché : la liste d’accordéons rendue dans `.tab-panel__content` n’est ni filtrée ni focalisée.

## Objectif produit

Permettre de **réduire la liste visible** et de **recentrer la vue** sur une correspondance, en s’appuyant uniquement sur le **contenu déjà affiché** (DOM issu du store), sans nouvelle couche serveur.

## Décision produit (précise CA-1301)

- **Unité filtrée** : chaque **ligne de liste** correspond à un enfant direct de `.tab-panel__content` :
  - onglet **Mots** : chaque `.accordion-item` racine ;
  - onglet **Familles** : chaque enfant direct (souvent un wrapper `div` contenant un `.accordion-item` racine pour la famille).
- **Libellé comparé** : le texte affiché du **titre de la ligne**, lu sur le premier `.accordion__button` pertinent dans cette ligne (en pratique le titre de l’accordéon **racine** de la ligne — pour les familles, le nom de la famille, pas les mots imbriqués dans `.accordion__content`).
- **Règle de match** : sous-chaîne, **insensible à la casse**, après `trim` sur la requête ; comparaison sur le libellé normalisé (ex. `toLowerCase()` côté implémentation).
- **Effet visible** : les lignes non correspondantes sont **masquées** (classe CSS dédiée ou équivalent documenté au plan), pas de surlignage obligatoire dans la v1.
- **Aucun résultat** : si la requête est non vide et qu’aucune ligne ne matche alors qu’il existait au moins une ligne avant filtre, afficher un **retour visuel minimal** (ex. attribut `data-*` sur `.tab-panel__content` + message en CSS `::after`, ou message court injecté — choix figé au plan technique).

## Comportement bouton loupe et clavier (CA-1303)

- Le bouton **🔍** **réapplique** le filtre avec la valeur courante du champ (identique à un nouvel `input`) puis fait défiler la vue vers la **première ligne encore visible** (`scrollIntoView`, bloc `nearest` ou équivalent).
- La touche **Entrée** dans le champ déclenche le **même** comportement que la loupe.

## Restauration et périmètre (CA-1302, CA-1304)

- Champ vidé (chaîne vide après trim) : **toutes** les lignes redeviennent visibles ; tout indicateur « aucun résultat » est retiré.
- La recherche est **indépendante par panneau** : le champ du panneau Familles n’affecte que `#familyTabPanelContent` ; celui des Mots que `#wordTabPanelContent`. L’onglet **Langues** reste hors périmètre (pas de barre dans le ticket).

## Données et réseau (CA-1305)

- Aucun appel réseau obligatoire pour filtrer : le filtre s’applique au **DOM déjà rendu** (données déjà en mémoire côté app). Pas d’indexation serveur.

## Réapplication après rechargement de liste

Quand `updateFamilies()` / `updateWords()` reconstruisent le contenu (ex. changement d’onglet, ajout/suppression), le filtre doit **rester cohérent** avec la valeur actuelle du champ du panneau concerné (comportement à détailler au plan : observer de mutations, rappel explicite depuis les onglets, etc.).

## Critères d’acceptation (rappel + précision)

| ID | Énoncé |
|----|--------|
| **CA-1301** | Saisie dans la barre du panneau masque les lignes dont le titre racine ne matche pas ; match sous-chaîne insensible à la casse. |
| **CA-1302** | Effacer la recherche restaure toute la liste et l’état « aucun résultat ». |
| **CA-1303** | Loupe et Entrée = même logique que le filtre + scroll vers première ligne visible. |
| **CA-1304** | Isolation stricte Familles vs Mots (pas d’effet croisé). |
| **CA-1305** | Pas de requête dédiée au filtre. |

## Règles métier cibles (RM)

| ID RM | Énoncé court |
|-------|----------------|
| RM-13-01 | Filtre client sur titre de ligne racine, sous-chaîne, casse ignorée. |
| RM-13-02 | Réinitialisation complète quand la requête est vide. |
| RM-13-03 | Loupe et Entrée alignées (refiltre + scroll première visible). |
| RM-13-04 | Portée limitée au conteneur de l’onglet concerné. |
| RM-13-05 | Aucune dépendance réseau pour le filtre. |
| RM-13-06 | Cohérence après reconstruction du contenu liste. |

## Matrice RM → CA

| RM | CA |
|----|-----|
| RM-13-01 | CA-1301 |
| RM-13-02 | CA-1302 |
| RM-13-03 | CA-1303 |
| RM-13-04 | CA-1304 |
| RM-13-05 | CA-1305 |
| RM-13-06 | CA-1301, CA-1302 |

## Contraintes techniques

- Conserver les classes existantes dans `index.html` : `tab-panel__search-header`, `tab-panel__search-bar`, `tab-panel__search-btn` (ou documenter tout renommage).
- Performance : par interaction, parcours **O(n)** sur les lignes du panneau ; éviter re-render complet de la liste depuis le store **uniquement** pour le filtre (le filtre agit sur la vue).

## Hors-périmètre

- Recherche full-text serveur / Elasticsearch.
- Ticket 12 (autocomplétion ajout mot dans famille).
- Filtre sur les mots **imbriqués** sous une famille (n’entre pas dans le libellé de ligne racine pour ce ticket).

## État initial repéré

- `index.html` : barres sur `#wordFamilyTab` et `#wordTab` uniquement.
- `js/tabs/familyTab.js` : contenu `#familyTabPanelContent` ; lignes familles avec wrapper + accordéon.
- `js/tabs/wordTab.js` : contenu `#wordTabPanelContent` ; accordéons mots.
- `js/main.js` : ouverture d’onglet appelle `updateFamilies()` / `updateWords()`.

## Risques

- Désynchronisation filtre / DOM après `textContent = ""` + re-render si la réapplication n’est pas branchée.
- `querySelector` trop large incluant les titres de mots imbriqués : à éviter en ciblant explicitement le titre **racine** de la ligne.

## Mitigation

- Sélecteur ou algorithme de résolution du nœud « titre racine » validé en test (famille avec mots enfants + mot seul).

---

**STOP — validation requise avant plan technique** (`docs/taches/ticket_13/plan_technique.md`).
