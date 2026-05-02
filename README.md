# Site-BDD - Backoffice Bluffers

Outil d'administration web (Vanilla JS) pour gerer le dictionnaire du jeu Bluffers:
- langues
- mots
- traductions
- familles de mots

Le backoffice ecrit dans **Supabase** puis publie une projection exploitable vers **Firebase Firestore**.

## Demarrage rapide

1. Installer les dependances:
```bash
npm install
```

2. Lancer un serveur statique (exemple VS Code Live Server) et ouvrir:
- `login.html` pour se connecter
- puis `index.html` pour l'interface principale

3. Lancer les tests:
```bash
npm run test
```

## Documentation

- Vue d'ensemble: `docs/INDEX.md`
- Architecture: `docs/ARCHITECTURE.md`
- Installation et environnement: `docs/SETUP.md`
- Modele de donnees: `docs/DATA_MODEL.md`
- Flux metier (save/publish/auth): `docs/WORKFLOWS.md`
- Tests et qualite: `docs/TESTING.md`
- Limites connues: `docs/KNOWN_ISSUES.md`
- Contribution projet: `CONTRIBUTING.md`
- Contexte IA (pour assistants): `AGENTS.md`

## Stack technique

- Frontend: HTML/CSS/JavaScript ES Modules (sans framework)
- Auth et stockage primaire: Supabase (PostgreSQL + Auth + Edge Function)
- Publication prod: Firebase Cloud Functions + Firestore
- Tests: Vitest
- CI/CD: GitHub Actions + Firebase Hosting + SonarCloud

## Deploiement (Firebase Hosting)

- **Production** : push sur `main` deploie le canal Hosting **`live`** (URL habituelle `https://bluffers-backoffice.web.app` et domaine `firebaseapp.com` associe).
- **Integration** : push sur `dev` deploie le canal nomme **`dev`** (URL du type `https://bluffers-backoffice--dev-*.web.app` ; voir sortie du workflow GitHub ou la console Firebase → Hosting → canaux).
- **Previews** : chaque PR declenche un deploiement preview (`firebase-hosting-pull-request.yml`), URL ephemere par PR.

Detail des workflows et CORS : `docs/WORKFLOWS.md` (section CI/CD).

## Scripts utiles

- `npm run test`: execute les tests unitaires avec couverture
- `npm run test:watch`: mode watch Vitest
- `npm run deploy:publish` : deploie la fonction Supabase `publish-to-firebase` (idem `deploy:admin-save`, `deploy:admin-bootstrap`). Ces endpoints exigent un JWT utilisateur valide cote appelant ; voir `docs/SETUP.md` section Supabase Edge Functions.

## Etat du code

Le repository contient du code legacy encore present dans certains modules (`state`, `saveManager`) et des tests qui ciblent une ancienne API d'etat. Voir `docs/KNOWN_ISSUES.md` avant toute refonte.

