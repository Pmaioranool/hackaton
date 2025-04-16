# Hackaton - Space Invaders Game

## Description

Un jeu de type Space Invaders avec une API backend et un frontend interactif. Le projet inclut des fonctionnalités comme un leaderboard, des power-ups, une boutique, et des sprites personnalisables.

---

## Fonctionnalités

- **Gameplay :**
  - Ennemis avec différents comportements (wkamikaze, gunner, tank).
  - Boss avec attaques spéciales (laser, torpilles).
  - Power-ups (double tir, bouclier, rapidité, etc.).
  - Boutique pour acheter des améliorations avec des BossCoins.

- **Backend :**
  - Gestion des utilisateurs (inscription, connexion, mise à jour).
  - Leaderboard pour afficher les meilleurs scores.
  - Sauvegarde des scores et des statistiques des joueurs.

- **Frontend :**
  - Interface utilisateur moderne avec animations.
  - Sélection de sprites personnalisés (Lucas ou Leo).
  - Système de loterie pour gagner des power-ups.

---

## Prérequis

- **Node.js** (version 14 ou supérieure)
- **MongoDB** (local ou hébergé)

---

## Installation

### Backend (API)

1. Créez un fichier `.env` dans le dossier `api` avec les variables suivantes :

    ```env
    MONGO_URI=mongodb://127.0.0.1:27017/space_invaders
    PORT=5000
    JWT_SECRET=secret
    ```

2. Installez les dépendances et démarrez le serveur :

```sh
cd api
npm install
npx nodemon index.js
```

### Frontend

1. Installez les dépendances et démarrez le serveur de développement :

```sh
cd frontend
npm i
npm run dev
```

---

## Utilisation

### Lancer le jeu

1. Assurez-vous que le backend est en cours d'exécution.
2. lancer mongoDB compass ou cli
3. Accédez au frontend via [http://localhost:3000](http://localhost:3000).
4. Connectez-vous ou créez un compte pour commencer à jouer.

### Commandes principales

- **Déplacement :** Flèches gauche/droite.
- **Tir :** Automatique.
- **Changer de sprite :** Bouton "Changer de sprite".
- **Pause :** Bouton "Pause".
- **Loterie :** Bouton "Loterie (E)".

---

## Structure du projet

### Backend (`api`)

- **`index.js` :** Point d'entrée du serveur.
- **`db.js` :** Connexion à MongoDB.
- **`models/user.js` :** Modèle utilisateur.
- **`routes/user.js` :** Routes pour la gestion des utilisateurs.

### Frontend (`frontend`)

- **`pages/` :** Pages principales (login, leaderboard, etc.).
- **`public/` :** Fichiers statiques (sprites, musiques, etc.).
- **`styles/` :** Fichiers CSS globaux.

---

## API Endpoints

### Utilisateurs

- **POST `/api/users/register` :** Inscription d'un utilisateur.
- **POST `/api/users/login` :** Connexion d'un utilisateur.
- **GET `/api/users/leaderboard` :** Récupération du leaderboard.
- **PUT `/api/users/update` :** Mise à jour des informations utilisateur.
- **PUT `/api/users/newScore` :** Mise à jour du score.

---

## Auteurs

- **Lucas MAIORANO**
- **lucas ROSIER**
- **harold LAJOUS**
- **Leo MALGONNE**
