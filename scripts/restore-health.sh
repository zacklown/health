#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <timestamp>"
  echo "Example: $0 20260416T070239Z"
  exit 1
fi

TIMESTAMP="$1"
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_ROOT="${BACKUP_ROOT:-$BASE_DIR/backups}"
CMS_ENV_FILE="${CMS_ENV_FILE:-$BASE_DIR/apps/cms/health-cms/.env.production.local}"
MEDIA_DIR="${MEDIA_DIR:-$BASE_DIR/apps/cms/health-cms/media}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-health-postgres}"

DB_DUMP_FILE="$BACKUP_ROOT/db/payload_prod_${TIMESTAMP}.dump"
MEDIA_ARCHIVE="$BACKUP_ROOT/media/media_${TIMESTAMP}.tar.gz"

if [ ! -f "$DB_DUMP_FILE" ]; then
  echo "ERROR: DB dump not found: $DB_DUMP_FILE" >&2
  exit 1
fi

if [ ! -f "$MEDIA_ARCHIVE" ]; then
  echo "ERROR: Media archive not found: $MEDIA_ARCHIVE" >&2
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

read -r -p "This will overwrite database '$DB_NAME' and media files. Continue? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Restore cancelled"
  exit 0
fi

echo "Restoring DB from $DB_DUMP_FILE"
TMP_RESTORE_DUMP="/tmp/restore_${TIMESTAMP}.dump"
docker cp "$DB_DUMP_FILE" "$POSTGRES_CONTAINER:$TMP_RESTORE_DUMP"
docker exec -e PGPASSWORD="$DB_PASS" "$POSTGRES_CONTAINER" bash -lc \
  "dropdb -U '$DB_USER' -h '$DB_HOST' -p '$DB_PORT' '$DB_NAME' && createdb -U '$DB_USER' -h '$DB_HOST' -p '$DB_PORT' '$DB_NAME' && pg_restore -U '$DB_USER' -h '$DB_HOST' -p '$DB_PORT' -d '$DB_NAME' '$TMP_RESTORE_DUMP' && rm -f '$TMP_RESTORE_DUMP'"

echo "Restoring media from $MEDIA_ARCHIVE"
mkdir -p "$MEDIA_DIR"
find "$MEDIA_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
tar -xzf "$MEDIA_ARCHIVE" -C "$MEDIA_DIR"

echo "Restore complete"
