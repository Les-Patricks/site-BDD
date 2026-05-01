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

### Supabase Edge Function

Le repo contient `supabase/functions/publish-to-firebase/`.
Le script racine:

```bash
npm run deploy:publish
```

deploie cette fonction vers le projet Supabase configure.
