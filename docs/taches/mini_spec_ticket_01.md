# Mini-spec fonctionnelle - Ticket 01

## 1) Contexte et perimetre

### Contexte
Le Ticket 01 vise a finaliser la migration vers un store unifie pour supprimer la cohabitation actuelle entre modele cible et alias legacy dans la gestion d'etat front. Cette cohabitation provoque des comportements incoherents (edition, save, tests).

### Perimetre inclus
- Alignement fonctionnel sur un store unique:
  - `store.languages`: `{ languageId: { displayName } }`
  - `store.words`: `{ wordId: { displayName, translations: { languageId: value } } }`
  - `store.families`: `{ familyId: { displayName, wordsKeys: [wordId] } }`
- Usage d'une API publique unique pour CRUD, lecture, save, publish et getters.
- Definition d'un comportement observable coherent entre edition locale, sauvegarde Supabase et publication Firebase.

### Perimetre exclu
- Refonte UI/UX des tabs.
- Optimisations de performance hors migration.
- Evolution du schema metier au-dela de l'alignement strict au store unifie.

## 2) Comportement attendu

### 2.1 Source de verite
- Le front manipule une seule source de verite: `store`.
- Les chemins legacy (`wordKeys`, `languageKeys`, `familyKeys`, `traductions`, etc.) ne sont plus des references actives pour les consommateurs.

### 2.2 Operations metier attendues
- **Langues**
  - Ajouter, modifier, supprimer une langue.
  - La suppression d'une langue supprime logiquement les traductions associees dans les mots.
- **Mots**
  - Ajouter, modifier, supprimer un mot.
  - Un mot contient ses traductions dans `translations[languageId]`.
- **Traductions**
  - Ajouter/modifier une traduction pour un couple (`wordId`, `languageId`).
  - Supprimer une traduction de ce couple.
- **Familles**
  - Ajouter, modifier, supprimer une famille.
  - Associer/desassocier un mot via `wordsKeys`.

### 2.3 Lecture et restitution
- Les getters (`getAll*`, `get*`, `getTranslationsForWord`, `getWordsInFamily`) lisent uniquement le modele cible et retournent des donnees coherentes avec les operations d'ecriture.

### 2.4 Persistance et publication
- `save()` persiste les modifications vers la couche edition (Supabase) sans regressions fonctionnelles.
- `publish()` conserve la compatibilite de shape attendue en aval pour la publication vers Firebase:
  - mots publies avec leurs traductions;
  - familles publiees avec leurs IDs de mots.

## 3) Regles metier impactees

1. **Unicite des identifiants**
   - `languageId`, `wordId`, `familyId` identifient une entite unique dans leur collection.

2. **Integrite des traductions**
   - Une traduction appartient a un mot et a une langue identifies.
   - Aucun stockage de traduction hors `word.translations[languageId]`.
   - Une traduction vide (`""`) est une valeur autorisee dans le `store` (saisie en cours), et n'est pas une suppression implicite.

3. **Integrite des rattachements famille**
   - `family.wordsKeys[]` ne contient que des `wordId` existants.
   - Pas de doublon de `wordId` dans une meme famille.

4. **Suppression coherente**
   - Supprimer un mot le retire des familles qui le referencent.
   - Supprimer une langue retire ses traductions dans les mots.
   - Supprimer une famille ne supprime pas les mots.

5. **Source de verite unique**
   - Les consommateurs front (tabs, save manager, tests state) utilisent le contrat cible uniquement.

6. **Compatibilite save/publish**
   - Le passage edition locale -> save Supabase -> publish Firebase conserve le schema metier attendu (`words`, `families`, `id`).

7. **Lookup utilitaire par libelle (hors CRUD metier)**
   - Un helper `getIdsByDisplayName(scope, displayName)` peut etre expose pour les besoins UI/tests.
   - Ce helper retourne une liste d'IDs pour gerer explicitement les doublons de `displayName`.

## 4) Cas nominal

### Cas nominal A - CRUD mot + traduction
1. L'utilisateur ajoute un mot avec `displayName`.
2. L'utilisateur ajoute une traduction pour une langue existante.
3. L'utilisateur modifie le `displayName` du mot puis sa traduction.
4. L'utilisateur lit le mot via `getWord` et ses traductions via `getTranslationsForWord`.

