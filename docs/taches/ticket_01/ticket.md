# Ticket 01 - Finaliser la migration vers le store unifie (architecture cible)

## Priorite

P0 - Bloquant fonctionnel (etat applicatif incoherent + tests `state` casses).

## Probleme resolu

Completer la migration du module d'etat vers le modele unique suivant:
- un `store` central avec `languages`, `words`, `families`;
- des entites indexees par identifiant (`uuid`) et reliees entre elles;
- une API de store unique qui porte les operations d'ecriture, lecture et persistance.

Le probleme actuel est une cohabitation entre ce nouveau modele et des references legacy (`wordKeys`, `languageKeys`, `familyKeys`, `traductions`, `families`, ...), ce qui casse l'execution et les tests.

## Impact utilisateur / metier

- Risque de pertes ou corruptions de donnees lors des operations d'edition/sauvegarde.
- Instabilite du backoffice (actions CRUD non fiables selon les chemins executes).
- Ralentissement des evolutions produit car chaque changement d'etat peut casser des modules historiques.

## Objectif technique

Obtenir une API d'etat unique et coherente sur tout le front, alignee sur cette architecture:

- `store.languages`: `{ languageId: { displayName } }`
- `store.words`: `{ wordId: { displayName, translations: { languageId: value } } }`
- `store.families`: `{ familyId: { displayName, wordsKeys: [wordId] } }`

Et sur ce contrat de methodes (noms cibles):
- `addWord(displayName: string)`
- `changeWord(wordId: string, newDisplayName: string)`
- `deleteWord(wordId: string)`
- `addLanguage(displayName: string)`
- `modifyLanguage(string languageId, string newDisplayName)`
- `deleteLanguage(string languageId)`
- `addTranslation(string wordId, string languageId, string translation)`
- `removeTranslation(string wordId, string languageId)`
- `addFamily(string displayName)`
- `modifyFamily(string familyId, string newDisplayName)`
- `removeFamily(string familyId)`
- `addWordToFamily(string wordId, string familyId)`
- `removeWordFromFamily(string wordId, string familyId)`
- `save()`
- `publish()`
- `getAllLanguages()`
- `getAllWords()`
- `getAllFamilies()`
- `getLanguage(languageId)`
- `getWord(wordId)`
- `getFamily(familyId)`
- `getTranslationsForWord(wordId)`
- `getWordsInFamily(familyId)`

Le ticket est considere reussi quand ce contrat devient la seule API utilisee par les consommateurs.

Note de clarification (phase test/migration):
- L'API metier reste orientee identifiants (`wordId`, `languageId`, `familyId`).
- Un helper utilitaire peut etre expose pour les besoins UI/tests quand on part d'un libelle:
  - `getIdsByDisplayName(scope: "languages" | "words" | "families", displayName: string): string[]`
- Ce helper n'est pas une operation metier CRUD; il sert uniquement a retrouver des IDs (avec gestion explicite des doublons via un retour en liste).

## Contraintes

1. Ne pas regresser le flux de sauvegarde/publish existant (shape des donnees attendue en aval).
2. Migrer sans introduire de double source de verite: une seule structure `store` et un seul contrat de methodes publiques.
3. Respecter les relations de donnees de l'architecture cible (`word.translations[languageId]`, `family.wordsKeys[]`) sans alias legacy.

## Hors-perimetre

- Refonte UX/UI des tabs.
- Optimisations de performance non necessaires a la migration.
- Evolution du schema metier (nouvelles entites/champs) hors alignement strict avec le store unifie.

## Definition de "Termine"

- `state.js` n'expose plus de references actives au modele legacy.
- Les consommateurs cibles (`tabs/*`, `saveManager.js`, tests `state`) utilisent uniquement la structure et le contrat de methodes cibles de ce ticket.
- Les tests `state` ne dependent plus de `wordKeys/languageKeys/familyKeys/traductions` et passent en local.
- Un test de non-regression couvre au minimum: CRUD word + traduction + rattachement famille + lecture via getters.
- Documentation de migration mise a jour dans `docs/KNOWN_ISSUES.md` (point clos ou reduit avec etat clair).
