# Mini-spec - Ticket 11

## Contexte
Au chargement de `index.html`, `main.js` appelle `admin-bootstrap` de facon synchrone au demarrage du module (`await fetchData()`). Pendant ce delai, l'utilisateur voit la structure HTML (onglets, panneaux) sans indication que les donnees arrivent, ce qui peut laisser croire a un blocage.

## Objectif produit
Afficher un **etat de chargement visible et coherent** avec le backoffice existant pendant toute la duree du bootstrap, puis le retirer en **succes** ou en **erreur**, sans modifier le contrat `admin-bootstrap` ni bloquer durablement l'interface en cas d'echec.

## Perimetre fonctionnel
- Introduire un indicateur de chargement **global** (overlay, bandeau ou zone dediee) visible des le debut effectif du bootstrap jusqu'a resolution (succes ou erreur).
- En **succes** : masquer l'indicateur, laisser le flux actuel (`hydrateStore`, onglets, `displayPublishBtn` / `hidePublishBtn` selon `publishPending`) inchangé fonctionnellement.
- En **erreur** : retirer l'indicateur de chargement, conserver le comportement actuel (toast `notify`, banniere `.bootstrap-error-banner`, desactivation des boutons critiques, `hidePublishBtn()`).
- **Publish** : aucune regression sur la visibilite / l'etat du bouton `Publish` apres bootstrap reussi (alignement avec CA-1104).
- **Tests** : couvrir au minimum parcours bootstrap **succes** et **erreur** (CA-1105), en s'appuyant sur les patterns existants (`ticket_10.main.bootstrap.test.js`, mocks `invoke`).

## Regles metier cibles
- **Chargement** : tant que `fetchData()` n'a pas termine (promesse en cours), l'indicateur reste visible.
- **Succes** : indicateur absent ou non bloquant ; l'UI devient interactive comme aujourd'hui apres `bootstrapOk === true`.
- **Echec** : indicateur retire ; message d'erreur **lisible** (reutiliser ou completer les canaux existants : banniere + `notify` sans doublon incoherent).
- **Accessibilite minimale** : le chargement annonce un etat d'attente (ex. `role="status"` ou `aria-busy` sur conteneur pertinent), sans refonte a11y globale.
- **Contrat Edge** : pas de changement de payload / semantique `admin-bootstrap`.

## Criteres d'acceptation (rappel + precision)
- **CA-1101** : indicateur visible pendant tout le bootstrap en cours.
- **CA-1102** : indicateur retire quand les donnees sont chargees ; UI interactive comme aujourd'hui.
- **CA-1103** : en erreur bootstrap, message explicite affiche ; etat loading retire ; pas de blocage durable (boutons deja desactives + reload possible).
- **CA-1104** : pas de regression sur l'etat du bouton `Publish` apres succes (pending vs non-pending).
- **CA-1105** : tests automatises pour succes et erreur du bootstrap.

## Matrice RM -> CA

| ID RM | Enonce court | CA |
|-------|----------------|-----|
| RM-11-01 | Feedback visuel continu pendant l'appel bootstrap | CA-1101 |
| RM-11-02 | Disparition du chargement et restauration d'interaction en succes | CA-1102 |
| RM-11-03 | Fin de chargement + message clair + absence de blocage infini en erreur | CA-1103 |
| RM-11-04 | Comportement `Publish` post-bootstrap identique au reference actuel | CA-1104 |
| RM-11-05 | Preuve automatisee succes / erreur | CA-1105 |

## Contraintes techniques
- HTML / JS modules sans framework ; integration dans `index.html` et/ou `js/main.js` et styles dans `css/style.css` (reutiliser tokens / BEM existants).
- Ne pas dependre d'un skeleton par onglet (hors-perimetre ticket).
- Conserver `js/publish.js` et la logique `displayPublishBtn` / `hidePublishBtn` sauf ajustement minimal necessaire a la non-regression.

## Hors-perimetre
- Skeletons detailles par tab.
- Refonte du systeme de notifications.
- Optimisation backend des temps de reponse.

## Etat initial repere
- `js/main.js` : `fetchData()` + `try/catch` top-level, pas d'UI de chargement avant resolution.
- `css/style.css` : styles `.bootstrap-error-banner*` pour l'echec uniquement.
- `js/tests/ticket_10.main.bootstrap.test.js` : mocks `invoke`, assertions sur `notify` et banniere erreur.

## Risques identifies
- Flash du contenu avant affichage du loader si le loader est injecte trop tard par JS.
- Double message (loader + toast) si transitions mal cadrees sur erreur.
- Tests DOM fragiles si selecteurs de loader non stables.

## Strategie de mitigation
- Preferer marqueur HTML statique minimal + activation via classe/CSS, ou injection tres tot dans `main.js` avant `await fetchData()`.
- En erreur, retirer le loader dans le meme `catch` que les messages existants.
- Prefixe BEM dedie (ex. `bootstrap-loading`) et tests sur classe / role.

## Estimation de charge
**S** (ordre 0,25 a 0,75 j) : UI loading + fil de tests + verification manuelle Publish.
