#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_ROOT="${BACKUP_ROOT:-$BASE_DIR/backups}"
MAX_BACKUP_AGE_HOURS="${MAX_BACKUP_AGE_HOURS:-26}"
MEDIA_DIR="${MEDIA_DIR:-$BASE_DIR/apps/cms/health-cms/media}"
ALLOW_EMPTY_MEDIA_BACKUP="${ALLOW_EMPTY_MEDIA_BACKUP:-0}"

DB_DIR="$BACKUP_ROOT/db"
MEDIA_BACKUP_DIR="$BACKUP_ROOT/media"

LATEST_DB_DUMP="$(ls -1t "$DB_DIR"/*.dump 2>/dev/null | head -n1 || true)"
LATEST_MEDIA_ARCHIVE="$(ls -1t "$MEDIA_BACKUP_DIR"/media_*.tar.gz 2>/dev/null | head -n1 || true)"

if [ -z "$LATEST_DB_DUMP" ] || [ -z "$LATEST_MEDIA_ARCHIVE" ]; then
  echo "ERROR: Missing backups in $BACKUP_ROOT" >&2
  exit 1
fi

NOW_EPOCH="$(date +%s)"
DB_EPOCH="$(stat -c %Y "$LATEST_DB_DUMP")"
MEDIA_EPOCH="$(stat -c %Y "$LATEST_MEDIA_ARCHIVE")"
MAX_AGE_SECS="$((MAX_BACKUP_AGE_HOURS * 3600))"

if [ "$((NOW_EPOCH - DB_EPOCH))" -gt "$MAX_AGE_SECS" ]; then
  echo "ERROR: Latest DB backup is older than ${MAX_BACKUP_AGE_HOURS}h" >&2
  exit 1
fi

if [ "$((NOW_EPOCH - MEDIA_EPOCH))" -gt "$MAX_AGE_SECS" ]; then
  echo "ERROR: Latest media backup is older than ${MAX_BACKUP_AGE_HOURS}h" >&2
  exit 1
fi

sha256sum -c "$LATEST_DB_DUMP.sha256" >/dev/null
sha256sum -c "$LATEST_MEDIA_ARCHIVE.sha256" >/dev/null

if [ ! -d "$MEDIA_DIR" ]; then
  echo "ERROR: Media directory not found: $MEDIA_DIR" >&2
  exit 1
fi

LATEST_MANIFEST="$(ls -1t "$BACKUP_ROOT"/manifests/backup_*.txt 2>/dev/null | head -n1 || true)"
if [ -n "$LATEST_MANIFEST" ]; then
  MEDIA_FILE_COUNT="$(sed -n 's/^media_file_count=//p' "$LATEST_MANIFEST" | tail -n1)"
  if [ "${MEDIA_FILE_COUNT:-0}" = "0" ] && [ "$ALLOW_EMPTY_MEDIA_BACKUP" != "1" ]; then
    echo "ERROR: Latest manifest reports media_file_count=0" >&2
    exit 1
  fi
  echo "- latest_manifest=$LATEST_MANIFEST"
  echo "- media_file_count=${MEDIA_FILE_COUNT:-unknown}"
fi

echo "Backup verification passed"
echo "- latest_db_backup=$LATEST_DB_DUMP"
echo "- latest_media_backup=$LATEST_MEDIA_ARCHIVE"
