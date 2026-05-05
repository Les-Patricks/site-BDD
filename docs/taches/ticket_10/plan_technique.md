# Plan technique - Ticket 10

## Objectif technique
Introduire un **module de notifications** (API stable + rendu DOM unique) pour success / warning / error, remplacer les `alert` du perimetre, brancher les flux save / publish / auth / chargement, et satisfaire les exigences a11y minimales (CA-1004) sans modifier les contrats `save` / `publish` cote reseau.

## Decisions arretees (session produit — a reporter dans la strategie DoD du ticket)

Les choix ci-dessous **remplacent** les « defauts proposes » anterieurs ; l'implementation et les tests doivent s'y conformer.

| Sujet | Decision |
|--------|-----------|
| Position des toasts | **Bas de l'ecran**, empilement vertical. |
| Error — fermeture | **Persistant jusqu'au bouton Fermer** ; pas d'auto-dismiss pour les toasts error (sauf evolution ulterieure explicite). |
| Durees auto-dismiss (success / warning generiques) | Conserver les **valeurs de reference du plan** : success environ **4 s**, warning environ **6 s** (constants dans `notify.js` + doc). |
| Save — succes | **Toast success court** : **2,5 s** (valeur unique code + doc ; entre 2 et 3 s). |
| Save — erreur | Toujours **notify.error** (inchangé fonctionnellement). |
| Login — erreurs validation + Supabase | **Uniquement toast** via `notify` ; ne pas s'appuyer sur `#errorMessage` comme canal principal (vider / masquer le paragraphe legacy ou le laisser vide pour eviter double message — detail d'implementation au diff `validation.js`). |
| CSS | **Fichier commun** `css/notify.css` inclus par `index.html` et `login.html`. |
| `notify-root` dans le HTML | **Creation 100 % par JS** si absent ; **pas** d'obligation de `<div id="notify-root">` dans `index.html`. |
| Echec `admin-bootstrap` | **notify.error** + **etat decharge degrade** (ex. banniere ou zone visible « donnees non chargees » / impossible de continuer sans reessayer — formulation et placement au diff `main.js`, sans refonte d'ecran complet). |
| Documentation | **`docs/TESTING.md`** + **`docs/NOTIFICATIONS.md`** (API, durees, comportements error/login/bootstrap). |

### Strategie d'affichage (apres arbitrage)
- Toasts non bloquants, **ancres en bas** de la fenetre, empilement vertical.
- **Error** : toast avec **bouton Fermer** obligatoire + `role="alert"` / `aria-live="assertive"` sur l'item ; pas de timer de disparition par defaut.
- **Save succes** : toast **2,5 s** puis dismiss.
- **Login** : erreurs exclusivement en **toast** (meme module `notify` + `notify.css` sur la page login).

### Accessibilite (cible minimale)
- Conteneur / items : `aria-live="polite"` pour success/warning ; **error** en `role="alert"` / `aria-live="assertive"`.
- Bouton fermer (error) : `type="button"`, libelle accessible (`aria-label`), focusable au clavier.
- Contrastes : reutiliser les couleurs d'erreur / succes existantes ou variables proches dans `notify.css`.

### Langue des messages (perimetre ticket 10)
- **Pas de refonte linguistique globale** : les chaines deja en anglais (ex. publication) peuvent rester en anglais au premier jalon ; les nouveaux messages (save, bootstrap, login via toast) **en francais** pour coherence avec le reste de l'UI backoffice, sauf reemploi volontaire d'une formulation deja etablie.

## Strategie d'implementation

### 1) Module `notify` (coeur)
- Nouveau fichier propose : `js/notify.js` (nom exact a garder stable une fois choisi).
- API minimale exportee :
  - `notify.success(message, options?)`
  - `notify.warning(message, options?)`
  - `notify.error(message, options?)`
  - eventuellement `notify.show({ type, message, ... })` en interne.
- Options possibles : `durationMs`, `dismissible`, `id` (deduplication), `target` (element pour mode inline login — si retenu).
- Implementation : creation du conteneur toast dans `document.body` si absent (permet `login.html` sans marquage HTML obligatoire) ; pour `index.html`, optionnellement noeud dedie dans le HTML pour le placement.
- Pas de dependance a Supabase ; pur DOM + CSS.

### 2) Styles
- Bloc BEM dans **`css/notify.css`** (ex. `.notify`, `.notify__item`, `.notify--success|warning|error`).
- Inclure `notify.css` depuis **`index.html`** et **`login.html`** (en plus de `style.css` / `loginStyle.css`).

### 3) Marquage HTML
- **Pas** de `notify-root` obligatoire : le module **cree** le conteneur sous `document.body` si besoin.
- Verifier l'ordre des `<link>` sur `login.html` pour que les toasts soient styles correctement.

### 4) Migrations d'appel
| Fichier | Changement |
|---------|------------|
| `js/databaseTransfer.js` | Remplacer les deux `alert` par `notify.error` / `notify.success` ; conserver `throw` sur erreur pour les appelants. |
| `js/saveManager.js` | Apres echec `save()` : `notify.error` avec message harmonise (extraire `message` de l'erreur Supabase si disponible). Succes : selon strategie (toast court ou silence). |
| `js/validation.js` | Router les erreurs vers la facade (inline ou toast unique) ; garder classes `.incorrect` sur les champs. |
| `js/main.js` | Entourer `fetchData()` / bootstrap : en cas d'erreur, `notify.error` + eviter etat UI incoherent (ne pas laisser uniquement une rejection non geree). |

### 5) Tests (phase Red puis Green)
- Nouveau fichier propose : `js/tests/notify.test.js` (ou `ticket_10.notify.test.js`).
- Cas minimaux CA-1005 / CA-1006 :
  - affichage d'un item par type avec message attendu ;
  - fermeture manuelle / auto-dismiss (timers avec fausse horloge Vitest) ;
  - absence d'appel a `globalThis.alert` dans les modules migres (assertion ou grep en test d'integration leger) ;
  - non-regression : `databaseTransfer` / `saveManager` declenchent bien `notify` (mocks).
- Mise a jour de `js/tests/databaseTransfer.test.js` : mocker `notify` au lieu de `alert` si les tests comptaient sur `alert`.

### 6) Documentation
- Ajouter une section courte dans `docs/TESTING.md` ou `docs/KNOWN_ISSUES.md` si pertinent : comment tester les notifications, durees, module d'API.
- Option : `docs/NOTIFICATIONS.md` si le comportement depasse quelques paragraphes.

## Decoupage en sous-etapes Green (un diff a la fois, ordre recommande)
1. **Red** : tests `notify` (API + DOM + dismiss) + adapter tests existants qui sur `alert`.
2. **Green** : implementer `js/notify.js` + `css/notify.css` + branchements HTML.
3. **Green** : migrer `databaseTransfer.js` ; faire passer les tests.
4. **Green** : migrer `saveManager.js`.
5. **Green** : migrer `main.js` (bootstrap) et `validation.js`.
6. **Green** : harmoniser textes (CA-1003), relecture a11y rapide.
7. **Green** : doc + `npm run test` complet.

## Impacts fichiers probables
- `js/notify.js` (nouveau)
- `css/notify.css` (nouveau) ou equivalent dans `style.css`
- `index.html`, `login.html`
- `js/databaseTransfer.js`, `js/saveManager.js`, `js/validation.js`, `js/main.js`
- `js/tests/notify.test.js` (nouveau), `js/tests/databaseTransfer.test.js`, eventuellement autres tests d'integration
- `docs/TESTING.md` ou `docs/NOTIFICATIONS.md`

## Risques et mitigations
- **Login** : passage **toast-only** — verifier qu'aucun reste de `#errorMessage` visible ne duplique le toast ; retirer les styles dependants si le paragraphe est vide ou masque.
- **Top-level await dans `main.js`** : combiner **notify.error** + **etat degrade** pour eviter une page « vide » sans explication.
- **Timers en tests** : utiliser `vi.useFakeTimers()` Vitest pour stabiliser auto-dismiss.

## Plan de verification
- `npm run test` (suite complete).
- Manuel : publish succes / erreur, save erreur, login erreur validation + erreur Supabase, chargement avec bootstrap en echec (simulation).
- Controle rapide lecteur d'ecran ou onglet Accessibilite (Chrome) sur un toast error.
