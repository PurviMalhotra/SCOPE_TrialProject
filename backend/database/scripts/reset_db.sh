#!/usr/bin/env bash
# Drop and recreate database (destructive).
# Usage (Git Bash): ./database/scripts/reset_db.sh [database_name]

set -euo pipefail

DB_NAME="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_pg_env.sh
source "${SCRIPT_DIR}/_pg_env.sh"

DB_NAME="${DB_NAME:-${PGDATABASE}}"

DROPDB=(dropdb -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}")

echo "WARNING: This will destroy all data in '${DB_NAME}'."
read -r -p "Are you sure? (yes/no): " confirm
if [[ "${confirm}" != "yes" ]]; then
    echo "Aborted."
    exit 0
fi

echo "Dropping database: ${DB_NAME}"
"${DROPDB[@]}" --if-exists "${DB_NAME}"

exec "${SCRIPT_DIR}/init_db.sh" "${DB_NAME}"
