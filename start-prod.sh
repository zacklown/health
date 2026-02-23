#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="$BASE_DIR/../infra/db"

docker network create health-db >/dev/null 2>&1 || true

(
  cd "$DB_DIR"
  docker compose up -d
)

(
  cd "$BASE_DIR"
  docker compose up -d
)

echo "Production stack is up:"
echo "- Postgres: 5432"
echo "- CMS: 3000"
echo "- Frontend: 4321"
