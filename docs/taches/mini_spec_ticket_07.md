# Mini-spec — Ticket 07 — CI/CD Hosting dev + live aligne DP

## Contexte

- Le Dossier Professionnel (fige) decrit : Git Flow (`main` / `dev` / `feature/*`), PR vers `dev`, CI GitHub Actions sur les PR, et un **deploiement Firebase Hosting automatise depuis l integration sur `dev`** tout en conservant une **production** identifiable.
- Aujourd hui : un workflow **merge** deploie le canal **`live`** sur **push `main`** uniquement (`firebase-hosting-merge.yml`). Pas de deploiement dedie branche `dev`.
- Le front appele des **Edge Functions** Supabase avec une liste **CORS** stricte (`allowedOrigins`) : les URLs des **canaux Hosting** non-default (`--dev-...web.app`) ne sont pas autorisees sans ajout explicite.

## Objectif

Mettre en place **deux declencheurs** sur le meme site Hosting (`bluffers-backoffice`) : **push `dev`** -> canal nomme **dev** ; **push `main`** -> canal **live**. Documenter le flux (preview PR, Sonar, branches). Mettre a jour **CORS** dans les trois Edge Functions puis **redeployer** (meme projet Supabase, pas de changement RLS/JWT metier).

## Critères d’acceptation (CA)

- **CA-07-1** : Push `dev` -> deploy Hosting canal non-live (`dev` ou equivalent action).
- **CA-07-2** : Push `main` -> deploy canal `live` (comportement prod conserve).
- **CA-07-3** : `README.md`, `docs/WORKFLOWS.md`, et ajustements `docs/TESTING.md` / `AGENTS.md` si utile : preview PR, CI, dev vs live, branches.
- **CA-07-4** : Doc et YAML sans contradiction (verification manuelle).
- **CA-07-5** : `npm run test` vert ; contrat `ticket_06` intact sauf si `sonar.yml` change ; contrat leger Firebase optionnel.
- **CA-07-6** : Origine URL du canal `dev` dans `allowedOrigins` pour `admin-bootstrap`, `admin-save`, `publish-to-firebase` + redeploiement.

## Hors périmètre

- Modifier le PDF DP ; second projet Firebase ou multi-site supplementaire (sauf contrainte console) ; retirer Sonar sans mettre a jour contrat / doc.

## Dependances / risques

- L **URL exacte** du canal `dev` est connue apres **premier** deploy reussi (sortie CI ou console Firebase) : ordre d implementation **deploy dev** puis **commit CORS** avec cette URL (ou placeholder documente si CI expose l URL de facon fiable).
- Branch protection : pas modifiee dans ce ticket sauf doc.

## Definition of Done (rappel)

- Alignement avec `ticket_07.md` section Definition de Termine (cases cochees en PR / review).
