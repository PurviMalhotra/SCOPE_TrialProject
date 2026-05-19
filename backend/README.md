# SCOPE Event Management Backend

Backend application layer for the existing SCOPE event request approval system.

This backend is intentionally shaped around the existing frontend contract and the existing resume parser modules. It does not define a PostgreSQL schema or migrations; database persistence is isolated behind repository modules for the DB team to replace.

## Architecture

The application follows:

```txt
Route -> Controller -> Service -> Repository
```

- Routes define endpoints and attach middleware.
- Controllers handle HTTP request/response only.
- Services contain workflow and business logic.
- Repositories are persistence contracts/placeholders.
- Parser internals are preserved in `src/services/pdfParserService.js` and `src/services/geminiService.js`.

## Notes For Frontend Integration

The frontend currently keeps event requests in React context. When wiring API calls, the lowest-friction replacement is:

- Replace initial `INITIAL_REQUESTS` usage with `GET /api/event-requests`.
- Replace `addRequest(formData)` with `POST /api/event-requests`.
- Replace `updateRequest(id, formData)` with `PUT /api/event-requests/:id`.
- Replace `deleteRequest(id)` with `DELETE /api/event-requests/:id`.
- Upload actual files through `POST /api/uploads`, then store returned metadata or filenames in `formData.files`.

No frontend changes are required for the backend to start locally.

