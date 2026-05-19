# SCOPE Event Management Backend

Backend application layer for the existing SCOPE event request approval system.

This backend is intentionally shaped around the existing frontend contract and the existing resume parser modules. Event requests now persist through PostgreSQL, while repository modules still isolate database access from controllers and services.

## Architecture

The application follows:

```txt
Route -> Controller -> Service -> Repository
```

- Routes define endpoints and attach middleware.
- Controllers handle HTTP request/response only.
- Services contain workflow and business logic.
- Repositories contain persistence access and keep SQL out of controllers/services.
- Parser internals are preserved in `src/services/pdfParserService.js` and `src/services/geminiService.js`.



