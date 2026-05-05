# Mini-spec - Ticket 08

## Contexte
Au chargement de l'application, le bouton `Publish` peut rester masque apres un `save()` suivi d'un reload, alors que Supabase contient potentiellement des donnees non publiees vers Firestore.

## Objectif produit
Garantir qu'apres un `save()` non suivi d'un `publish()`, un reload affiche automatiquement le bouton `Publish` afin d'eviter les oublis de publication.

## Perimetre fonctionnel
- Introduire un etat metier persistant `publish_pending` cote Supabase (source d'edition), dans une table singleton `public.admin_state`.
- Positionner `publish_pending=true` apres un `save()` reussi.
- Positionner `publish_pending=false` apres un `publish()` reussi.
- Au bootstrap, lire `publish_pending` pour piloter la visibilite du bouton `Publish`.
- Ne pas bloquer durablement le chargement de l'UI.

## Regle metier cible
- `save()` reussi => etat "a publier" (`publish_pending=true`).
- `publish()` reussi => etat "publie" (`publish_pending=false`).
- Au chargement:
  - `publish_pending=true` => bouton `Publish` visible;
  - `publish_pending=false` => bouton `Publish` masque.

## Criteres d'acceptation (rappel + precision)
- CA-801: au chargement, l'etat `publish_pending` est lu depuis Supabase.
- CA-802: `publish_pending=true` => `Publish` visible sans action utilisateur.
- CA-803: `publish_pending=false` => `Publish` masque.
- CA-804: en cas d'erreur de lecture de l'etat, l'app reste utilisable (pas de blocage durable).
- CA-805: tests automatises couvrent les deux cas (`publish_pending=true` et `publish_pending=false`).

## Contraintes techniques
- Ne pas modifier les contrats fonctionnels existants de `save()` et `publish()`.
- Eviter toute lecture directe de Firestore au bootstrap pour ce besoin.
- Respecter le schema de publication actuel (`words`, `families`, `id`).

## Emplacement de persistance Supabase
Table cible proposee: `public.admin_state` (singleton de configuration backoffice).

Schema minimal:
- `id text primary key` (valeur unique attendue: `global`)
- `publish_pending boolean not null default false`
- `updated_at timestamptz not null default now()`

Lecture bootstrap:
- `select publish_pending from public.admin_state where id = 'global'`.

## Risques identifies
- Oubli de mise a jour du flag sur un chemin de succes/erreur de `save()` ou `publish()`.
- Incoherence temporaire si une operation est interrompue au mauvais moment.
- Dette de nommage/documentation si le flag n'est pas clairement defini.

## Strategie de mitigation
- Centraliser la mise a jour du flag dans des points uniques du flux `save()`/`publish()`.
- Mettre a jour le flag seulement apres succes confirme.
- Ajouter des tests de non-regression sur la visibilite de `Publish` au bootstrap.

## Estimation de charge
Estimation globale: **0,4 a 1 jour** (complexite **S/M**), selon l'effort necessaire pour persister le flag proprement dans l'etat edition.

Decoupage indicatif:
- Cadrage technique local du point d'injection bootstrap: 0,1 j
- Implementation `publish_pending` + affichage bouton: 0,15 a 0,4 j
- Tests (pending=true / pending=false + non-regression): 0,15 a 0,35 j
- Mise a jour doc workflow: 0,1 a 0,2 j

Hypotheses:
- Un emplacement persistant existe (ou peut etre ajoute simplement) pour stocker `publish_pending` cote Supabase.
- Pas de refonte de schema ni migration a faire.
