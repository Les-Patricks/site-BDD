# Plan technique — Ticket 07 — Hosting dev + live, doc, CORS Edge

## Decision

- **Un seul fichier** `.github/workflows/firebase-hosting-merge.yml` etendu : declencheur `push` sur **`main`** et **`dev`**.
- **Deux jobs** mutuellement exclusifs via `if:` sur `github.ref` :
  - **`refs/heads/main`** : meme sequence qu aujourd hui (`write-supabase-config` + `FirebaseExtended/action-hosting-deploy`) avec **`channelId: live`** et `projectId: bluffers-74d8a`.
  - **`refs/heads/dev`** : memes etapes avec **`channelId: dev`** (canal nomme stable cote Firebase, pas `live`).
- **Secrets** : inchanges (`GITHUB_TOKEN`, `FIREBASE_SERVICE_ACCOUNT_*`, `SUPABASE_*`).
- **PR preview** : conserver `firebase-hosting-pull-request.yml` tel quel (deja isole aux PR).
- **Sonar** : ne pas modifier `sonar.yml` sauf besoin imprevu ; preserver le contrat ticket 06.

## CORS (Supabase Edge Functions)

- Fichiers : `supabase/functions/admin-bootstrap/index.ts`, `admin-save/index.ts`, `publish-to-firebase/index.ts` — tableau **`allowedOrigins`** identique sur les trois.
- **Ordre** :
  1. Merger / pousser le YAML pour obtenir un **premier** deploy sur le canal `dev`.
  2. Recuperer l **URL HTTPS complete** du site deploye sur ce canal (logs du job *Deploy to Firebase Hosting* / sortie de l action, ou **Console Firebase** → Hosting → canaux).
  3. Ajouter cette origine **en plus** des existantes (`bluffers-backoffice.web.app`, etc.).
  4. **Redeployer** les trois fonctions (`supabase functions deploy ...` selon scripts du repo / `docs/SETUP.md`).
- Si l equipe prefere une **regle par prefixe** ou variable d env (liste d origines) : hors minimalisme ticket 07 sauf friction forte ; rester sur liste explicite pour la securite actuelle.

## Documentation

| Fichier | Action |
|---------|--------|
| `docs/WORKFLOWS.md` | Ajouter une section dediee **CI/CD** (ou numerotation `6)`) : branches `main` / `dev`, job merge Hosting `live` vs `dev`, rappel workflow PR preview, lien vers `sonar.yml` pour qualite PR. Ne pas supprimer les workflows metier existants. |
| `README.md` | Court paragraphe : URL prod (`live`) vs URL integration (canal `dev`), ou renvoi vers `docs/WORKFLOWS.md`. |
| `docs/TESTING.md` | Si une section parle uniquement de merge sur `main`, ajouter une phrase sur le **deploiement Hosting** depuis `dev` sans confondre avec le check Sonar (declencheurs `sonar.yml` inchanges). |
| `AGENTS.md` | Une phrase optionnelle : deux canaux Hosting + CORS si nouvelle origine. |
| `docs/taches/ticket_07.md` | Cocher les cases **Definition de Termine** a la cloture. |

## Test de contrat (optionnel mais recommande — CA-07-5)

- Nouveau fichier `js/tests/ticket_07.firebase.merge.workflow.contract.test.js` :
  - Lit `.github/workflows/firebase-hosting-merge.yml`.
  - Verifie : declencheur `push` contient **`main`** et **`dev`** ; presence de **`channelId: live`** et **`channelId: dev`** (ou deux blocs deploy distincts avec ces valeurs) ; conservation des etapes `write-supabase-config` / `action-hosting-deploy` identifiables.
- Ne pas dupliquer tout le YAML ; assertions ciblees pour eviter regressions.

## Verifications

- `npm run test` en local apres chaque lot de changements.
- Pas de modification des Edge Functions **sans** l URL reelle du canal `dev` (eviter une origine inventee).

## Ordre d execution recommande

1. Etendre `firebase-hosting-merge.yml` (deux jobs + `if`).
2. Ajouter le test de contrat ticket 07 + `npm run test`.
3. Pousser sur `dev` (ou PR merge vers `dev`) pour premier deploy ; noter l URL du canal.
4. Commit CORS + redeploiement Edge Functions ; documenter l URL dans `docs/WORKFLOWS.md` ou `README`.
5. Mettre a jour `README.md`, `docs/WORKFLOWS.md`, `docs/TESTING.md` / `AGENTS.md` ; cocher `ticket_07.md`.

## Hors perimetre (rappel)

- Modifier le DP ; second site Firebase ; retirer Sonar sans MAJ contrat.
