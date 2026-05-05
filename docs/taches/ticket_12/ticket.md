# Ticket 12 - Restaurer l'autocompletion pour ajouter des mots aux familles

1. **Titre** : Corriger la perte d'autocompletion lors de l'ajout d'un mot a une famille (menu contextuel « Ajouter un mot » sur un accordeon famille).
2. **Probleme resolu** : La liste de suggestions (datalist / mots existants) ne s'affiche plus ou reste vide, ce qui degrade fortement la saisie dans les familles.
3. **Impact** : utilisateur/metier : retrouver des suggestions fiables basees sur les mots du projet. technique : aligner la source des suggestions avec le store charge (hydratation) et le cycle de vie du formulaire d'ajout dans l'accordeon.
4. **CA cibles** :
   - **CA-1201** : Lors de l'ouverture du formulaire d'ajout de mot sur une famille, les options d'autocompletion refletent l'ensemble des mots pertinents (au minimum tous les mots deja presents dans le store).
   - **CA-1202** : La selection ou la validation d'une valeur issue des suggestions reste coherente avec le flux existant (`addWordToFamily`, creation de mot si absent).
   - **CA-1203** : Apres chargement initial des donnees (`admin-bootstrap` / rendu familles), l'autocompletion est disponible sans action supplementaire de l'utilisateur.
   - **CA-1204** : Un test ou un contrat documente couvre le lien entre la liste des mots affichables et la population du datalist (regression sur tableau vide non hydrate).
5. **Contraintes** :
   - Reutiliser le mecanisme `datalist` / `list` deja present dans les templates (`index.html`, `js/components/accordion.js`) sauf si refonte justifiee dans le plan technique.
   - Ne pas casser le menu contextuel ni les notifications deja branchees sur l'ajout (`notify`).
6. **Hors-perimetre** :
   - Autocompletion sur d'autres champs (hors ajout mot dans famille) sauf si le correctif est naturellement partage.
   - Recherche globale dans l'application (voir **Ticket 13**).
7. **Definition de Termine** :
   - [ ] Suggestions visibles et a jour apres bootstrap.
   - [ ] Ajout d'un mot existant ou nouveau via le formulaire famille fonctionne comme attendu.
   - [ ] Test ou preuve manuelle consignee (checklist courte dans le plan si pas de test auto).
8. **Estimation** : S.

**Pistes techniques** (a valider en implementation) : `js/state.js` (`autocompleteWords`), `js/ui/autocomplete.js` (`addWordToAutocomplete` / suppression), synchronisation au chargement des mots depuis Supabase, et remplissage du `#autocomplete-datalist` dans `accordion.js`.

Auto-controle :
- Ticket atomique : oui (autocompletion ajout mot dans famille).
- CA cibles identifies : oui (CA-1201 a CA-1204).
- Hors-perimetre explicite : oui.
