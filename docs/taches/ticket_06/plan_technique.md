# Plan technique — Ticket 06 — Quality gate CI (workflow Sonar complet)

## Décision

- **Check requis au merge** : le statut GitHub correspondant au job **`sonarcloud`** du workflow `.github/workflows/sonar.yml` — intitulé du check côté PR en général **SonarCloud** (propriété `name:` du job dans le YAML).
- **Comportement attendu** : échec du job si une étape échoue — **`npm run test`**, **`SonarCloud Scan`**, ou indisponibilité token Sonar — donc merge bloqué une fois le check marqué requis dans les règles de branche.
- **Pas de nouveau workflow** « merge gate » séparé : `sonar.yml` reste la source de vérité (aligné **CA-4**).

## Actions côté GitHub (admin dépôt)

1. **Settings** → **Branches** → **Branch protection rules** → règle pour la branche cible (ex. `main`).
2. Activer **Require status checks to pass before merging**.
3. Dans la liste des checks, sélectionner celui qui correspond au workflow **SonarCloud Analysis** / job **SonarCloud** (le libellé exact peut varier ; se baser sur la liste proposée après au moins une PR ayant fait tourner le workflow).
4. (Recommandé) **Require branches to be up to date before merging** si déjà en usage sur le dépôt, pour éviter de merger un commit non rebased alors que `main` a avancé.
5. Sauvegarder la règle.

*Note* : sans droits admin, documenter ces étapes pour le mainteneur (déjà prévu **CA-3**).

## Actions côté documentation (repo)

| Fichier | Action |
|---------|--------|
| `docs/TESTING.md` | Finaliser la section *Merge et branch protection* : (1) rappel du workflow `sonar.yml` et du job **SonarCloud** ; (2) **liste explicite** du ou des checks à cocher (une fois le nom exact confirmé sur une PR) ; (3) **procédure de vérification reproductible** en sous-listes : PR brouillon + commit qui fait échouer un test → le check **SonarCloud** passe en échec → le bouton merge reste désactivé ; optionnel : mention qu’un quality gate Sonar en échec produit le même effet. |
| `docs/taches/ticket_06.md` | Cocher les cases **Definition of Termine** au fur et à mesure ; lien vers la procédure dans `TESTING.md`. |

## Preuve (**CA-3**)

- **Option A** : capture d’écran des *Branch protection rules* montrant **SonarCloud** (ou nom exact) dans *Required status checks*, + capture d’une PR avec check rouge et merge bloqué.
- **Option B** : uniquement procédure textuelle pas à pas + noms de checks, si pas de capture (contributeur sans accès Settings) — le mainteneur valide visuellement une fois.

Stockage : pas d’obligation d’image dans le repo ; la procédure dans `docs/TESTING.md` suffit comme référence ; les captures peuvent aller dans un commentaire de PR de clôture ou un drive interne — à mentionner en une phrase dans la doc si les preuves sont externes.

## Vérifications techniques (non bloquantes pour le plan)

- `npm run test` en local sur `main` (ou branche de travail) avant de clôturer le ticket.
- Après configuration GitHub : une PR de test (non mergée) avec test volontairement cassé confirme le gate.

## Hors périmètre (rappel)

- Modifier `sonar.yml` ou `sonar-project.properties` sauf si un écart empêche d’identifier le check (peu probable).
- Ajouter un second workflow requis uniquement pour les tests.

## Ordre d’exécution recommandé

1. Confirmer sur une PR ouverte le **nom exact** du check affiché par GitHub pour `sonar.yml`.
2. Mettre à jour `docs/TESTING.md` avec ce nom + procédure de vérification + mention preuve (A/B).
3. Admin : activer les *required status checks* comme ci-dessus.
4. Exécuter la procédure de vérification (PR test) ; archiver preuve selon option A ou B.
5. Mettre à jour `ticket_06.md` (cases cochées).
