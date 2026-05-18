#!/usr/bin/env bash
# Drop tables left over from older schema versions (e.g. lecture_details).
# Usage: ./database/scripts/cleanup_legacy.sh [database_name]

set -euo pipefail

DB_NAME="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_pg_env.sh
source "${SCRIPT_DIR}/_pg_env.sh"

DB_NAME="${DB_NAME:-${PGDATABASE}}"
LEGACY_SQL="${SCRIPT_DIR}/../schema/003_drop_legacy.sql"

PSQL=(psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${DB_NAME}" -v ON_ERROR_STOP=1)

echo "Cleaning legacy objects in: ${DB_NAME}"
"${PSQL[@]}" -f "${LEGACY_SQL}"
echo "Done. Run \\dt in psql to confirm lecture_details is gone."
