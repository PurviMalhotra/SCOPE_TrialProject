-- Run on an existing database that still has old tables from earlier schema versions.
-- Usage: ./database/scripts/connect.sh faculty_event_system -f database/schema/003_drop_legacy.sql
--    or: psql -d faculty_event_system -f database/schema/003_drop_legacy.sql

DROP TABLE IF EXISTS lecture_details CASCADE;
