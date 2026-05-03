# Strategie de notifications — Ticket 10

Document de reference pour la **Definition de Termine** du ticket 10 (types, priorites, durees, interactions). Les details d’implementation sont dans `plan_technique.md` et `docs/NOTIFICATIONS.md`.

## Types

| Type | Usage | Comportement par defaut |
|------|--------|-------------------------|
| **success** | Action reussie (save global, publication reussie) | Toast `role="status"`, `aria-live="polite"`, auto-dismiss |
| **warning** | Avertissement non bloquant (ex. validation login) | Idem success cote a11y ; duree 6 s par defaut |
| **error** | Echec a signaler fortement | `role="alert"`, `aria-live="assertive"`, **pas** d’auto-dismiss ; bouton **Fermer** obligatoire |

## Durees (defauts code `js/notify.js`)

| Cas | Duree |
|-----|--------|
| `notify.success` (generique) | 4 s |
| `notify.success` apres **save** global | **2,5 s** (`durationMs` dans `saveManager.js`) |
| `notify.warning` | 6 s |
| `notify.error` | Persistant jusqu’au clic **Fermer** |

## Priorite / bruit

- **Save global reussi** : toast court (2,5 s) pour confirmer sans surcharger.
- **Publication** : succes et erreur en toast (succes 4 s ; erreur persistante).
- **Bootstrap** : erreur en toast **+** banniere `.bootstrap-error-banner` + desactivation des actions principales.
- **Login** : uniquement toasts ; pas de canal parallele sur `#errorMessage` (masque en CSS).

## Interactions

- Fermeture error : bouton avec `aria-label="Fermer"`.
- Rechargement apres echec bootstrap : bouton **Recharger la page** dans la banniere.

## Perimetre couvert par le ticket 10

- `databaseTransfer.js`, `saveManager.js`, `validation.js`, `main.js` (bootstrap), module `notify.js` + `notify.css`.

## Hors ticket 10

- Feedback sur les **actions CRUD des onglets** (ajout mot duplique, etc.) : voir **ticket 10.1** (`docs/taches/ticket_10_1/ticket.md`).
