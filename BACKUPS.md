# Health Site Backups

This backup system protects both parts of Payload media state:

- Postgres metadata/content (`payload_prod`)
- CMS upload files (`apps/cms/health-cms/media`)

## Scripts

- `scripts/backup-health.sh`
  - Creates:
    - `backups/db/payload_prod_<timestamp>.dump`
    - `backups/media/media_<timestamp>.tar.gz`
    - checksum files (`.sha256`)
    - `backups/manifests/backup_<timestamp>.txt`
  - Prunes files older than `RETENTION_DAYS` (default `30`).
  - Fails if media directory is empty (`ALLOW_EMPTY_MEDIA_BACKUP=1` to override).

- `scripts/verify-health-backups.sh`
  - Fails if latest DB/media backups are older than `MAX_BACKUP_AGE_HOURS` (default `26`).
  - Verifies checksums.
  - Fails if latest backup manifest reports `media_file_count=0` (`ALLOW_EMPTY_MEDIA_BACKUP=1` to override).

- `scripts/install-health-backup-cron.sh`
  - Installs daily cron job at `02:15` by default.

- `scripts/restore-health.sh <timestamp>`
  - Restores both DB and media from one backup timestamp.
  - Prompts before destructive restore.

## One-time setup

From repo root:

```bash
./scripts/backup-health.sh
./scripts/verify-health-backups.sh
./scripts/install-health-backup-cron.sh
```

Check cron:

```bash
crontab -l | rg backup-health.sh
```

## Useful overrides

```bash
BACKUP_ROOT=/path/to/backups RETENTION_DAYS=45 ./scripts/backup-health.sh
MAX_BACKUP_AGE_HOURS=30 ./scripts/verify-health-backups.sh
CRON_SCHEDULE='0 3 * * *' ./scripts/install-health-backup-cron.sh
ALLOW_EMPTY_MEDIA_BACKUP=1 ./scripts/backup-health.sh
```

## Restore

```bash
# choose timestamp from backups/db or backups/media filenames
./scripts/restore-health.sh 20260416T070239Z
```

## Notes

- Media persistence is mounted in Docker compose:
  - `./apps/cms/health-cms/media:/app/apps/cms/health-cms/media`
- Backups should also be copied off-machine (S3/NAS/remote) for disaster recovery.
