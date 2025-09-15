FROM node:18-alpine AS builder
WORKDIR /app

# Monorepo deps
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json

RUN npm ci

# Copy sources
COPY . .

# Build-time API URL (embedded by Vite)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run -w apps/frontend build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and tooling (keep dev deps for vite preview)
COPY --from=builder /app /app

EXPOSE 5173

CMD ["npm", "run", "-w", "apps/frontend", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]

