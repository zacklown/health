#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CRON_SCHEDULE="${CRON_SCHEDULE:-15 2 * * *}"
LOG_FILE="${LOG_FILE:-$BASE_DIR/backups/backup.log}"
BACKUP_SCRIPT="$BASE_DIR/scripts/backup-health.sh"
CRON_LINE="$CRON_SCHEDULE BACKUP_ROOT='$BASE_DIR/backups' RETENTION_DAYS='30' $BACKUP_SCRIPT >> '$LOG_FILE' 2>&1"

mkdir -p "$(dirname "$LOG_FILE")"

tmpfile="$(mktemp)"
if crontab -l >/dev/null 2>&1; then
  crontab -l | rg -v "backup-health\.sh" > "$tmpfile"
fi

echo "$CRON_LINE" >> "$tmpfile"
crontab "$tmpfile"
rm -f "$tmpfile"

echo "Installed backup cron entry:"
echo "$CRON_LINE"
