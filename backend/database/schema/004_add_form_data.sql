-- Store full frontend form payload for edit/view round-trips
ALTER TABLE event_requests
    ADD COLUMN IF NOT EXISTS form_data JSONB;

CREATE INDEX IF NOT EXISTS idx_event_requests_form_data ON event_requests USING gin (form_data);
