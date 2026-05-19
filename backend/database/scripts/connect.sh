#!/usr/bin/env bash
# Open psql session.
# Usage (Git Bash): ./database/scripts/connect.sh [database_name]

set -euo pipefail

DB_NAME="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_pg_env.sh
source "${SCRIPT_DIR}/_pg_env.sh"

DB_NAME="${DB_NAME:-${PGDATABASE}}"

if ! pg_isready -h "${PGHOST}" -p "${PGPORT}" -q 2>/dev/null; then
    echo "PostgreSQL not running on ${PGHOST}:${PGPORT}."
    echo "  Start it from Windows Services (services.msc) or: docker compose up -d"
    exit 1
fi

echo "Connecting: ${PGUSER}@${PGHOST}:${PGPORT}/${DB_NAME}"
exec psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${DB_NAME}"
