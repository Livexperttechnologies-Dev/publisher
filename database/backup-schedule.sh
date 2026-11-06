#!/bin/bash
# ==============================================================================
# KIBO360 ENTERPRISE ERP - AUTOMATED PRODUCTION BACKUP & OFF-SITE SYNC
# Runs via cron: 0 2 * * * /var/kibo360/database/backup-schedule.sh
# ==============================================================================

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/kibo360/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DB_NAME="${DB_NAME:-kibo360_prod}"
DB_USER="${DB_USER:-kibo_admin}"
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-kibo360_aes256_master_key_2026}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/kibo360_${DB_NAME}_${TIMESTAMP}.sql.gz"
ENC_BACKUP_FILE="${BACKUP_FILE}.enc"
SHA256_FILE="${BACKUP_FILE}.sha256"

mkdir -p "${BACKUP_DIR}"

echo "[$(date -u +%FT%TZ)] [INFO] Starting KIBO360 Production Backup for Database: ${DB_NAME}"

# Step 1: Export compressed PostgreSQL dump
export PGPASSWORD="${DB_PASSWORD:-SecretProdP@ss2026}"
pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -F c -b -v -f "${BACKUP_FILE}"

# Step 2: Encrypt snapshot with AES-256-CBC
openssl enc -aes-256-cbc -salt -in "${BACKUP_FILE}" -out "${ENC_BACKUP_FILE}" -k "${ENCRYPTION_KEY}" -pbkdf2
rm -f "${BACKUP_FILE}" # Remove unencrypted raw dump

# Step 3: Compute Cryptographic SHA-256 Integrity Digest
sha256sum "${ENC_BACKUP_FILE}" > "${SHA256_FILE}"
echo "[$(date -u +%FT%TZ)] [INFO] Encrypted snapshot generated: ${ENC_BACKUP_FILE} (SHA-256: $(cat "${SHA256_FILE}"))"

# Step 4: Optional AWS S3 Cloud Sync
if [ -n "${AWS_S3_BACKUP_BUCKET:-}" ]; then
    echo "[$(date -u +%FT%TZ)] [INFO] Syncing backup to secure cloud bucket: s3://${AWS_S3_BACKUP_BUCKET}/"
    aws s3 cp "${ENC_BACKUP_FILE}" "s3://${AWS_S3_BACKUP_BUCKET}/daily/" --sse AES256
    aws s3 cp "${SHA256_FILE}" "s3://${AWS_S3_BACKUP_BUCKET}/daily/"
fi

# Step 5: Prune backups older than retention window
echo "[$(date -u +%FT%TZ)] [INFO] Pruning local backups older than ${RETENTION_DAYS} days"
find "${BACKUP_DIR}" -type f -name "kibo360_*.enc" -mtime +"${RETENTION_DAYS}" -delete
find "${BACKUP_DIR}" -type f -name "kibo360_*.sha256" -mtime +"${RETENTION_DAYS}" -delete

echo "[$(date -u +%FT%TZ)] [SUCCESS] KIBO360 Backup routine completed successfully."
