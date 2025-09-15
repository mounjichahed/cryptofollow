FROM node:18-alpine AS builder
WORKDIR /app

# Install deps (monorepo)
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY prisma ./prisma
COPY apps/backend/tsconfig.json ./apps/backend/tsconfig.json
COPY . .

RUN npm ci
RUN npx prisma generate
RUN npm run -w apps/backend build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/prisma ./prisma

RUN npm prune --omit=dev

EXPOSE 3000
CMD ["node", "apps/backend/dist/index.js"]

