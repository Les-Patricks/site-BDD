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

## Lancement local

Le projet est un site statique. Un build frontend de verification est disponible via Vite.

1. Servir le repo avec un serveur web local.
2. Ouvrir `login.html`.
3. Se connecter avec un compte Supabase autorise.
4. Redirection vers `index.html`.

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

- Les cles client Supabase sont actuellement dans `js/SupabaseManager.js`.
- Le secret de publication Firebase est requis cote fonctions:
  - `SECRET_TOKEN` pour `functions/index.js`
  - `SECRET_TOKEN` pour la fonction Supabase `publish-to-firebase`
- Secrets CI utilises dans GitHub Actions:
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
