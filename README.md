# Cryptofollow Monorepo

Monorepo JS (npm workspaces) pour une app portefeuille crypto.

## Prérequis

- Node.js 18+
- npm 9+
- Docker et Docker Compose

## Installation

1. Cloner le repo et aller à la racine.
2. Copier `.env.example` en `.env` et ajuster les valeurs si nécessaire.
3. Installer les dépendances monorepo:
   - `npm ci`

## Démarrage (dev) avec docker-compose

1. Démarrer Postgres et le backend (build prod simple) :
   - `npm run compose:up`
2. Lancer les migrations Prisma (vers la base locale) :
   - `npm run db:migrate`
3. Générer le client Prisma (optionnel si déjà fait) :
   - `npm run prisma:generate`
4. Remplir des données de test :
   - `npm run db:seed`
5. Frontend (Vite):
   - `npm run dev:frontend` puis ouvrir l’URL affichée (par défaut `http://localhost:5173`).

Notes:
- Le backend écoute par défaut sur `http://localhost:3000` (configurable via `PORT`).
- Le `DATABASE_URL` par défaut cible Postgres exposé par Docker (`localhost:5432`).

## Migration et seed

- Migration: `npm run db:migrate` (alias de `prisma migrate dev`).
- Génération client: `npm run prisma:generate`.
- Seed: `npm run db:seed` (insère des assets et quelques transactions d’exemple).

## Variables d’environnement

- `NODE_ENV` (ex: `development`)
- `PORT` (port backend, ex: `3000`)
- `FRONTEND_PORT` (port Vite, ex: `5173`)
- `DATABASE_URL` (connexion Postgres, ex: `postgresql://USER:PASSWORD@localhost:5432/cryptofollow`)
- `JWT_SECRET` (clé de signature JWT)
- `BASE_CURRENCY` (`EUR` ou `USD`)

## Structure

```
.
├─ package.json              # Workspaces + scripts racine
├─ docker-compose.yml        # Services: db + backend
├─ .gitignore
├─ .editorconfig
├─ tsconfig.base.json
├─ .env.example
├─ apps/
│  ├─ backend/               # Express + Prisma + TS
│  └─ frontend/              # Vite + React + Tailwind + TS
└─ prisma/
   ├─ schema.prisma
   └─ seed.ts
```
