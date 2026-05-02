# Workflows metier

## 1) Authentification

- `login.html` charge `js/validation.js`.
- `validation.js` appelle `supabase.auth.signInWithPassword`.
- En cas de succes, redirection vers `index.html`.
- `index.html` verifie la session (`supabase.auth.getSession`) et renvoie vers `login.html` si absent.

### Session et Edge Functions (JWT)

Apres connexion, chaque `supabase.functions.invoke` vers `admin-bootstrap`, `admin-save` ou `publish-to-firebase` envoie automatiquement le **JWT de session** utilisateur. Ces endpoints sont deployes **avec verification JWT** cote Supabase (scripts `npm run deploy:*` sans `--no-verify-jwt` ; detail dans `docs/SETUP.md`). Un appel HTTP direct (curl, script) doit inclure `Authorization: Bearer <access_token>` obtenu via Supabase Auth.

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

## 6) CI/CD — GitHub Actions et Firebase Hosting

| Workflow | Declencheur | Effet |
|----------|-------------|--------|
| `.github/workflows/firebase-hosting-merge.yml` | `push` sur **`main`** | Deploie le site sur le canal Hosting **`live`** (production). |
| Meme fichier | `push` sur **`dev`** | Deploie sur le canal nomme **`dev`** (integration ; URL stable une fois le canal cree). |
| `.github/workflows/firebase-hosting-pull-request.yml` | `pull_request` (depot interne) | Preview Hosting (URL par PR). |
| `.github/workflows/sonar.yml` | `push` sur `main`, et PR | Tests + analyse SonarCloud (quality gate). |

Les etapes de build injectent `js/supabase-config.js` via `scripts/write-supabase-config.mjs` et les secrets `SUPABASE_URL` / `SUPABASE_ANON_KEY` en CI.

### CORS (Edge Functions)

Le front appele `admin-bootstrap`, `admin-save` et `publish-to-firebase` depuis l **origine** du navigateur (`Origin`). Chaque **nouvelle** URL Hosting (canal `dev`, preview PR, etc.) doit etre ajoutee dans la liste centralisee `ALLOWED_ORIGINS` du module `supabase/functions/_shared/corsOrigins.ts`, puis les fonctions redeployees — sinon le navigateur bloque les requetes (`origin not allowed`). Les URLs `web.app` / `firebaseapp.com` de **production** sont deja listees ; apres le **premier** deploiement reussi sur le canal `dev`, copier l URL exacte depuis les logs du workflow ou Firebase Console et mettre a jour ce module partage.
