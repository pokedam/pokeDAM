DROP TABLE IF EXISTS user_profiles, tokens, users, profiles, company CASCADE;
DROP EXTENSION IF EXISTS pgcrypto;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE INDEX idx_profiles_company_id
ON profiles(company_id);
