# Ticket 10.1 - Notifications sur les actions CRUD des onglets

1. **Titre** : Feedback utilisateur (`notify`) pour les ajouts / actions locales dans les onglets (mots, familles, langues), au-dela des flux deja couverts par le ticket 10.
2. **Probleme resolu** : Certaines actions metier dans l'UI restent **sans retour explicite** : par exemple ajout d'un mot dont la cle existe deja (**echec silencieux**), ou ajout reussi sans **confirmation** legere. L'utilisateur ne sait pas si l'action a reussi ou a ete ignoree.
3. **Impact** : utilisateur/metier : moins d'erreurs de comprehension, confiance accrue sur les operations locales. technique : reutilisation du module `notify` (`js/notify.js`) documente dans `docs/NOTIFICATIONS.md` sans dupliquer de patterns ad hoc.
4. **CA cibles** :
   - **CA-10101** : En cas d'**echec** d'une creation / action locale couverte (ex. cle deja presente, contrainte non respectee), un message **warning** ou **error** est affiche via `notify`, avec un libelle comprehensible (pas d'echec totalement silencieux sur le perimetre choisi).
   - **CA-10102** : En cas de **succes** d'une creation locale couverte, un retour utilisateur est affiche via `notify` (toast **success** court, aligne sur la strategie du ticket 10 / `NOTIFICATIONS.md`) ou une **regle explicite** « silencieux + documentee » est arretee par type d'action et consignee dans la doc du ticket.
   - **CA-10103** : Les messages sont en **francais**, coherents avec le ton du backoffice (alignement **CA-1003** ticket 10).
   - **CA-10104** : **Aucun** `window.alert` sur ce perimetre ; uniquement `notify.*`.
   - **CA-10105** : Des **tests** couvrent au moins un cas **echec** et un cas **succes** representatif (ex. ajout de mot duplique vs ajout reussi), sans casser les contrats du store.
5. **Contraintes** :
   - Ne pas modifier les **contrats** des fonctions `save()` / `publish()` ni des Edge Functions ; les changements restent dans la couche UI / appels `notify` apres retours du store ou des handlers d'onglets.
   - Reutiliser `js/notify.js` et les durees / types deja definis sauf ajustement documente.
   - Lister explicitement dans le plan technique les **points d'entree** touches (fichiers onglets, helpers d'ajout).
6. **Hors-perimetre** :
   - Refonte du modele de donnees ou des regles metier du store (`state.js`) au-dela du strict necessaire pour exposer un statut succes/echec a l'UI.
   - Notification pour **chaque** micro-action (ex. chaque frappe) : rester sur les actions **significatives** (creations / suppressions / operations a risque de conflit).
   - Ticket 10 lui-meme (deja traite : save global, publish, login, bootstrap).
7. **Definition de Termine** :
   - [x] Perimetre : ajout **mot**, **famille**, **langue** (formulaires onglets) + ajout mot **dans une famille** (callback accordeon).
   - [x] Perimetre etendu : **renommage** / **suppression** (mots, familles, langues) + lignes **traduction** (accordeon mot) : succes `notify.success` court (`durationMs: 2500`), conflit de renommage → `notify.warning`.
   - [x] `notify` branche ; messages FR ; tests `ticket_10_1.tabAdd.notify.contract.test.js` (chaines + contrat `durationMs` sur succes suppression/renommage/traduction) + couverture `state` existante sur doublons.
   - [x] `docs/NOTIFICATIONS.md`, `docs/KNOWN_ISSUES.md`, `docs/TESTING.md` alignes (perimetre ticket 10.1).
8. **Estimation** : S/M (selon nombre d'onglets et de variantes d'echec a traiter).

Auto-controle :
- Ticket atomique : oui (extension UX post ticket 10).
- CA cibles identifies : oui (CA-10101 a CA-10105).
- Hors-perimetre explicite : oui.
- Dependance : **Ticket 10** (module `notify` et doc) suppose disponible.
