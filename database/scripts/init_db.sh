#!/usr/bin/env bash
# Create database and apply schema + seed.
# Usage: ./database/scripts/init_db.sh [database_name]

set -euo pipefail

DB_NAME="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_pg_env.sh
source "${SCRIPT_DIR}/_pg_env.sh"

DB_NAME="${DB_NAME:-${PGDATABASE}}"

PSQL=(psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}")
CREATEDB=(createdb -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}")

echo "Project:  ${PROJECT_ROOT}"
echo "Schema:   ${SCHEMA_DIR}"
echo "Database: ${DB_NAME}"
echo "Host:     ${PGHOST}:${PGPORT} (user=${PGUSER})"
echo ""

if ! command -v psql >/dev/null 2>&1; then
    echo "psql not found. Install PostgreSQL or use: docker compose up -d"
    exit 1
fi

if ! pg_isready -h "${PGHOST}" -p "${PGPORT}" -q 2>/dev/null; then
    echo "PostgreSQL is not running on ${PGHOST}:${PGPORT}."
    echo "  Docker:  docker compose up -d"
    echo "  macOS:   brew services start postgresql@18"
    exit 1
fi

echo "Testing connection..."
if ! "${PSQL[@]}" -d postgres -c "SELECT 1;" >/dev/null; then
    echo "Connection failed. Check .env (copy from .env.example)."
    exit 1
fi

echo "Creating database: ${DB_NAME}"
"${CREATEDB[@]}" "${DB_NAME}" 2>/dev/null || echo "  (database may already exist)"

echo "Applying schema..."
"${PSQL[@]}" -v ON_ERROR_STOP=1 -d "${DB_NAME}" -f "${SCHEMA_DIR}/001_schema.sql"

echo "Loading seed data..."
"${PSQL[@]}" -v ON_ERROR_STOP=1 -d "${DB_NAME}" -f "${SCHEMA_DIR}/002_seed.sql"

echo ""
echo "Done. Verify with:"
echo "  ./database/scripts/verify.sh ${DB_NAME}"
echo "  ./database/scripts/connect.sh ${DB_NAME}"
