# Ticket 06 - Verifier et verrouiller le quality gate CI avant merge

1. **Titre** : Verifier et formaliser le blocage de merge par le workflow Sonar (tests + SonarCloud / quality gate).
2. **Probleme resolu** : Il faut confirmer que le merge est bloque quand le check du workflow `sonar.yml` echoue — pas seulement les tests unitaires, mais aussi l'analyse Sonar (couverture, quality gate, etc.). Sans ce verrou sur le job complet, la qualite depend encore d'une discipline manuelle.
3. **Impact** : utilisateur/metier : baisse du risque de regressions en production. technique : garantie process via checks requis sur Pull Request.
4. **CA cibles** : Voir `docs/taches/mini_spec_ticket_06.md` (check requis = job **SonarCloud** du workflow `sonar.yml`, echec tests ou Sonar bloque le merge ; doc + preuve / procedure).
5. **Contraintes** :
   - Conserver le workflow existant `sonar.yml` comme source de verite CI (tests + Sonar).
   - Definir clairement les checks obligatoires pour merge.
   - Documenter la regle dans la doc projet.
6. **Hors-perimetre** :
   - Ecriture massive de nouveaux tests.
   - Migration vers un autre outil CI.
   - Ajout d'une campagne e2e complete.
7. **Definition de Termine** :
   - [x] Les tests passent localement et en CI.
   - [x] Le check requis (workflow Sonar / job SonarCloud) bloque un merge si echec (tests ou Sonar / quality gate).
   - [x] La regle est documentee dans `docs/TESTING.md` ou `docs/WORKFLOWS.md`.
   - [x] Une preuve de verification est disponible (capture ou procedure reproduisible) — procedure pas a pas : `docs/TESTING.md` section *Merge et branch protection (Ticket 06)*.
8. **Estimation** : XS.

**Cloture** : reglage GitHub (required check **SonarCloud**) et PR de verification merge bloque effectues ; `main` de retour en vert apres fermeture / revert de la branche de test.

Auto-controle :
- Ticket atomique : oui (moins d'une journee).
- CA cibles identifies : oui (`mini_spec_ticket_06.md`).
- Hors-perimetre explicite : oui.
