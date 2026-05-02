# Mini-spec — Ticket 06 — Quality gate CI avant merge

## Contexte

- Le workflow GitHub Actions `.github/workflows/sonar.yml` (job `sonarcloud`, nom d’affichage du check : **SonarCloud**) enchaîne : install, **`npm run test`** (avec couverture), puis **analyse SonarCloud** (quality gate, couverture, règles Sonar, etc., selon la configuration du projet sur SonarCloud). Il est déclenché sur les PR (`opened`, `synchronize`, `reopened`) et sur `push` vers `main`.
- **Décision périmètre** : le check GitHub **requis pour merger** est le **workflow complet** (job entier), pas un sous-ensemble « tests seuls ». Tout échec d’étape dans ce job — tests **ou** échec du scan / quality gate Sonar — doit bloquer la fusion.
- La doc actuelle (`docs/TESTING.md`) mentionne SonarCloud mais ne formalise pas assez les **checks obligatoires** côté GitHub ni une **procédure de vérification reproductible**.

## Objectif

Garantir et documenter que le check du workflow Sonar (job **SonarCloud**) est **requis pour merger**, et fournir une **preuve ou procédure** pour valider que tout échec de ce pipeline (tests ou Sonar) bloque bien le merge.

## Critères d’acceptation (CA)

- **CA-1** : Sur une PR vers la branche protégée (ex. `main`), le **check requis** correspond au job du workflow `sonar.yml` (ex. **SonarCloud**) : échec si une étape du job échoue, y compris **`npm run test`** ou **SonarCloud Scan** / quality gate.
- **CA-2** : Les **checks GitHub obligatoires pour merge** sont identifiés par leur nom exact (tels qu’affichés sur la PR, typiquement le nom du job) et listés dans la documentation durable (`docs/TESTING.md`).
- **CA-3** : Une **procédure de vérification** est documentée : au minimum une PR de test qui fait échouer les tests ; idéalement aussi comment provoquer ou simuler un échec côté Sonar si utile. Et/ou une **capture** des réglages de branche (required status checks). Si pas d’accès admin : la doc décrit précisément ce que le mainteneur doit activer.
- **CA-4** : Le workflow `sonar.yml` reste la **source de vérité** unique pour ce pipeline qualité en CI (tests + Sonar) ; pas de second workflow concurrent « merge gate » sans justification.

## Hors périmètre

- Aligné avec `ticket_06.md` : pas de réécriture massive des tests, pas de migration CI, pas de campagne e2e.

## Dépendances / risques

- La **configuration des branch protection rules** et des **required status checks** se fait dans les paramètres GitHub du dépôt ; le code seul ne peut pas les « forcer » sans accès admin. Le livrable code/doc doit être explicite sur cette partie « organisation ».

## Definition of Done (rappel)

- Tests OK localement et en CI ; analyse Sonar OK sur la branche (quality gate respectée).
- Merge bloqué si le check **SonarCloud** (workflow `sonar.yml`) échoue — tests **ou** Sonar (vérifié ou procédure + preuve).
- Doc mise à jour.
- Preuve ou procédure reproductible disponible.
