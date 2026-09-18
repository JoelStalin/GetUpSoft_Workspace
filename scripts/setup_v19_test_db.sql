--
-- V19 ORCA Extension Modules - Test Database Setup
-- Purpose: Create and initialize test database for v19 ORCA module testing
-- Usage: psql -U odoo -d postgres -f setup_v19_test_db.sql
--

-- Drop existing test database if it exists
DROP DATABASE IF EXISTS test_v19_orca;

-- Create test database
CREATE DATABASE test_v19_orca TEMPLATE template0 ENCODING 'UTF8' LC_COLLATE 'C' LC_CTYPE 'C';

-- Grant permissions to odoo user
ALTER DATABASE test_v19_orca OWNER TO odoo;

-- Connect to new database
\c test_v19_orca

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "hstore";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant schema permissions
GRANT ALL PRIVILEGES ON SCHEMA public TO odoo;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO odoo;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO odoo;

-- Log completion
SELECT 'Test database test_v19_orca created successfully' AS status;
