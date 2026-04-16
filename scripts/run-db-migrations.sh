#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CMS_ENV_FILE="${CMS_ENV_FILE:-$BASE_DIR/apps/cms/health-cms/.env.production.local}"
SQL_MIGRATIONS_DIR="${SQL_MIGRATIONS_DIR:-$BASE_DIR/sql-migrations}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-health-postgres}"

if [ ! -f "$CMS_ENV_FILE" ]; then
  echo "ERROR: CMS env file not found: $CMS_ENV_FILE" >&2
  exit 1
fi

DATABASE_URL="$(sed -n 's/^DATABASE_URL=//p' "$CMS_ENV_FILE" | tail -n1)"
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is missing in $CMS_ENV_FILE" >&2
  exit 1
fi

DB_URL_NO_SCHEME="${DATABASE_URL#postgres://}"
DB_URL_NO_SCHEME="${DB_URL_NO_SCHEME#postgresql://}"
CRED_HOST="${DB_URL_NO_SCHEME%%/*}"
DB_NAME="${DB_URL_NO_SCHEME#*/}"

if [[ "$CRED_HOST" != *"@"* ]]; then
  echo "ERROR: DATABASE_URL is not in expected user:pass@host:port/db format" >&2
  exit 1
fi

USER_PASS="${CRED_HOST%%@*}"
HOST_PORT="${CRED_HOST#*@}"
DB_USER="${USER_PASS%%:*}"
DB_PASS="${USER_PASS#*:}"
DB_HOST="${HOST_PORT%%:*}"
if [[ "$HOST_PORT" == *":"* ]]; then
  DB_PORT="${HOST_PORT##*:}"
else
  DB_PORT="5432"
fi

if ! docker ps --format '{{.Names}}' | rg -x "$POSTGRES_CONTAINER" >/dev/null 2>&1; then
  echo "ERROR: Postgres container '$POSTGRES_CONTAINER' is not running" >&2
  exit 1
fi

echo "Ensuring SQL migration ledger table exists..."
docker exec -i -e PGPASSWORD="$DB_PASS" "$POSTGRES_CONTAINER" \
  psql -v ON_ERROR_STOP=1 -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" <<'SQL'
CREATE TABLE IF NOT EXISTS payload_schema_migrations (
  filename text PRIMARY KEY,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SQL

if [ ! -d "$SQL_MIGRATIONS_DIR" ]; then
  echo "No SQL migrations directory found ($SQL_MIGRATIONS_DIR). Skipping custom SQL migrations."
  exit 0
fi

shopt -s nullglob
SQL_FILES=("$SQL_MIGRATIONS_DIR"/*.sql)
if [ "${#SQL_FILES[@]}" -eq 0 ]; then
  echo "No SQL migrations found in $SQL_MIGRATIONS_DIR"
  exit 0
fi

for sql_file in "${SQL_FILES[@]}"; do
  filename="$(basename "$sql_file")"
  checksum="$(sha256sum "$sql_file" | awk '{print $1}')"

  existing_checksum="$({ docker exec -e PGPASSWORD="$DB_PASS" "$POSTGRES_CONTAINER" \
    psql -tA -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" \
    -c "SELECT checksum FROM payload_schema_migrations WHERE filename = '$filename'"; } | tr -d '[:space:]')"

  if [ -n "$existing_checksum" ]; then
    if [ "$existing_checksum" = "$checksum" ]; then
      echo "Skipping already-applied migration: $filename"
      continue
    fi

    echo "ERROR: Migration checksum mismatch for $filename" >&2
    echo "Recorded: $existing_checksum" >&2
    echo "Current : $checksum" >&2
    echo "Create a new migration file instead of editing an applied one." >&2
    exit 1
  fi

  echo "Applying SQL migration: $filename"
  docker exec -i -e PGPASSWORD="$DB_PASS" "$POSTGRES_CONTAINER" \
    psql -v ON_ERROR_STOP=1 -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" < "$sql_file"

  docker exec -e PGPASSWORD="$DB_PASS" "$POSTGRES_CONTAINER" \
    psql -v ON_ERROR_STOP=1 -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" \
    -c "INSERT INTO payload_schema_migrations (filename, checksum) VALUES ('$filename', '$checksum')"
done

echo "Running Payload migrations (if any)..."
docker compose -f "$BASE_DIR/docker-compose.yml" run --rm cms bash -lc "if [ -d src/migrations ]; then pnpm payload migrate; else echo 'No src/migrations directory; skipping Payload migrations'; fi"

echo "Database migrations complete"
