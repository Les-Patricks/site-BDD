# Ticket 10 - Refonte complete des notifications front

1. **Titre** : Refonte complete du systeme de notifications UI du backoffice.
2. **Probleme resolu** : Les notifications actuelles sont heterogenes selon les flux (`save`, `publish`, erreurs reseau, validations), avec une lisibilite et une coherence UX limitees.
3. **Impact** : utilisateur/metier : messages plus clairs, priorisation correcte des informations et reduction des erreurs de comprehension. technique : unification des patterns de notifications et meilleure maintenabilite.
4. **CA cibles** :
   - **CA-1001** : Un composant/pattern unique gere les notifications success, warning et error.
   - **CA-1002** : Les flux critiques (`save`, `publish`, auth, chargement) utilisent ce pattern unifie.
   - **CA-1003** : Les messages utilisateurs sont harmonises (ton, structure, actionnable).
   - **CA-1004** : Accessibilite minimale respectee (role ARIA, focus/lecture ecran, contrastes).
   - **CA-1005** : Des tests couvrent les cas principaux d'affichage/fermeture et non-regression.
   - **CA-1006** : Sur les flux couverts par la refonte, le feedback utilisateur (success, warning, error) passe par le composant ou module de notifications unifie ; plus d'utilisation de `window.alert` pour ces cas.
5. **Contraintes** :
   - Conserver les contrats metier existants (pas de changement des API `save`/`publish`).
   - Eviter les regressions sur les parcours de publication et authentification.
   - Respecter les conventions UI existantes du projet tant que la refonte n'est pas terminee.
   - Ne pas s'appuyer sur `window.alert` pour les notifications sur le perimetre du ticket : exposer un petit module (API stable) au-dessus du pattern unifie (toast, banniere, etc.) et router tous les messages utilisateur concernes par cette API.
6. **Hors-perimetre** :
   - Refonte globale du design system complet.
   - Refonte de navigation ou architecture globale front.
   - Refonte des textes metier hors notifications.
7. **Definition de Termine** :
   - [x] Strategie de notifications cibles formalisee (types, priorites, durees, interactions) — `docs/taches/ticket_10/strategie_notifications.md`.
   - [x] Module ou facade unique d'affichage des notifications (success/warning/error) en place ; les `alert` du perimetre migres vers cette API.
   - [x] Implementation unifiee integree sur les flux critiques front.
   - [x] Couverture de tests mise a jour (`ticket_10.notify.test.js`, `ticket_10.saveManager.notify.test.js`, `databaseTransfer.test.js`).
   - [x] Documentation de reference mise a jour (`docs/NOTIFICATIONS.md`, `docs/TESTING.md`).
8. **Estimation** : M/L (a preciser lors du cadrage technique).

Auto-controle :
- Ticket atomique : non (chantier transverse volontairement decoupe ensuite en sous-taches).
- CA cibles identifies : oui (CA-1001 a CA-1006).
- Hors-perimetre explicite : oui.
