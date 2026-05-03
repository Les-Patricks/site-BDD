# Notifications UI (ticket 10)

Module : `js/notify.js`  
Styles : `css/notify.css` (charge par `index.html` et `login.html`).

## API

- `notify.success(message, options?)` — dismiss automatique apres **4 s** par defaut.
- `notify.warning(message, options?)` — dismiss automatique apres **6 s** par defaut.
- `notify.error(message, options?)` — **pas** d’auto-dismiss ; bouton **Fermer** (`aria-label="Fermer"`).
- `notify.show({ type, message, durationMs? })` — point d’entree generique.

`options.durationMs` permet de surcharger la duree pour `success` / `warning` (ex. **2500** ms pour un succes de sauvegarde discret, selon le plan ticket 10).

## Comportement

- Conteneur cree sous `document.body` si absent (pas de `notify-root` obligatoire dans le HTML).
- Position : **bas de l’ecran**, pile verticale.
- **Accessibilite** : zone conteneur `aria-live="polite"` ; chaque item `success` / `warning` en `role="status"` ; item `error` en `role="alert"` et `aria-live="assertive"`.

## Points d’integration (backoffice)

- **`js/saveManager.js`** : succes → `notify.success("Donnees enregistrees.", { durationMs: 2500 })` ; echec → `notify.error("Enregistrement impossible : …")`.
- **`js/databaseTransfer.js`** : publication succes (`Publication reussie.`) / erreur (`Echec de la publication : …`) via `notify` (plus d’`alert`).
- **`js/main.js`** : si `admin-bootstrap` echoue → `notify.error` + banniere `.bootstrap-error-banner` (texte + bouton recharger) + desactivation des boutons principaux ; pas d’initialisation des onglets tant que le bootstrap n’a pas reussi.
- **`js/validation.js` (login)** : validation formulaire → `notify.warning` ; echec Supabase → `notify.error` ; `#errorMessage` masque en CSS (`loginStyle.css`) pour eviter tout doublon visuel.

### Ticket 10.1 — CRUD locaux (onglets)

- **`js/tabs/wordTab.js`** : ajout mot — succes → `notify.success("Mot ajoute.", { durationMs: 2500 })` ; cle / nom deja present → `notify.warning("Un mot avec ce nom existe deja.")`. Suppression mot → `Mot supprime.` ; renommage reussi → `Mot renomme.` ; conflit de nom → `Ce nom est deja utilise par un autre mot.` Lignes traduction : suppression → `Traduction supprimee.` ; enregistrement valeur → `Traduction enregistree.`
- **`js/tabs/familyTab.js`** : ajout famille — succes / doublon comme ci-dessus (`Famille ajoutee.` / `Une famille avec ce nom existe deja.`). Ajout d’un mot dans une famille depuis l’accordeon : succes → `Mot associe a la famille.` ; si creation impossible (ex. nom deja pris) → warning explicite. Suppression famille → `Famille supprimee.` ; renommage reussi → `Famille renommee.` ; conflit → `Ce nom est deja utilise par une autre famille.`
- **`js/tabs/languageTab.js`** : ajout langue — `Langue ajoutee.` / `Une langue avec ce nom existe deja.` Suppression langue → `Langue supprimee.` ; renommage reussi → `Langue renommee.` ; conflit → `Ce nom est deja utilise par une autre langue.`

## Tests

`js/tests/ticket_10.notify.test.js` — contrats durees, fermeture error, absence de `window.alert` dans le module.

`js/tests/ticket_10_1.tabAdd.notify.contract.test.js` — presence des appels `notify` sur les onglets (ticket 10.1 : ajouts, renommages, suppressions) et contrat `durationMs: 2500` sur les succes courts (lecture source).

Voir aussi `docs/taches/ticket_10/plan_technique.md` (decisions arretees) et `docs/taches/ticket_10/strategie_notifications.md` (strategie cible ticket 10).

## Tests manuels (ticket 10)

Checklist pas a pas : `docs/taches/ticket_10/checklist_tests_manuels.md`.

## Tickets lies

- **Ticket 10.1** (`docs/taches/ticket_10_1/ticket.md`) : feedback `notify` sur les **actions CRUD des onglets** (ex. ajout de mot duplique vs reussi), hors flux critiques deja couverts par le ticket 10.