**Resultat attendu**: le mot et ses traductions sont coherents dans `store.words`; les getters refletent exactement l'etat modifie.

### Cas nominal B - Rattachement famille
1. L'utilisateur cree une famille.
2. L'utilisateur associe un mot existant a cette famille.
3. L'utilisateur consulte les mots de la famille via `getWordsInFamily`.

**Resultat attendu**: le `wordId` apparait une seule fois dans `family.wordsKeys` et la lecture retourne le mot associe.

### Cas nominal C - Save puis publish
1. L'utilisateur effectue des modifications (langues, mots, traductions, familles).
2. L'utilisateur declenche `save()`.
3. L'utilisateur declenche `publish()`.

**Resultat attendu**: aucune erreur fonctionnelle; les donnees persistees et publiees respectent le modele metier attendu en aval.

## 5) Cas limites

1. **Entite inexistante**
   - Modifier/supprimer un `wordId`, `languageId` ou `familyId` absent ne doit pas corrompre l'etat.

2. **Doublon d'association famille**
   - Ajouter deux fois le meme `wordId` a la meme famille ne cree qu'une seule association effective.

3. **Suppression d'une langue utilisee**
   - La suppression retire les traductions ciblees sans supprimer les mots.

4. **Suppression d'un mot rattache a des familles**
   - Le mot est retire de toutes les `wordsKeys` qui le referencent.

5. **Suppression d'une famille non vide**
   - La famille est supprimee; les mots restent intacts.

6. **Valeur de traduction vide**
   - Une valeur vide est conservee telle quelle dans `translations[languageId]` pour permettre la saisie progressive.
   - La suppression de traduction passe uniquement par l'action explicite `removeTranslation(wordId, languageId)`.

7. **Getters sur etat vide**
   - `getAllLanguages/getAllWords/getAllFamilies` retournent des structures vides coherentes, sans erreur.

## 6) Criteres d'acceptation testables

### CA-01 - API cible unique exposee
- **Given** le module d'etat charge
- **When** les consommateurs utilisent l'API publique
- **Then** seules les methodes cibles du ticket sont necessaires; pas d'usage actif des alias legacy.

### CA-02 - CRUD mot + traduction valide
- **Given** une langue existante et aucun mot initial
- **When** j'ajoute un mot, puis une traduction, puis je modifie les deux
- **Then** `getWord` et `getTranslationsForWord` renvoient l'etat attendu.

### CA-03 - Integrite familles
- **Given** un mot existant et une famille existante
- **When** j'ajoute puis retire le mot de la famille
- **Then** `getWordsInFamily` suit exactement ces operations sans doublon.

### CA-04 - Suppressions coherentes
- **Given** des mots, langues, traductions et familles lies
- **When** je supprime une langue puis un mot
- **Then** les traductions de la langue sont retirees et les references de familles au mot sont nettoyees.

### CA-04bis - Traduction vide non supprimee implicitement
- **Given** un mot et une langue existants
- **When** je mets la traduction a une chaine vide (`""`)
- **Then** `translations[languageId]` reste presente avec une valeur vide, jusqu'a suppression explicite via `removeTranslation`.

### CA-05 - Non-regression save
- **Given** des modifications locales sur le store unifie
- **When** je lance `save()`
- **Then** la persistance Supabase se fait sans erreur fonctionnelle ni desynchronisation observable.

### CA-06 - Non-regression publish
- **Given** un etat sauvegarde representatif (mots + familles)
- **When** je lance `publish()`
- **Then** la publication aval recoit une structure compatible avec les attentes metier (`words`, `families`, `id`).

### CA-07 - Regression minimale obligatoire
- **Given** la suite de tests locale
- **When** j'execute les tests `state`
- **Then** un test couvre au minimum: CRUD mot, traduction, rattachement famille, lecture getters, sans dependance aux structures legacy.

## 7) Trace de coherence avec la spec globale

- Aligne avec l'architecture projet (edition Supabase, publication Firebase, orchestration front locale).
- Aligne avec le modele de donnees relationnel en edition et denormalise en publication.
- Aligne avec la priorite de migration du Ticket 01: supprimer la double source de verite et stabiliser tests + flux save/publish.
