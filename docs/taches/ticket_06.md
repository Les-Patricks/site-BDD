# Ticket 06 - Verifier et verrouiller le quality gate CI avant merge

1. **Titre** : Verifier et formaliser le blocage de merge par les tests CI.
2. **Probleme resolu** : Les tests sont redevenus verts, mais il faut confirmer que le merge est effectivement bloque quand un check test echoue. Sans ce verrou, la qualite depend encore d'une discipline manuelle.
3. **Impact** : utilisateur/metier : baisse du risque de regressions en production. technique : garantie process via checks requis sur Pull Request.
4. **CA cibles** : A REDIGER en etape 2.
5. **Contraintes** :
   - Conserver le workflow existant `sonar.yml` comme source de verite tests.
   - Definir clairement les checks obligatoires pour merge.
   - Documenter la regle dans la doc projet.
6. **Hors-perimetre** :
   - Ecriture massive de nouveaux tests.
   - Migration vers un autre outil CI.
   - Ajout d'une campagne e2e complete.
7. **Definition de Termine** :
   - [ ] Les tests passent localement et en CI.
   - [ ] Les checks tests requis bloquent un merge si echec.
   - [ ] La regle est documentee dans `docs/TESTING.md` ou `docs/WORKFLOWS.md`.
   - [ ] Une preuve de verification est disponible (capture ou procedure reproduisible).
8. **Estimation** : XS.

Auto-controle :
- Ticket atomique : oui (moins d'une journee).
- CA cibles identifies : partiels (`A REDIGER en etape 2`).
- Hors-perimetre explicite : oui.
