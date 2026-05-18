#!/usr/bin/env bash
# Run smoke checks after init_db.
# Usage: ./database/scripts/verify.sh [database_name]

set -euo pipefail

DB_NAME="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=_pg_env.sh
source "${SCRIPT_DIR}/_pg_env.sh"

DB_NAME="${DB_NAME:-${PGDATABASE}}"
PSQL=(psql -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${DB_NAME}" -v ON_ERROR_STOP=1 -t -A)

run_check() {
    local label="$1"
    local sql="$2"
    local expected="$3"
    local actual
    actual="$("${PSQL[@]}" -c "${sql}")"
    if [[ "${actual}" == "${expected}" ]]; then
        echo "  OK  ${label} (${actual})"
    else
        echo "  FAIL ${label}: expected ${expected}, got ${actual}"
        exit 1
    fi
}

echo "Verifying database: ${DB_NAME}"
echo ""

run_check "faculty rows"          "SELECT COUNT(*)::text FROM faculty;"                 "3"
run_check "users rows"            "SELECT COUNT(*)::text FROM users;"                   "5"
run_check "event_requests rows"   "SELECT COUNT(*)::text FROM event_requests;"          "4"
run_check "workflow templates"    "SELECT COUNT(*)::text FROM workflow_step_templates;" "3"
run_check "workflow steps seeded" "SELECT COUNT(*)::text FROM approval_workflow_steps;" "12"
run_check "external schedule rows" "SELECT COUNT(*)::text FROM event_external_schedules;" "4"
run_check "completed schedules"   "SELECT COUNT(*)::text FROM event_external_schedules WHERE external_status = 'completed';" "1"
run_check "pending requests"      "SELECT COUNT(*)::text FROM event_requests WHERE status = 'pending';" "1"

echo ""
echo "Sample dashboard view:"
"${PSQL[@]}" -c "SELECT request_id, event_title, guest_lecture_type_label, course_code, event_date, status FROM v_my_event_requests ORDER BY request_id;"

echo ""
echo "All checks passed."
