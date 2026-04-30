# Architecture technique

## Contexte

Le projet est un backoffice de gestion de dictionnaire pour Bluffers.

Deux couches de donnees:
- **Edition**: Supabase (tables relationnelles)
- **Publication runtime jeu**: Firestore (collections denormalisees)

## Composants principaux

- `index.html`: shell UI principal (tabs, templates, boutons save/publish)
- `login.html`: ecran de connexion Supabase
- `js/main.js`: point d'entree, chargement initial des donnees et orchestration des tabs
- `js/state.js`: etat local en memoire et operations CRUD/logique metier
- `js/tabs/*`: rendu des sections Families / Words / Languages
- `js/SupabaseManager.js`: acces data Supabase (query helpers)
- `js/saveManager.js`: persistance des modifications vers Supabase
- `js/publish.js` + `js/databaseTransfer.js`: publication de Supabase vers Firebase via Edge Function
- `functions/index.js`: Cloud Function Firebase `publishWords` qui ecrit Firestore
- `supabase/functions/publish-to-firebase/index.ts`: Edge Function qui lit Supabase et appelle Firebase Function

## Flux haut niveau

1. Auth utilisateur via Supabase (`login.html` + `validation.js`)
2. Chargement des tables Supabase au demarrage (`main.js`)
3. Edition locale dans `state.js`
4. Save vers Supabase (`saveManager.js`)
5. Publish vers Firestore (`publish-to-firebase` -> `publishWords`)

## CI/CD

- PR: preview Firebase Hosting (`.github/workflows/firebase-hosting-pull-request.yml`)
- Main: deploy live Firebase Hosting (`.github/workflows/firebase-hosting-merge.yml`)
- Qualite: SonarCloud + tests (`.github/workflows/sonar.yml`)
