# Workflows metier

## 1) Authentification

- `login.html` charge `js/validation.js`.
- `validation.js` appelle `supabase.auth.signInWithPassword`.
- En cas de succes, redirection vers `index.html`.
- `index.html` verifie la session (`supabase.auth.getSession`) et renvoie vers `login.html` si absent.

## 2) Chargement initial

`js/main.js`:
- lit `language`, `words`, `word_translation`, `word_family`, `word_family_association`
- hydrate l'etat local via les fonctions de `state.js`
- active la tab Families par defaut

## 3) Edition locale

Les tabs (`js/tabs/*.js`) rendent l'etat courant et deleguent les actions a `state.js`:
- creation/suppression/rename languages
- creation/suppression/rename words
- edition traductions
- creation/suppression/rename families
- association mot <-> famille

## 4) Save vers Supabase

`js/saveManager.js`:
- ecoute le clic sur `#saveBtn`
- appelle `save()` de `state.js`, qui invoque l'Edge Function `admin-save`
- `admin-save` orchestre la persistence et applique l'ecriture atomique globale (`languages`, `words`, `word_translation`, `word_family`, `word_family_association`, suppressions)
- affiche ensuite le bouton Publish

## 5) Publish vers Firebase

- `js/publish.js` affiche une popup de confirmation.
- `js/databaseTransfer.js` invoque la fonction Supabase `publish-to-firebase`.
- `supabase/functions/publish-to-firebase/index.ts`:
  - lit Supabase
  - reformate les donnees
  - appelle `https://us-central1-bluffers-74d8a.cloudfunctions.net/publishWords`
- `functions/index.js`:
  - valide le bearer token (`SECRET_TOKEN`)
  - purge Firestore
  - reecrit `Words` et `WordFamilies`
