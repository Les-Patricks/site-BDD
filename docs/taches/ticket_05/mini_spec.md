# Mini-spec — Ticket 05 — Configuration Supabase hors du code client

## Contexte

`js/SupabaseManager.js` expose encore l’URL du projet Supabase et la clé `anon` en dur. Le dépôt est servi comme **application statique** ; toute configuration doit rester traçable, documentée, et ne pas imposer de secrets en clair dans Git ou dans la CI.

## Objectif

Remplacer les constantes hardcodées par un chargement explicite des paramètres (URL + clé publique anon), compatible avec le mode statique actuel, et aligner la documentation avec la réalité du projet.

## Critères d’acceptation (CA)

1. **Code versionné** : `js/SupabaseManager.js` ne contient plus d’URL ni de clé Supabase en dur (valeurs factices ou placeholders non acceptés en production — uniquement des références à des variables ou un mécanisme de build/injection documenté).
2. **Démarrage** : si la configuration est absente ou invalide, l’application échoue tôt avec un message d’erreur clair (pas de client Supabase « silencieux »).
3. **Documentation** : `docs/SETUP.md` liste les variables (ou le fichier de config local) requis, leur rôle, et comment les obtenir côté Supabase ; mention explicite que la clé **anon** est une clé **publique** côté navigateur mais ne doit pas rester figée dans le dépôt.
4. **Local** : un contributeur peut lancer le backoffice en suivant SETUP sans copier-coller de secrets depuis le code source du repo ; un exemple de fichier d’environnement **non commité** (ex. `.env.example` ou équivalent) est fourni si le mécanisme choisi s’appuie sur ce modèle.
5. **CI / tests** : aucun secret réel n’est ajouté au dépôt ; les jobs utilisent des secrets GitHub ou des valeurs de test déjà prévues par les tests existants ; pas d’exposition de clés en clair dans les logs ou artefacts.

## Hors périmètre

Conformément au ticket 05 : refonte IAM, chiffrement applicatif custom, migration de base, et **pas** d’obligation de traiter dans cette itération les URLs/clés **serveur** des Edge Functions (service role) — périmètre centré sur le **client** (`SupabaseManager` + doc + garde-fous CI pour le front).

## Dépendances / risques

- Le choix technique (injection à la build Vite vs petit fichier `config.local.js` ignoré par git, etc.) est laissé au **plan technique** ; la mini-spec impose seulement le résultat observable et les CA ci-dessus.
- Les tests JS qui utilisent déjà `process.env.SUPABASE_URL` / `SUPABASE_ANON_KEY` doivent rester cohérents avec les noms de variables documentés.

## Definition of Done (rappel ticket)

- [x] CA 1 à 5 satisfaits.
- [x] Coche correspondante dans `docs/taches/ticket_05.md` (section 7) mise à jour lors de la clôture de la tâche.
