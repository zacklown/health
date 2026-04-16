#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_ROOT="${BACKUP_ROOT:-$BASE_DIR/backups}"
CMS_ENV_FILE="${CMS_ENV_FILE:-$BASE_DIR/apps/cms/health-cms/.env.production.local}"
MEDIA_DIR="${MEDIA_DIR:-$BASE_DIR/apps/cms/health-cms/media}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-health-postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
ALLOW_EMPTY_MEDIA_BACKUP="${ALLOW_EMPTY_MEDIA_BACKUP:-0}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"

DB_DIR="$BACKUP_ROOT/db"
MEDIA_BACKUP_DIR="$BACKUP_ROOT/media"
MANIFEST_DIR="$BACKUP_ROOT/manifests"
mkdir -p "$DB_DIR" "$MEDIA_BACKUP_DIR" "$MANIFEST_DIR"

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

if [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
  echo "ERROR: Could not parse DB user/database from DATABASE_URL" >&2
  exit 1
fi

if ! docker ps --format '{{.Names}}' | rg -x "$POSTGRES_CONTAINER" >/dev/null 2>&1; then
  echo "ERROR: Postgres container '$POSTGRES_CONTAINER' is not running" >&2
  exit 1
fi

DB_DUMP_FILE="$DB_DIR/payload_prod_${TIMESTAMP}.dump"
DB_SHA_FILE="$DB_DUMP_FILE.sha256"
MEDIA_ARCHIVE="$MEDIA_BACKUP_DIR/media_${TIMESTAMP}.tar.gz"
MEDIA_SHA_FILE="$MEDIA_ARCHIVE.sha256"
MANIFEST_FILE="$MANIFEST_DIR/backup_${TIMESTAMP}.txt"

TMP_DB_DUMP="/tmp/payload_backup_${TIMESTAMP}.dump"

echo "Backing up database '$DB_NAME' from container '$POSTGRES_CONTAINER'..."
docker exec -e PGPASSWORD="$DB_PASS" "$POSTGRES_CONTAINER" \
  pg_dump -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -F c -f "$TMP_DB_DUMP"
docker cp "$POSTGRES_CONTAINER:$TMP_DB_DUMP" "$DB_DUMP_FILE"
docker exec "$POSTGRES_CONTAINER" rm -f "$TMP_DB_DUMP"
sha256sum "$DB_DUMP_FILE" > "$DB_SHA_FILE"

echo "Backing up media directory '$MEDIA_DIR'..."
if [ ! -d "$MEDIA_DIR" ]; then
  echo "ERROR: Media directory not found: $MEDIA_DIR" >&2
  exit 1
fi
MEDIA_FILE_COUNT="$(find "$MEDIA_DIR" -type f | wc -l | tr -d ' ')"
if [ "$MEDIA_FILE_COUNT" = "0" ] && [ "$ALLOW_EMPTY_MEDIA_BACKUP" != "1" ]; then
  echo "ERROR: Media directory is empty. Refusing backup to avoid false sense of safety." >&2
  echo "Set ALLOW_EMPTY_MEDIA_BACKUP=1 to override." >&2
  exit 1
fi
tar -czf "$MEDIA_ARCHIVE" -C "$MEDIA_DIR" .
sha256sum "$MEDIA_ARCHIVE" > "$MEDIA_SHA_FILE"

{
  echo "timestamp=$TIMESTAMP"
  echo "db_dump=$(basename "$DB_DUMP_FILE")"
  echo "db_sha256=$(cut -d' ' -f1 "$DB_SHA_FILE")"
  echo "db_size_bytes=$(wc -c < "$DB_DUMP_FILE")"
  echo "media_archive=$(basename "$MEDIA_ARCHIVE")"
  echo "media_sha256=$(cut -d' ' -f1 "$MEDIA_SHA_FILE")"
  echo "media_size_bytes=$(wc -c < "$MEDIA_ARCHIVE")"
  echo "media_file_count=$MEDIA_FILE_COUNT"
} > "$MANIFEST_FILE"

find "$DB_DIR" -type f -name '*.dump' -mtime +"$RETENTION_DAYS" -delete
find "$DB_DIR" -type f -name '*.sha256' -mtime +"$RETENTION_DAYS" -delete
find "$MEDIA_BACKUP_DIR" -type f -name 'media_*.tar.gz' -mtime +"$RETENTION_DAYS" -delete
find "$MEDIA_BACKUP_DIR" -type f -name 'media_*.tar.gz.sha256' -mtime +"$RETENTION_DAYS" -delete
find "$MANIFEST_DIR" -type f -name 'backup_*.txt' -mtime +"$RETENTION_DAYS" -delete

echo "Backup complete:"
echo "- $DB_DUMP_FILE"
echo "- $MEDIA_ARCHIVE"
echo "- $MANIFEST_FILE"
