# Cryptofollow Monorepo

Monorepo minimal pour une app portefeuille crypto, basé sur npm workspaces.

## Structure

```
.
├─ package.json              # Workspaces + scripts racine
├─ .gitignore
├─ .editorconfig
├─ tsconfig.base.json
├─ .env.example
├─ apps/
│  ├─ backend/
│  │  └─ package.json
│  └─ frontend/
│     └─ package.json
└─ prisma/
   └─ .gitkeep
```

## Scripts

- `npm run dev:backend` : lance le mode dev du backend (placeholder)
- `npm run dev:frontend` : lance le mode dev du frontend (placeholder)
- `npm run dev` : lance les deux (via workspaces)
- `npm run format` : format (Prettier)
- `npm run lint` : lint (ESLint)

Installez vos outils (Prettier/ESLint) et remplacez les commandes placeholder aux niveaux apps.

