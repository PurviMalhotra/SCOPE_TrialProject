// =============================================================================
// repositories/requestHistoryRepository.js
//
// PostgreSQL-backed persistence for request audit history.
// Replaces the previous in-memory (array) implementation.
//
// Preserved interface:
//   create(entry)              → inserts a history record, returns the record
//   listByRequestId(requestId) → returns all history entries for a request
//
// Entry shape accepted from eventRequestService.js:
//   { requestId, action, status, fromStatus?, comment?, actorId, actorEmail }
// =============================================================================

const { query } = require("../../database/db");

/**
 * Maps a raw DB row to the camelCase shape expected by the service layer.
 * Preserves the same field names that the old in-memory implementation returned.
 */
const toRecord = (row) => ({
  id:         row.history_id,
  requestId:  row.request_id,
  action:     row.action,
  fromStatus: row.from_status  ?? undefined,
  status:     row.status       ?? undefined,
  comment:    row.comment      ?? undefined,
  actorId:    row.actor_id     ?? undefined,
  actorEmail: row.actor_email  ?? undefined,
  createdAt:  row.created_at instanceof Date
                ? row.created_at.toISOString()
                : row.created_at,
});

/**
 * Persist a new history entry.
 *
 * @param {object} entry
 * @param {number|string} entry.requestId
 * @param {string}        entry.action       - CREATED | UPDATED | DELETED | APPROVED | REJECTED
 * @param {string}        [entry.fromStatus]
 * @param {string}        [entry.status]
 * @param {string}        [entry.comment]
 * @param {string|number} [entry.actorId]
 * @param {string}        [entry.actorEmail]
 * @returns {Promise<object>} The persisted history record
 */
const create = async (entry) => {
  const result = await query(
    `INSERT INTO request_history
       (request_id, action, from_status, status, comment, actor_id, actor_email)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      entry.requestId   ?? null,
      entry.action      ?? null,
      entry.fromStatus  ?? null,
      entry.status      ?? null,
      entry.comment     ?? null,
      entry.actorId     != null ? String(entry.actorId) : null,
      entry.actorEmail  ?? null,
    ]
  );

  return toRecord(result.rows[0]);
};

/**
 * Retrieve all history entries for a given request, newest first.
 *
 * @param {number|string} requestId
 * @returns {Promise<object[]>}
 */
const listByRequestId = async (requestId) => {
  const result = await query(
    `SELECT * FROM request_history
     WHERE request_id = $1
     ORDER BY created_at DESC, history_id DESC`,
    [requestId]
  );

  return result.rows.map(toRecord);
};

module.exports = {
  create,
  listByRequestId,
};
