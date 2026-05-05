# Ticket 07 - Aligner depot (CI/CD + doc) sur le Dossier Professionnel fige

1. **Titre** : Faire correspondre les workflows GitHub Actions et la documentation du repo a la narration CI/CD du Dossier Professionnel (DP), sans modifier le DP — avec **deux cibles Firebase Hosting** (integration / production).
2. **Probleme resolu** : Le DP n est plus editable. Il decrit un flux Git Flow (`main` production / `dev` integration, branches `feature/*`), des PR vers `dev`, une CI (tests avant merge via GitHub Actions), et un **deploiement continu Firebase Hosting declenche par l integration sur la branche `dev`** (Activite-type 3, exemple 2). Le repo ne reflete qu un seul deploiement **live** sur **push `main`**. Il faut a la fois **coller au DP** (deploiement automatise depuis `dev`) et **garder une URL de production stable** : mettre en place **deux canaux Hosting** sur le meme site (ex. `bluffers-backoffice`) — canal nomme **`dev`** alimente par `push` sur la branche `dev`, canal **`live`** alimente par `push` sur `main` (ou branche protegee equivalente).
3. **Impact** : Alignement jury (DP coherent avec les YAML). Equipe : URL d integration (canal `dev`) distincte de l URL publique prod (`live`) ; les previews PR restent des canaux ephemeres selon le workflow existant. **CORS** : l URL du canal `dev` est une **origine** distincte de `https://bluffers-backoffice.web.app` ; sans mise a jour des listes `allowedOrigins` dans les Edge Functions, le front deploye sur `dev` ne pourra pas appeler l API (erreur navigateur / `origin not allowed`).
4. **CA cibles** :
   - **CA-07-1** : Sur **push `dev`** : deploiement automatise vers un **canal Firebase Hosting non-live** (ex. `channelId: dev` ou nom valide pour l action), avec URL stable documentee pour l equipe.
   - **CA-07-2** : Sur **push `main`** (ou branche prod retenue) : deploiement vers le canal **`live`** (comportement actuel conserve pour la prod).
   - **CA-07-3** : `README.md`, `docs/WORKFLOWS.md` (a creer ou mettre a jour) et references dans `docs/TESTING.md` / `AGENTS.md` si necessaire decrivent : PR preview, CI (Sonar + tests), **deux flux Hosting** (dev vs live), branches declencheurs.
   - **CA-07-4** : Aucune contradiction entre ces documents et les `.github/workflows/*.yml` concernes (verification manuelle).
   - **CA-07-5** : Les tests de contrat sur les workflows (ex. `js/tests/ticket_06.sonar.workflow.contract.test.js`) restent verts ou sont ajustes **uniquement** si les YAML Sonar changent ; ajouter un **contrat leger** sur les workflows Firebase (branches + `channelId` / cibles) si utile, sans dupliquer inutilement le YAML en entier.
   - **CA-07-6** : Apres premiere sortie CI du canal `dev`, **ajouter l origine exacte** (URL `https://...web.app` du canal) dans `allowedOrigins` pour `admin-bootstrap`, `admin-save` et `publish-to-firebase`, puis **redeployer** ces fonctions. Pas de changement de logique metier / RLS / JWT requis si le meme projet Supabase sert dev et prod ; seul le filtre CORS cote navigateur impose cette etape.
5. **Contraintes** :
   - Le DP est la **reference fonctionnelle** ; le code et la doc du repo s y plient.
   - **Un seul site Hosting** dans `firebase.json` (ex. `bluffers-backoffice`) : deux **canaux** (`dev` + `live`), pas obligatoirement un second site Firebase **sauf** decision explicite.
   - Pas de refonte large des pipelines : **etendre** `firebase-hosting-merge.yml` (ou scinder en jobs / workflows clairs) de facon **minimale**.
   - Conserver le job **SonarCloud** tel que contrat ticket 06 (nom, `npm run test` avant scan) sauf evolution explicitement necessaire.
   - Distinguer clairement : preview PR (ephemere), canal **`dev`** (integration), canal **`live`** (prod).
6. **Hors-perimetre** :
   - Modifier le fichier PDF / contenu du DP.
   - Second **projet** Firebase ou multi-site Hosting **supplementaire** (hors besoin : rester sur les canaux du meme site, **sauf** si la console Firebase ou la politique du projet impose un second site).
   - Renommer ou supprimer le check requis SonarCloud sans mettre a jour le contrat et `docs/TESTING.md`.
7. **Definition de Termine** :
   - [x] Workflow(s) merge : **push `dev`** -> deploy Hosting canal **dev** ; **push `main`** -> deploy canal **live** (secrets / service account inchanges **sauf** besoin).
   - [x] URLs ou procedure pour retrouver l URL du canal `dev` documentee (console Firebase / sortie CI).
   - [x] Comportement **Deploy to Firebase Hosting on PR** documente (preview).
   - [x] `README.md` et `docs/WORKFLOWS.md` coherents entre eux et avec les YAML.
   - [x] `npm run test` vert, y compris contrats workflow si touches.
   - [x] Origines CORS Edge Functions a jour pour le canal Hosting `dev` (et redeploiement des trois fonctions).
8. **Estimation** : S-M (deux declencheurs Hosting + CORS Edge + doc + eventuel test contrat Firebase).

Auto-controle :
- Ticket atomique : oui (CI Hosting dev+live + doc + CORS).
- CA cibles identifies : oui.
- Hors-perimetre explicite : oui.
- **Note** : Valider une fois dans la console Firebase que le canal `dev` est autorise / visible pour le compte de deploiement (meme contraintes que `live`).
