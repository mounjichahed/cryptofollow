#!/bin/sh
set -e

echo "[entrypoint] Waiting for database and applying schema..."

MAX_RETRIES=30
SLEEP_SECONDS=3
COUNT=0

until npx prisma db push --skip-generate; do
  COUNT=$((COUNT+1))
  if [ "$COUNT" -ge "$MAX_RETRIES" ]; then
    echo "[entrypoint] prisma db push failed after ${MAX_RETRIES} attempts. Exiting."
    exit 1
  fi
  echo "[entrypoint] prisma db push failed (attempt ${COUNT}/${MAX_RETRIES}). Retrying in ${SLEEP_SECONDS}s..."
  sleep "$SLEEP_SECONDS"
done

echo "[entrypoint] Seeding core assets..."
node apps/backend/dist/startup/seedAssets.js || echo "[entrypoint] Seed step failed (continuing)"

echo "[entrypoint] Starting backend..."
exec node apps/backend/dist/index.js
