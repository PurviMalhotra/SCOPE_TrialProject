#!/usr/bin/env bash
# Load database connection settings.
# Windows Git Bash compatible — run scripts from Git Bash, not CMD/PowerShell.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
SCHEMA_DIR="${PROJECT_ROOT}/database/schema"

# Remember values set before this script (e.g. DB_USER=... ./init_db.sh)
_OVERRIDE_HOST="${DB_HOST:-}"
_OVERRIDE_PORT="${DB_PORT:-}"
_OVERRIDE_USER="${DB_USER:-}"
_OVERRIDE_PASSWORD="${DB_PASSWORD:-}"
_OVERRIDE_NAME="${DB_NAME:-}"

if [[ -f "${PROJECT_ROOT}/.env" ]]; then
    set -a
    # shellcheck source=/dev/null
    source "${PROJECT_ROOT}/.env"
    set +a
fi

[[ -n "${_OVERRIDE_HOST}" ]]     && DB_HOST="${_OVERRIDE_HOST}"
[[ -n "${_OVERRIDE_PORT}" ]]     && DB_PORT="${_OVERRIDE_PORT}"
[[ -n "${_OVERRIDE_USER}" ]]     && DB_USER="${_OVERRIDE_USER}"
[[ -n "${_OVERRIDE_PASSWORD}" ]] && DB_PASSWORD="${_OVERRIDE_PASSWORD}"
[[ -n "${_OVERRIDE_NAME}" ]]     && DB_NAME="${_OVERRIDE_NAME}"

export DB_HOST="${DB_HOST:-127.0.0.1}"
export DB_PORT="${DB_PORT:-5433}"
export DB_NAME="${DB_NAME:-scope_event_db}"
export DB_USER="${DB_USER:-postgres}"   # Windows default PostgreSQL user
export DB_PASSWORD="${DB_PASSWORD:-}"

export PGHOST="${DB_HOST}"
export PGPORT="${DB_PORT}"
export PGUSER="${DB_USER}"
export PGPASSWORD="${DB_PASSWORD}"
export PGDATABASE="${DB_NAME}"

# Windows: PostgreSQL is typically installed here.
# Adjust the version number if yours differs (e.g. 15, 16, 17).
PG_BIN_WIN="/c/Program Files/PostgreSQL/17/bin"
PG_BIN_WIN_ALT="/c/Program Files/PostgreSQL/16/bin"
PG_BIN_WIN_ALT2="/c/Program Files/PostgreSQL/15/bin"

if [[ -d "${PG_BIN_WIN}" ]]; then
    export PATH="${PG_BIN_WIN}:${PATH}"
elif [[ -d "${PG_BIN_WIN_ALT}" ]]; then
    export PATH="${PG_BIN_WIN_ALT}:${PATH}"
elif [[ -d "${PG_BIN_WIN_ALT2}" ]]; then
    export PATH="${PG_BIN_WIN_ALT2}:${PATH}"
fi
