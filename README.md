# health

Nutrition and metabolic health website frontend and cms

See [BACKUPS.md](BACKUPS.md) for backup/restore automation.

## GitHub Auto-Deploy

This repo can auto-deploy to production using GitHub Actions on every push to `main`.

1. In GitHub, open `Settings > Secrets and variables > Actions` and create:
   - `PROD_HOST`: server hostname or IP
   - `PROD_USER`: SSH user on production server
   - `PROD_SSH_KEY`: private key (PEM/OpenSSH) used by GitHub Actions
   - `PROD_SSH_PORT`: optional SSH port (defaults to `22`)
2. Ensure the matching public key is in `<prod-user>/.ssh/authorized_keys` on the server.
3. Ensure this repo exists at `/home/zackl/servers/health/health` on the server.
4. Push to `main` (or run the `Deploy Production` workflow manually).

The workflow file is `.github/workflows/deploy-prod.yml`.
