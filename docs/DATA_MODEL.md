# Modele de donnees

## Source de verite edition (Supabase)

Tables lues/ecrites par le backoffice:

- `language`
  - `language_id` (PK)
  - `name`
  - `modification_date`

- `words`
  - `word_id` (PK)
  - `modification_date`

- `word_translation`
  - `word_id` (FK)
  - `language_id` (FK)
  - `value`
  - conflit logique: `word_id, language_id`

- `word_family`
  - `word_family_id` (PK)
  - `modification_date`

- `word_family_association`
  - `word_id` (FK)
  - `word_family_id` (FK)
  - conflit logique: `word_id, word_family_id`

## Projection runtime jeu (Firestore)

Collections cible:

- `Words`
  - document id = `word.id`
  - champs dynamiques = traductions (`fr`, `en`, etc.)

- `WordFamilies`
  - document id = `family.id`
  - champ `IDs` = tableau des ids de mots de la famille

## Mapping publication

1. La fonction Supabase `publish-to-firebase` lit les tables relationnelles.
2. Elle reconstruit:
   - `formattedWords` (un objet par mot + traductions en proprietes)
   - `formattedFamilies` (id + liste des mots)
3. Elle appelle la Cloud Function Firebase `publishWords`.
4. `publishWords` purge puis reecrit `Words` et `WordFamilies`.

## Etat local frontend

Le module `js/state.js` maintient:
- collections en memoire (`store` et/ou structures legacy)
- suivi des changements (`storeChanges`) pour le save incrementale

Note: le fichier contient actuellement des structures legacy coexistantes; voir `docs/KNOWN_ISSUES.md`.
