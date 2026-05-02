# Setup et execution locale

## Prerequis

- Node.js (LTS recommande)
- npm
- Un serveur statique (VS Code Live Server, `npx serve`, etc.)
- Acces reseau vers Supabase

## Installation

```bash
npm install
```

## Configuration Supabase (client navigateur)

Le backoffice charge l’URL du projet et la cle **anon** depuis `js/supabase-config.js` (fichier **non versionne**). Sans ce fichier, les pages qui importent `js/SupabaseManager.js` echouent au chargement avec un message explicite.

1. Copier `js/supabase-config.example.js` vers `js/supabase-config.js`.
2. Renseigner `supabaseUrl` et `supabaseAnonKey` (Supabase : *Project Settings* → *API* — cle `anon` **public**, exposee au navigateur par design).
3. Ne jamais committer `js/supabase-config.js`.

Alternative (CI / script) : generer le fichier a partir des variables d’environnement :

```bash
set SUPABASE_URL=https://votre-projet.supabase.co
set SUPABASE_ANON_KEY=votre_cle_anon
node scripts/write-supabase-config.mjs
```

(Sous Unix : `export SUPABASE_URL=...` puis la meme commande `node`.)

## Lancement local

Le projet est un site statique. Un build frontend de verification est disponible via Vite.

1. Avoir cree `js/supabase-config.js` (voir section precedente).
2. Servir le repo avec un serveur web local.
3. Ouvrir `login.html`.
4. Se connecter avec un compte Supabase autorise.
5. Redirection vers `index.html`.

## Commandes qualite (racine)

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Notes:
- `lint` et `typecheck` sont actuellement des scripts minimaux d'information.
- `test` execute Vitest avec couverture.
- `build` genere les assets de production dans `dist/`.

## Variables et secrets

- **Client Supabase (Hosting / CI)** : avant chaque deploiement Firebase Hosting, le workflow GitHub execute `scripts/write-supabase-config.mjs` avec les secrets du depot :
  - `SUPABASE_URL` — URL du projet (ex. `https://xxxx.supabase.co`)
  - `SUPABASE_ANON_KEY` — cle anon (meme nom que pour les tests d’integration locaux utilisant ces variables)
- Les memes noms peuvent etre utilises en local pour regenerer `js/supabase-config.js` sans editer le fichier a la main (voir section *Configuration Supabase*).
- Le secret de publication Firebase est requis cote fonctions:
  - `SECRET_TOKEN` pour `functions/index.js`
  - `SECRET_TOKEN` pour la fonction Supabase `publish-to-firebase`
- Autres secrets CI (GitHub Actions) :
  - `FIREBASE_SERVICE_ACCOUNT_BLUFFERS_74D8A`
  - `SONAR_TOKEN`

## Fonctions serveur

### Firebase Functions (`functions/`)

```bash
cd functions
npm install
npm run lint
npm run serve
```

### Supabase Edge Functions

Fonctions dans `supabase/functions/` : `publish-to-firebase`, `admin-save`, `admin-bootstrap`.

Scripts de deploiement (JWT verifie par la plateforme apres deploy — ne pas utiliser `--no-verify-jwt`) :

```bash
npm run deploy:publish
npm run deploy:admin-save
npm run deploy:admin-bootstrap
```

#### Authentification (JWT)

Les invocations HTTP vers ces endpoints doivent inclure un JWT Supabase valide : en-tete `Authorization: Bearer <access_token>` (session utilisateur).

- **Backoffice** : apres connexion, `supabase.functions.invoke(...)` envoie automatiquement le token de session. Les flux bootstrap, sauvegarde et publication supposent un utilisateur connecte.
- **Appels externes** (curl, scripts, Postman) : obtenir un `access_token` via Supabase Auth puis l’envoyer dans `Authorization`. Sans JWT valide, la plateforme rejette la requete (erreur d’authentification) avant execution du handler.
