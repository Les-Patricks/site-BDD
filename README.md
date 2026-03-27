# Outil d'Administration - Bluffers

## 📝 Description
Ce projet est l'outil back-office développé en JavaScript Vanilla pour la gestion des mots, familles et traductions du jeu multijoueur *Bluffers*. Il communique avec une base de données relationnelle (Supabase/PostgreSQL) pour la gestion quotidienne et synchronise les données validées vers une base NoSQL (Firebase/Firestore) pour l'environnement de production du jeu.

## 🛠 Prérequis
- [Visual Studio Code](https://code.visualstudio.com/) avec l'extension **Live Server** installée.
- [Node.js](https://nodejs.org/) (requis uniquement pour l'installation du framework de test).

## 🚀 Installation et Lancement local

1. **Cloner le dépôt :**
   ```bash
   git clone [VOTRE_URL_GITHUB]
   cd [NOM_DU_DOSSIER]
   ```

2. **Installer les dépendances (pour les tests) :**
   ```bash
   npm install
   ```

3. **Lancer l'application :**
   - Ouvrez le dossier du projet dans Visual Studio Code.
   - Cliquez sur le bouton **"Go Live"** situé dans la barre d'état en bas à droite de l'éditeur.
   - L'application s'ouvrira automatiquement dans votre navigateur Web par défaut.

## Gestion des clés et Sécurité
Afin de faciliter la collaboration au sein de l'équipe, ce projet front-end n'utilise pas de fichier `.env` local.
- **Clés d'API Client :** Les clés publiques de Supabase et Firebase sont directement intégrées au code. La sécurisation des données n'est pas basée sur l'obscurcissement de ces clés, mais sur les règles de sécurité strictes configurées côté serveur (Row Level Security pour Supabase).
- **Secrets de déploiement :** Le jeton de service Firebase permettant le déploiement (`FIREBASE_SERVICE_ACCOUNT`) n'est jamais exposé. Il est stocké de manière chiffrée dans les **GitHub Secrets** du dépôt.

## 🧪 Tests Automatisés
Le projet intègre une suite de tests unitaires développée avec **Vitest** pour garantir la fiabilité de la gestion d'état local et des requêtes d'accès aux bases de données (via l'utilisation de Mocks).

Pour exécuter la suite de tests, lancez la commande suivante dans le terminal :
```bash
npm run test
```

## Déploiement Continu (CI/CD)
L'outil d'administration est hébergé sur **Firebase Hosting**. Ne nécessitant pas d'étape de build (JavaScript Vanilla pur), le déploiement est entièrement automatisé grâce à deux workflows **GitHub Actions** :

1. **Environnement de Prévisualisation (Tests) :**
   Toute création de *Pull Request* déclenche l'action `Deploy to Firebase Hosting on PR`. Elle génère une URL de prévisualisation temporaire permettant à l'équipe de valider les modifications avant intégration.

2. **Environnement de Production :**
   Toute fusion (Merge) ou Push direct sur la branche `main` déclenche l'action `Deploy to Firebase Hosting on merge`. Les fichiers statiques sont alors automatiquement déployés en direct (`channelId: live`) sur les serveurs de production.

