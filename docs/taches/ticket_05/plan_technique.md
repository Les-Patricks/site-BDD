# Plan technique — Ticket 05 — Config Supabase hors du code client

## Décision d’architecture (révisée — sans build obligatoire)

- **Mécanisme** : petit module ES `js/supabase-config.js` **non versionné**, importé par `js/SupabaseManager.js`, qui exporte `supabaseUrl` et `supabaseAnonKey` (noms exacts à figer dans l’implémentation).
- **Local** : le contributeur copie `js/supabase-config.example.js` → `js/supabase-config.js` et renseigne les valeurs (fichier listé dans `.gitignore`). Aucun `npm run build` requis : Live Server / `npx serve` / Hosting continuent de servir les fichiers tels quels.
- **CI / déploiement** : avant `FirebaseExtended/action-hosting-deploy`, une étape écrit `js/supabase-config.js` à partir des **secrets GitHub** (ex. `SUPABASE_URL`, `SUPABASE_ANON_KEY` — noms à aligner avec ce qui existe déjà pour les tests distants si possible). Préférer un petit script Node (`scripts/write-supabase-config.mjs`) qui lit `process.env` et écrit le fichier pour éviter les problèmes d’échappement shell avec la JWT anon.
- **Limitation honnête** : les secrets GitHub empêchent la fuite **dans Git** ; une fois déployé, l’URL et la clé **anon** sont dans le JS servi au navigateur (comportement normal client Supabase, pas une fuite « serveur »).

- **Non retenu pour le flux principal** : basculer sur `vite build` + `dist/` + `import.meta.env`. Le script `npm run build` peut rester disponible pour d’autres besoins (ex. vérifs), mais n’est **pas** le prérequis pour développer ni pour le déploiement décrit ici. **`firebase.json` reste sur `hosting.public: "."`**.

## Fichiers / changements prévus

| Zone | Action |
|------|--------|
| `js/supabase-config.example.js` (nouveau, versionné) | Exporte les deux constantes avec des placeholders documentés (`https://YOUR_PROJECT.supabase.co`, etc.). |
| `js/supabase-config.js` | **Gitignore** ; généré en CI ou copié localement depuis l’example. |
| `.gitignore` | Entrée explicite pour `js/supabase-config.js`. |
| `js/SupabaseManager.js` | Supprimer URL/clé en dur ; `import` depuis `./supabase-config.js` ; validation (non vides, forme URL minimale optionnelle) → `throw` explicite si invalide. |
| `scripts/write-supabase-config.mjs` (nouveau) | Lit `SUPABASE_URL` + `SUPABASE_ANON_KEY` (ou noms choisis), écrit `js/supabase-config.js` ; exit non-zéro si manquant. |
| `.github/workflows/firebase-hosting-merge.yml` et `firebase-hosting-pull-request.yml` | Après checkout : `actions/setup-node`, `npm ci` **uniquement si** le script d’écriture utilise Node sans dépendance lourde (sinon `node scripts/...` avec runtime dispo sur l’image — pas besoin de `npm ci` si script vanilla). En pratique : `npm ci` léger acceptable pour homogénéité avec `npm test` ailleurs, ou `node` seul si le script est autonome. Puis exécuter le script avec `env:` branché sur les secrets, puis déploiement Firebase inchangé. |
| `docs/SETUP.md` | Parcours : copier l’example → `supabase-config.js`, renseigner ; mentionner que la CI régénère ce fichier au déploiement depuis les secrets. |
| `docs/TESTING.md` (si besoin) | Comment les tests obtiennent la config sans fichier local (voir ci-dessous). |
| `vitest.config.js` | **Alias de résolution** : pour les tests, mapper `js/supabase-config.js` vers un stub dédié (ex. `js/tests/supabase-config.stub.js`) avec des valeurs factices, pour que `SupabaseManager.js` charge sans fichier gitignored et sans exposer de vrais secrets. |

## Tests et compatibilité

- **`js/tests/SupabaseManager.test.js`** : après alias Vitest, les imports doivent résoudre vers le stub ; conserver le mock `createClient` existant.
- **Tests distants** (`SUPABASE_URL` / `SUPABASE_ANON_KEY`) : réutiliser les **mêmes noms** de variables d’environnement dans le script d’écriture CI que ceux déjà utilisés par ces tests, pour limiter la prolifération de noms de secrets.

## Ordre d’implémentation recommandé

1. Ajouter `supabase-config.example.js`, `.gitignore`, stub + alias Vitest ; valider `npm run test`.
2. Modifier `SupabaseManager.js` + script `write-supabase-config.mjs`.
3. Brancher les workflows Firebase sur le script + secrets.
4. Mettre à jour `docs/SETUP.md` (+ `TESTING.md` si besoin).

## Risques / points de vigilance

- **Secrets manquants en CI** : le script doit échouer clairement ; premier déploiement après merge = vérifier que les deux secrets sont bien créés dans le dépôt GitHub.
- **Contributeur sans `supabase-config.js`** : erreur au chargement du module ; message d’erreur ou doc doit pointer vers l’example.

## Référence CA

Les critères d’acceptation détaillés restent dans `docs/taches/mini_spec_ticket_05.md`.
