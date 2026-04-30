# Contribuer au projet

## Regles de base

- Travailler par petites PRs lisibles.
- Ne pas commiter de secrets.
- Garder le style de code existant (Vanilla JS, modules ES).
- Ajouter/adapter des tests si logique metier modifiee.
- Ajouter des commentaires de code uniquement la ou c'est vraiment necessaire pour comprendre l'intention, une regle metier ou un choix non evident.
- Ecrire tous les commentaires de code en anglais pour faciliter la relecture par l'equipe et par des contributeurs externes.

## Workflow recommande

1. Creer une branche feature/fix.
2. Faire des commits atomiques.
3. Executer:
   - `npm run test`
4. Ouvrir une PR.
5. Verifier preview Firebase et SonarCloud.

## Zones sensibles

- `js/state.js` et `js/saveManager.js` (legacy + nouveau modele melanges)
- flux publish inter-services:
  - Supabase Edge Function
  - Firebase Cloud Function

## Convention documentation

Toute evolution significative doit aussi mettre a jour:
- `README.md` si impact onboarding
- au moins un fichier sous `docs/` si impact architecture/flux/data
