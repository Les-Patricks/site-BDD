# Ticket 07 - Aligner la documentation de deploiement sur la branche reelle

1. **Titre** : Aligner la documentation de deploiement avec les workflows GitHub Actions.
2. **Probleme resolu** : Le deploiement live est configure sur `main`, alors que la doc/metier peut mentionner un flux cible via `dev`. Cette divergence cree de la confusion et des erreurs de process.
3. **Impact** : utilisateur/metier : process de livraison clair pour l'equipe. technique : coherence entre documentation et pipeline effectif.
4. **CA cibles** : A REDIGER en etape 2.
5. **Contraintes** :
   - S'aligner strictement sur les workflows actifs du repo.
   - Distinguer explicitement preview PR et deploy live.
   - Eviter les contradictions entre `README.md` et docs internes.
6. **Hors-perimetre** :
   - Changement de strategie de branching globale.
   - Refonte complete CI/CD.
   - Ajout de nouveaux environnements (staging/preprod).
7. **Definition de Termine** :
   - [ ] La branche de deploy live est clairement documentee.
   - [ ] Le comportement deploy preview sur PR est documente.
   - [ ] `README.md` et `docs/WORKFLOWS.md` sont coherents entre eux.
   - [ ] Une verification manuelle confirme l'alignement avec les YAML workflows.
8. **Estimation** : XS.

Auto-controle :
- Ticket atomique : oui (moins d'une journee).
- CA cibles identifies : partiels (`A REDIGER en etape 2`).
- Hors-perimetre explicite : oui.
