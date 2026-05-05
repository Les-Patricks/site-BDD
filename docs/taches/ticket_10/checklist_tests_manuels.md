# Checklist — tests manuels (ticket 10 : notifications)

Environnement : backoffice servi localement ou sur Hosting **dev**, avec `js/supabase-config.js` valide et session authentifiee quand necessaire.

Cocher au fur et a mesure. Noter navigateur + date en bas si utile pour la traçabilite.

---

## A. Module toasts (comportement generique)

- [X] **A1 — Toast success** : apres un **Save** reussi, un toast vert apparait en **bas** avec le texte du type « Donnees enregistrees. », puis disparait seul apres environ **2,5 s** (pas besoin de cliquer).
- [X] **A2 — Toast warning** : sur la page **login**, soumettre le formulaire avec champs vides : un toast **warning** apparait (message sur email / mot de passe requis), duree environ **6 s** ou fermeture naturelle selon le type.
- [X] **A3 — Toast error (persistant)** : provoquer une erreur avec un toast **error** (voir sections B–D) : le toast reste affiche, avec un bouton **Fermer** ; apres clic, il disparait. Pas de `window.alert` du navigateur.
- [X] **A4 — Empilement** : en declenchant deux toasts success rapproches (ex. deux saves successifs), ils s’empilent correctement en bas sans se couper (lisibilite, pas hors ecran critique).

---

## B. Save global (`saveManager`)

- [X] **B1 — Succes** : modifier une donnee puis **Save** : toast success court (cf. A1), bouton Save revient a l’etat normal, bouton **Publish** reapparait si applicable.
- [X] **B2 — Echec** : faire echouer **admin-save** (ex. couper le reseau, ou provoquer une erreur Edge Function connue) puis **Save** : toast **error** avec message du type « Enregistrement impossible : … », bouton Save redevenu cliquable (retry possible, alignement ticket 09).

---

## C. Publication (`databaseTransfer` + flux Publish UI)

- [X] **C1 — Succes** : **Publish** → confirmer : toast **success** en francais du type **« Publication reussie. »** (pas d’alert navigateur), bouton Publish masque comme avant en cas de succes.
- [X] **C2 — Echec** : faire echouer **publish-to-firebase** : toast **error** en francais du type **« Echec de la publication : … »** avec detail, bouton Publish **reste** utilisable pour un nouvel essai (retry).

---

## D. Login (`validation.js` + `login.html`)

- [X] **D1 — Validation** : email et/ou mot de passe vides : **toast warning** uniquement ; pas de texte rouge visible dans la zone legacy `#errorMessage` (elle est masquee).
- [X] **D2 — Identifiants incorrects** : credentials invalides : **toast error** « Identifiants incorrects. », champs en etat **incorrect** (bordure), pas de doublon avec un second canal de message.
- [X] **D3 — Succes** : credentials valides : redirection vers `index.html` sans toast bloquant inutile.

---

## E. Chargement initial — bootstrap (`main.js`)

- [X] **E1 — Cas nominal** : chargement `index.html` avec session valide : donnees presentes, onglets utilisables, pas de banniere rouge d’erreur bootstrap.
- [X] **E2 — Echec bootstrap** : faire echouer **admin-bootstrap** (ex. bloquer la requete, ou token invalide cote fonction) : **toast error** + **banniere** sous le titre (message + bouton **Recharger la page**) ; boutons principaux (onglets, Save, Publish, confirmer/annuler publish) **desactives** ; pas d’initialisation « normale » des onglets (pas de premier clic simule utile).

---

## F. Accessibilite (controle leger)

- [X] **F1** : Avec le **lecteur d’ecran** (ou panneau accessibilite Chrome), un **error** est annonce de maniere prioritaire ; un **success** ne casse pas la lecture de facon incoherente.
- [X] **F2** : Le bouton **Fermer** du toast error est atteignable au **clavier** (Tab) et activable (Entree / Espace).

---

## G. Non-regression rapide

- [X] **G1** : Aucun `alert()` ou `confirm()` du navigateur sur les parcours B–E ci-dessus.
- [X] **G2** : `npm run test` passe en local (suite Vitest), y compris `js/tests/ticket_10.main.bootstrap.test.js` (non-regression echec bootstrap).

---

## Notes (optionnel)

Navigateur : _________________  
Date : _________________  
Observations :  
