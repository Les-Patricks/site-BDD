# Plan technique - Ticket 11

## Objectif technique
Exposer un **etat UI `loading` de bootstrap** (visible pendant `supabase.functions.invoke("admin-bootstrap")` + traitement `fetchData()`), le **retirer** en succes comme en erreur, et etendre les tests existants pour couvrir succes / erreur sans toucher au contrat Edge `admin-bootstrap`.

## Decisions arretees

| Sujet | Decision |
|--------|-----------|
| Placement DOM | **Marqueur statique** dans `index.html` (ex. `#bootstrapLoadingRoot` ou `div.bootstrap-loading`) **des le premier paint**, pour eviter un flash sans feedback si le loader n'etait cree qu'apres le premier tick JS. |
| Visibilite | Basculer via **classe BEM** sur le conteneur (ex. `.bootstrap-loading` visible par defaut, modificateur `.bootstrap-loading--done` ou `.bootstrap-loading--hidden` pour masquer) plutot que `display:none` inline ; styles dans `css/style.css` a cote des regles `.bootstrap-error-banner*`. |
| Accessibilite | Conteneur : `role="status"`, texte court type « Chargement des donnees… » ; `aria-busy="true"` pendant le chargement, `aria-busy="false"` (ou suppression) une fois termine. |
| Point de commande JS | `js/main.js` : **montrer** l'etat loading des l'entree du module (no-op si deja visible par defaut) ; **masquer** dans le `try` apres `await fetchData()` reussi ; **masquer** en premier dans le `catch` avant `notify` / banniere pour satisfaire CA-1103. |
| Interaction pendant chargement | L'**overlay** couvre le viewport (ou au minimum la zone principale sous le titre) avec `pointer-events: auto` et **z-index** inferieur aux toasts (`notify`) si conflit, superieur au contenu pour empecher les clics (CA-1102 implicite : pas d'UI « interactive » derriere tant que le loader est actif). |
| Publish | Ne **pas** appeler `displayPublishBtn` / `hidePublishBtn` pendant le loading ; conserver l'ordre actuel **apres** `bootstrapOk` uniquement. Verifier qu'aucun style du loader ne force un etat visible sur `#publishBtn` (CA-1104). |

## Strategie d'implementation

### 1) HTML (`index.html`)
- Inserer un bloc minimal **juste apres** `<body>` (ou immediatement apres `<h1>` si l'on veut laisser le titre visible — **recommandation** : overlay plein ecran incluant ou non le `h1` ; variante simple : overlay **sous** le `h1` « Bluffers » pour garder une ancre visuelle ; a trancher au **premier diff** : variante **plein ecran** avec titre + message de chargement pour coherence « application en demarrage »).
- Contenu : message court + indicateur visuel leger (ex. **spinner CSS** pur, pas d'asset image, pour rester S).

### 2) CSS (`css/style.css`)
- Bloc **Ticket 11** : `.bootstrap-loading` (position fixed, fond semi-opaque ou discret aligne sur la palette existante), `.bootstrap-loading__…` pour texte / spinner.
- Etat masque : `.bootstrap-loading--hidden` avec `visibility: hidden` + `pointer-events: none` **ou** `opacity: 0` + transition courte optionnelle (eviter de laisser un layer bloquant si `pointer-events` mal gere).

### 3) JS (`js/main.js`)
- Fonctions locales ou constantes : `showBootstrapLoading()` / `hideBootstrapLoading()` qui ne font que toggler classe / `aria-busy` sur le noeud reference par `getElementById`.
- Appeler `hideBootstrapLoading()` :
  - apres succes (`hydrateStore` + avant logique publish) ;
  - en **debut** de `catch` (avant banniere) pour erreur.
- Ne pas modifier `fetchData()` ni la forme des donnees retournees.

### 4) Tests (`js/tests/`)
- **Erreur** : etendre `ticket_10.main.bootstrap.test.js` (ou fichier dedie `ticket_11.main.bootstrap.loading.test.js` si separation souhaitee) pour verifier qu'apres import en echec, le conteneur de loading porte l'etat **masque** / `aria-busy="false"` (ou classe `--hidden`).
- **Succes** : nouveau cas avec `invokeMock` resolvant `{ data: { languages: [], words: [], … } }` (meme minimal que les autres tests d'hydratation) ; verifier **absence** d'etat loading actif (classe hidden ou equivalent) et comportement publish inchangé (`displayPublishBtn` ou `hidePublishBtn` selon `publishPending`).
- DOM de test : stubber `getElementById` pour retourner un objet minimal `{ classList: { add, remove }, setAttribute, removeAttribute }` pour le **id** du loader en plus des boutons existants.

### 5) Documentation
- Si comportement nouveau notable pour les testeurs : courte mention dans `docs/TESTING.md` (parcours « chargement initial »). Sinon seule la DoD ticket ; pas de nouveau fichier dedie sauf besoin.

## Decoupage Green (ordre recommande, un diff a la fois en phase implementation)
1. HTML + CSS squelette loader (visible par defaut en local si main pas encore charge — acceptable brievement).
2. `main.js` : show/hide branche succes / erreur.
3. Tests + ajustements selecteurs DOM de test.
4. `npm run test` + retouche doc si necessaire.

## Impacts fichiers probables
- `index.html`
- `css/style.css`
- `js/main.js`
- `js/tests/ticket_10.main.bootstrap.test.js` **ou** `js/tests/ticket_11.main.bootstrap.loading.test.js`
- `docs/TESTING.md` (optionnel)

## Risques et mitigations
- **FOUC** : marqueur HTML statique + CSS masquant le contenu principal tant que `.bootstrap-loading--hidden` absent — si trop agressif, limiter l'overlay a la zone onglets uniquement.
- **Tests top-level await** : enrichir les stubs `document.getElementById` pour inclure le noeud loader ; reutiliser le pattern `await import("../main.js")` existant.

## Plan de verification
- `npm run test`.
- Manuel : rechargement page avec reseau lent (throttling) ; verifier disparition du loader et etat `Publish` coherent ; simulation erreur (401 / fonction en erreur) : loader absent, banniere + toast presents.
