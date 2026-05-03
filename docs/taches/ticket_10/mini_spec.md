# Mini-spec - Ticket 10

## Contexte
Les retours utilisateur du backoffice sont heterogenes : `window.alert` sur la publication (`js/databaseTransfer.js`), absence de message explicite visible sur echec de sauvegarde (`js/saveManager.js` se limite a `console.error`), zone d'erreur dediee sur la page de login (`js/validation.js`). La lisibilite et la coherence UX en souffrent ; l'accessibilite des `alert` natives est limitee.

## Objectif produit
Offrir un **systeme de notifications unifie** (success, warning, error) avec une **API de module stable**, integre aux flux critiques, en **remplacant les `alert`** sur le perimetre couvert et en harmonisant le ton et la structure des messages.

## Perimetre fonctionnel
- Introduire un **composant ou pattern visuel unique** (ex. toasts ou zone de messages non bloquante) pour success / warning / error.
- Exposer une **facade JS** (ex. `notify.success(message)`, `notify.error(message, options?)`) utilisee par le code metier au lieu d'appels directs au DOM ou a `alert`.
- **Publish** : succes et erreur passent par cette API (migration depuis `databaseTransfer.js`).
- **Save** : en succes comme en echec, un retour utilisateur explicite via le pattern unifie (au minimum erreur ; succes peut rester discret mais coherent avec la strategie formalisee).
- **Auth (login)** : erreurs de validation et Supabase via **toasts `notify` uniquement** (voir `plan_technique.md` — decisions arretees) ; garder les classes `.incorrect` sur les champs ; ne pas dupliquer avec `#errorMessage`.
- **Chargement** : erreurs `admin-bootstrap` sur `main.js` routees vers `notify` + etat degrade ; strategie consolidee dans `docs/taches/ticket_10/strategie_notifications.md`.

## Regles metier cibles
- Toute notification **success / warning / error** sur le perimetre du ticket doit emprunter la **meme voie** (CA-1001, CA-1006).
- Les **contrats** des fonctions `save()` et `publish()` (payloads, Edge Functions) **ne changent pas** ; seul le feedback UI et le code d'affichage evoluent.
- **Duree d'affichage** et **priorite** (ex. erreur plus persistante qu'un succes) : definies dans la strategie cible (DoD ticket) puis implementees de maniere coherente.
- **Accessibilite** : roles ARIA adaptes (`alert` / `status` selon le type), annonce compatible lecteur d'ecran, contrastes conformes au reste du backoffice (CA-1004).

## Criteres d'acceptation (rappel + precision)
- **CA-1001** : un seul mecanisme d'affichage pour success, warning et error (styles et comportements derives du meme socle).
- **CA-1002** : flux save, publish, auth et chargement concernes branches sur ce mecanisme.
- **CA-1003** : textes harmonises (ton, structure courte, indication d'action si pertinent).
- **CA-1004** : exigences a11y minimales respectees et verifiables manuellement ou via tests lorsque possible.
- **CA-1005** : tests sur affichage, fermeture / auto-dismiss, et non-regression des flux branches.
- **CA-1006** : aucun `window.alert` pour ces notifications sur le perimetre ; usage exclusif de la facade module.

## Contraintes techniques
- Pas de modification des **API** `save` / `publish` cote Supabase ou contrats de reponse attendus par le front.
- Pas de regression sur **publication** et **authentification** (parcours complets inchanges du point de vue metier).
- **Stack actuelle** : HTML / JS modules sans framework ; le pattern doit s'integrer a `index.html`, `login.html` et aux scripts existants.
- Documentation durable du repo mise a jour en fin de chantier (ex. `docs/TESTING.md` ou fiche dediee notifications si creee).

## Hors-perimetre
- Refonte globale du design system.
- Refonte navigation / architecture front globale.
- Reecriture des textes metier hors messages de notification.
- Remplacement systematique de `confirm` (non exige par le ticket 10 ; traitement ulterieur si besoin).

## Etat initial repere (inventaire minimal)
- `js/databaseTransfer.js` : `alert` succes / erreur publication.
- `js/saveManager.js` : pas de notification utilisateur sur echec (console uniquement).
- `js/validation.js` : toasts `notify` + classes `.incorrect` ; `#errorMessage` masque (legacy).

## Risques identifies
- **Surcharge visuelle** si chaque save succes declenche un toast (equilibre a definir dans la strategie).
- **Doublons** message inline login + toast si migration mal cadree.
- **Tests** : DOM dynamique et timers (auto-dismiss) fragilisent les tests sans utilitaires dedies.

## Strategie de mitigation
- Formaliser types, durees et cas **obligatoires vs silencieux** avant d'etendre a tous les flux.
- Migrer l'auth en une seule etape coherente (spec technique au plan).
- Centraliser la facade et mocker le conteneur DOM dans les tests unitaires.

## Estimation de charge
Estimation globale : **M** (ordre de **1 a 3 jours** selon profondeur a11y et nombre de points d'integration).

Decoupage indicatif :
- Strategie + squelette HTML/CSS + module `notify` : 0,25 a 0,5 j
- Migration publish + save + tests : 0,25 a 0,75 j
- Auth + chargement + harmonisation textes : 0,25 a 0,75 j
- Durcissement a11y + doc : 0,25 a 0,5 j
