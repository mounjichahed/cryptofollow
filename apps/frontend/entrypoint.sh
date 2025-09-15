#!/bin/sh
set -e

PORT="${FRONTEND_PORT:-5173}"

ARGS="--host 0.0.0.0 --port ${PORT}"

if [ "${FRONTEND_HTTPS}" = "true" ] || [ "${FRONTEND_HTTPS}" = "1" ]; then
  if [ -n "${FRONTEND_TLS_CERT_PATH}" ] && [ -n "${FRONTEND_TLS_KEY_PATH}" ]; then
    echo "[frontend] HTTPS enabled with cert=${FRONTEND_TLS_CERT_PATH} key=${FRONTEND_TLS_KEY_PATH}"
    ARGS="$ARGS --https --cert \"${FRONTEND_TLS_CERT_PATH}\" --key \"${FRONTEND_TLS_KEY_PATH}\""
    if [ -n "${FRONTEND_TLS_CA_PATH}" ]; then
      ARGS="$ARGS --ca \"${FRONTEND_TLS_CA_PATH}\""
    fi
  else
    echo "[frontend] FRONTEND_HTTPS is set but FRONTEND_TLS_CERT_PATH or FRONTEND_TLS_KEY_PATH is missing"
    exit 1
  fi
fi

exec sh -lc "npm run -w apps/frontend preview -- ${ARGS}"

